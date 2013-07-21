////////////////
//	NATIVES
////////////////
	var express = require("express"),
		http = require("http"),
		path = require("path"),
		RedisStore = require("connect-redis")(express);


////////////////
//	GLOBALS
////////////////
	global.app = {};
	global.server = express();
	global.log = console.log;
	global.when = require("when");


////////////////
//	MODULES
////////////////
	var appLoader = when.defer();
	var resource = require("./internal/resource");

	app.loader = appLoader.promise;
	app.services = resource.load("services");
	app.controllers = resource.load("controllers");

	app.config = require("./internal/config");

	app.util = require("./internal/util");
	global.Time = app.util.Time;
	app.router = require("./internal/router");

	app.Controller = require("./internal/Controller");
	app.Model = require("./internal/Model");

	app.models = resource.load("models");

	// Lets us access an instance of a model, for convenience.
	app.db = new app.Model();


////////////////
//	SETUP
////////////////
	server
		.set("views", __dirname + "/external/views")
		.set("view engine", "html")
		.engine("html", require("hbs").__express)
		.use(express.compress())
		.use(express.favicon())
		.use(express.bodyParser())
		.use(express.methodOverride())
		.use(express.cookieParser())
		.use(express.session({
			secret: "Shh! It's a secret.",
			store: new RedisStore()
		}))
		.use(require("stylus").middleware({
			src: __dirname + "/external/private",
			dest: __dirname + "/external/public",
			compress: true,
			debug: true
		}))
		.use(express.static(__dirname + "/external/public"))
		.use(server.router)
		.use(function(req, res) {
			// Set variables for views.
			res.locals({
				req,
				session: req.session,
				params: req.params
			});

			if (req.xhr) {
				res.json("error");
			} else {
				res.render("error");
			}
		});

	// Environment-specific config.
	server
		// All environments.
		.configure(function() {
			log(server.get("env"))
		})
		// Dev environment.
		.configure("development", function() {
			// Make the console pretty.
			require("consoleplusplus");

			// Log all the things.
			server.use(express.logger("dev"));
			console.setLevel(console.LEVELS.DEBUG);

			// Exit with an error code on any uncaught exception.
			process.on("uncaughtException", function(err) {
				console.error("Caught exception:", err.message);
				console.error(err.stack);
				process.exit(1);
			});
		})
		// Production environment.
		.configure("production", function() {
			// Log some of the things.
			console.setLevel(console.LEVELS.WARN);

			// Bury any uncaught exceptions. For the children. (Think of the children...)
			process.on("uncaughtException", function(err) {
				console.error("Caught exception:", err.message);
				console.error(err.stack);
			});
		});


////////////////
//	START
////////////////
	var start = function() {
		require("./external/bootstrap");

		http.createServer(server).listen(server.get("port"), function() {
			console.info("Framework listening at http://%s:%d [%s]", "localhost", server.get("port"), server.get("env"));
		});

		// Now that all the resources have been loaded,
		// run all code that depends on them.
		appLoader.resolve();
	};

exports.start = start;
