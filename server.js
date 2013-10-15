////////////////
//	NATIVES
////////////////
	var express = require("express"),
		http = require("http"),
		path = require("path"),
		hbs = require("hbs"),
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
	global.hbs = hbs;

////////////////
//	MODULES
////////////////

	// control when the app is done loading
	var appLoader = when.defer();
	app.loader = appLoader.promise;

	// app directories
	var {external, internal} = app.dirs = {
		external: path.resolve(),
		internal: path.join(__dirname, "/internal")
	};

	// config
	app.config = require(`${internal}/config`);

	// get util, define time
	app.util = require(`${internal}/util`);
	global.Time = app.util.Time;

	// get all our controllers
	app.controllers = app.util.loader.dirSync("controllers", {
		reduce: false
	}).reduce((files, file) => {
		files[file.name] = file.exports;
		return files;
	}, {});

	// get the router
	app.router = require(`${internal}/router`);
	// get the controller
	app.Controller = require(`${internal}/Controller`);
	// the model
	app.Model = require(`${internal}/Model`);
	// all the models
	app.models = app.util.loader.dirSync("models", {reduce: false})
		.reduce(function(files, file) {
			files[file.name] = new file.exports(file.name);
			return files;
		}, {})
	;

	// Lets us access an instance of a model, for convenience.
	app.db = new app.Model();


/////////////////////////////
//	ENVIROMENT SPECIFIC STUFF
////////////////////////////
	var props = {};
	server
		.configure("production", function() {

			// cache to one day
			props = {maxAge: 100 * 60 * 60 * 24};

			// set production console level
			console.setLevel(console.LEVELS.WARN);

			// Bury any uncaught exceptions. For the children. (Think of the children...)
			process.on("uncaughtException", function(err) {
				console.error("Caught exception:", err.message);
				console.error(err.stack);
			});
		})
		.configure("development", function() {
			// no cache for dev
			props =  {maxAge: 0};

			// Log all the things.
			//server.use(express.logger("dev"));
			console.setLevel(console.LEVELS.DEBUG);

			// Exit with an error code on any uncaught exception.
			process.on("uncaughtException", function(err) {
				console.error("Caught exception:", err.message);
				console.error(err.stack);
				process.exit(1);
			});

		})
	;

	// static location
	var statics = express.static(`${external}/public`,props);
	// use static location
	server.use(statics);

////////////////
//	SETUP
////////////////
	server
		.set("views", `${external}/views`)
		.set("view engine", "html")
		.engine("html", hbs.__express)
		.use(express.compress())
		.use(express.favicon())
		.use(express.bodyParser())
		.use(express.methodOverride())
		.use(express.cookieParser())
		.use(express.session({
			secret: "Shh! It's a secret.",
			store: new RedisStore()
		}))

		// we shouldn't run this every time :(
		.use(require("stylus").middleware({
			src: `${external}/private`,
			dest: `${external}/public`,
			compress: true,
			debug: true
		}))
		// Send all view-or-API requests through a pipe,
		// extending req/res as needed.
		.use(app.router.pipe)
		// Bind all express routes. (index and controllers)
		.use(server.router)
		// We are now at the end of the pipeline.
		// A route has not been found, so throw an error.
		// we need to make this extensible
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

	// server stylus var for custom stylus things
	server.stylus = {};

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
