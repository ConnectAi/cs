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


////////////////
//	SETUP
////////////////
	server
		.set("name", "[framework]")
		.set("views", __dirname + "/external/views")
		.set("view engine", "html")
		.engine("html", require("hbs").__express)
		.use(express.favicon())
		// .use(express.logger('dev'))
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
		.use(function(req, res, next) {
			// Extending req.
			req.checkFields = function(fields) {
				if(fields.some(function(field) {
					if(!(field in req.body)) {
						res.error(field + " is required");
						return true;
					}
				})) return false;
				return req.body;
			};

			// Extending res.
			res.view = function(path = route.view, data = {}) {
				if (typeof path === "object") {
					data = path;
					path = route.view;
				}
				res.render(path, data);
			};

			res.console = function(...args) {
				var html =
					`<script>console.log(
						${args.map((arg) => JSON.stringify(arg))}
					);</script>`;
				res.send(html);
			};

			res.error = function(msg, code = 400) {
				res.send(code,msg);
				res.end();
			};

			// Set variables for views.
			res.locals({
				req,
				res,

				session: req.session,
				params: req.params
			});

			next();
		})
		.use(function(req, res) {
			res.render("error");
		});

	//	Run in passed-in environment.
	//	Defaults to "development".
	if (process.argv.length === 3) {
		server.set("env", process.argv[2]);
	}

	// add Q.when
	Q.when = function(...args) {
		return Q.all(args);
	}


////////////////
//	MODULES
////////////////
	var appLoader = Q.defer();
	var resource = require("./internal/resource");

	app.loader = appLoader.promise;
	app.services = resource.load("services");

	app.config = require("./internal/config");
	server.set("port", app.config.port || process.env.PORT || 3000);

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
