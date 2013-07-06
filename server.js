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
	global.Q = require("q");

	// add Q.when
	Q.when = function(...args) {
		return Q.all(args);
	};


////////////////
//	SETUP
////////////////
	//	Run in passed-in environment.
	//	Defaults to "development".
	if (process.argv.length === 3) {
		server.set("env", process.argv[2]);
	}

	server
		.set("views", __dirname + "/external/views")
		.set("view engine", "html")
		.engine("html", require("hbs").__express)
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
				res,
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
		})
		// Dev environment.
		.configure("development", function() {
			server.use(express.logger("dev"));

			// Exit with an error code on any uncaught exception.
			process.on("uncaughtException", function(err) {
				console.error("Caught exception:", err.message);
				console.error(err.stack);
				process.exit(1);
			});
		})
		// Production environment.
		.configure("production", function() {
			// Bury any uncaught exceptions. For the children. (Think of the children...)
			process.on("uncaughtException", function(err) {
				console.error("Caught exception:", err.message);
				console.error(err.stack);
			});
		});


////////////////
//	MODULES
////////////////
	var appLoader = Q.defer();
	var resource = require("./internal/resource");

	app.loader = appLoader.promise;
	app.services = resource.load("services");

	app.config = require("./internal/config");

	app.utilities = require("./internal/utilities");
	app.router = require("./internal/router");

	app.Controller = require("./internal/Controller");
	app.Model = require("./internal/Model");

	app.controllers = resource.load("controllers");
	app.models = resource.load("models");

	// Lets us access an instance of a model, for convenience.
	app.db = new app.Model();


////////////////
//	BOOTSTRAP
////////////////
	(function(){
	})();


////////////////
//	START
////////////////
	var start = function() {
		http.createServer(server).listen(server.get("port"), function() {
			log("Framework listening at http://%s:%d [%s]", "localhost", server.get("port"), server.get("env"));
		});

		// Now that all the resources have been loaded,
		// run all code that depends on them.
		appLoader.resolve();
	};

exports.start = start;
