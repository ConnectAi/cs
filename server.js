////////////////
//	NATIVES
////////////////
	var express = require("express"),
		http = require("http"),
		path = require("path"),
		hbs = require("hbs"),
		stylus = require("stylus"),
		fs = require("fs"),
		nib = require("nib");
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

	// cache
	app.CACHE = {};

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
//	SERVICES
////////////////////////////
app.services = {};
fs.readdirSync("services").forEach( (item) => {
	app.services[item] = require(`${external}/services/${item}`);
});


/////////////////////////////
//	ENVIROMENT SPECIFIC
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


////////////////
//	NIB
////////////////
	var compile = function(str, path) {
		return stylus(str)
			.set('filename', path)
			.set('compress', true)
			.use(nib())
			.import('nib');
	};


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
		.use(express.session(
			(function() {
				var stores = require(`${internal}/modules/session`);

				let store = { secret: "Shh! It's a secret." };
				if (app.config.session in stores) store = stores[app.config.session](store);
				return store;
			})()
		))
		.use(stylus.middleware({
			src: `${external}/private`,
			dest: `${external}/public`,
			compress: true,
			debug: true,
			compile: compile
		}))
		.use((function() {
			var busters = require(`${internal}/modules/cache`).busters;

			let buster = "none";
			if (app.config.cacheBuster in busters) buster = app.config.cacheBuster;
			return busters[buster];
		})())
		.use(express.static(`${external}/public`, props))
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
	process.title = "cornerstone";

	var start = function() {
		let listener = http.createServer(server).listen(server.get("port"), function() {
			console.info("Cornerstone listening at http://%s:%d [%s]", "localhost", server.get("port"), server.get("env"));
		});

		if (app.config.sockets) {
			server.io = require("socket.io").listen(listener);
			server.io.set("log level", 0);
		}

		require(`${app.dirs.external}/app`);

		// Now that all the resources have been loaded,
		// run all code that depends on them.
		appLoader.resolve();
	};

exports.start = start;
