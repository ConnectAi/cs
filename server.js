////////////////
//	NATIVES
////////////////
	var express = require("express"),
		http = require("http"),
		path = require("path"),
		RedisStore = require("connect-redis")(express);
	// Make the console pretty.
	require("consoleplusplus");


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

	app.dirs = {
		external: path.resolve(),
		internal: path.join(__dirname, "/internal")
	};
	app.util = require(`${app.dirs.internal}/util`);

	app.loader = appLoader.promise;
	app.controllers = app.util.loader.dirSync("controllers", {reduce: false})
		.reduce((files, file) => {
			files[file.name] = file.exports;
			files[file.name].name = file.name;
			return files;
		}, {});

	app.config = require(`${app.dirs.internal}/config`);

	global.Time = app.util.Time;
	app.router = require(`${app.dirs.internal}/router`);

	app.Controller = require(`${app.dirs.internal}/Controller`);
	app.Model = require(`${app.dirs.internal}/Model`);

	app.models = app.util.loader.dirSync("models", {reduce: false})
		.reduce(function(files, file) {
			files[file.name] = new file.exports(file.name);
			return files;
		}, {});

	// Lets us access an instance of a model, for convenience.
	app.db = new app.Model();


////////////////
//	SETUP
////////////////
	server
		.set("views", `${app.dirs.external}/views`)
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
			src: `${app.dirs.external}/private`,
			dest: `${app.dirs.external}/public`,
			compress: true,
			debug: true
		}))
		// Setup static resources, and optional caching.
		.configure(function() {
			// If in production, cache the static resources.
			if (server.get("env") === "production") {
				server.use(express.static(`${app.dirs.external}/public`, {
					maxAge: 100 * 60 * 60 * 24    // one day
				}));
			// If in development, disable cache.
			} else if (server.get("env") === "development") {
				server.use(express.static(`${app.dirs.external}/public`, {
					maxAge: 0
				}))
			// Otherwise use the default cache settings.
			} else {
				server.use(express.static(`${app.dirs.external}/public`))
			}
		})
		// Send all view-or-API requests through a pipe,
		// extending req/res as needed.
		.use(app.router.pipe)
		// Bind all express routes.
		.use(server.router)
		// We are now at the end of the pipeline.
		// A route has not been found, so throw an error.
		.use(function(req, res) {
			res.status(404);
			if (req.xhr) {
				res.json("error");
			} else {
				res.render("error", {
					status: 404
				});
			}
		})
	;

	// Environment-specific config.
	server
		// All environments.
		.configure(function() {
		})
		// Dev environment.
		.configure("development", function() {
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
		require(`${app.dirs.external}/bootstrap`);

		http.createServer(server).listen(server.get("port"), function() {
			console.info("Framework listening at http://%s:%d [%s]", "localhost", server.get("port"), server.get("env"));
		});

		// Now that all the resources have been loaded,
		// run all code that depends on them.
		appLoader.resolve();
	};

exports.start = start;
