////////////////
//	NATIVES
////////////////

let express = require("express"),
	http = require("http"),
	path = require("path"),
	hbs = require("hbs"),
	stylus = require("stylus"),
	fs = require("fs"),
	EventEmitter = require("events").EventEmitter,
	nib = require("nib");
// Make the console pretty.
require("consoleplusplus");

////////////////
//	GLOBALS
////////////////

// app can fire off app-wide events, like when it is started.
global.app = new EventEmitter();
global.server = express();
global.log = console.log;
global.hbs = hbs;
/* globals app, server, log, hbs */


////////////////
//	MODULES
////////////////

// app directories
app.dirs = {
	external: path.resolve(),
	internal: path.join(__dirname, "/internal")
};
let { external, internal } = app.dirs;

// config
app.config = require(`${internal}/config`);

// cache
app.CACHE = {};

// get util, define time
app.util = require(`${internal}/util`);
global.Time = app.util.Time;

// get all our controllers
app.controllers = app.util.loader.dirSync("controllers", { reduce: false })
	.reduce((files, file) => {
		files[file.name] = file.exports;
		return files;
	}, {});

// get the router
app.router = require(`${internal}/router`);

// get the controller
app.Controller = require(`${internal}/Controller`);

// all the models
app.models = app.util.loader.dirSync("models", { reduce: false })
	.reduce(function(files, file) {
		files[file.name] = file.exports;
		return files;
	}, {});

// primarily for sockets
app.connections = {};


/////////////////////////////
//	SERVICES
////////////////////////////

app.services = {};

fs.readdirSync("services").forEach((item) => {
	app.services[item] = require(`${external}/services/${item}`);
});


/////////////////////////////
//	ENVIROMENT SPECIFIC
////////////////////////////

let props = {};
server
	.configure("production", function() {
		// cache to one day
		props = {
			maxAge: 100 * 60 * 60 * 24
		};

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
		props = {
			maxAge: 0
		};

		// Log all the things.
		//server.use(express.logger("dev"));
		console.setLevel(console.LEVELS.DEBUG);

		// Exit with an error code on any uncaught exception.
		process.on("uncaughtException", function(err) {
			console.error("Caught exception:", err.message);
			console.error(err.stack);
			process.exit(1);
		});
	});


////////////////
//	NIB
////////////////

let compile = function(str, path) {
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
	.use(express.favicon(external + '/public/favicon.ico'))
	.use(express.bodyParser())
	.use(express.methodOverride())
	.use(express.cookieParser())
	.use(express.session(
		(function() {
			let stores = require(`${internal}/modules/session`);
			let store = {
				key: 'express.sid',
				secret: app.config.secret
			};
			if (app.config.session in stores) store = stores[app.config.session](store);
			app.session = store;
			return store;
		})()
	))
	.use(function(req, res, next) {
		if (!app.config.sockets) return next();
		if (req.sessionID in app.connections) {
			req.sock = app.connections[req.sessionID];
		}
		next();
	})
	.use(stylus.middleware({
		src: `${external}/private`,
		dest: `${external}/public`,
		compress: true,
		debug: true,
		compile: compile
	}))
	.use((function() {
		let busters = require(`${internal}/modules/cache`).busters;

		let buster = "none";
		if (app.config.cacheBuster in busters) buster = app.config.cacheBuster;
		return busters[buster];
	})())
	.use(express.static(`${external}/public`, props))
	.use("/bower_components", express.static(`${external}/bower_components`))
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
	});

// server stylus variable for custom stylus things
// TODO: remove
server.stylus = {};


////////////////
//	CS COMPONENTS
////////////////

// find any cs-* packages
let packages = require(`${external}/package`).dependencies;
let components = [];
for (let pack in packages) {
	if (pack.substr(0, 3) === "cs-") {
		let packagePath = `${external}/node_modules/${pack}`;
		components.push(require(packagePath));
	}
}


////////////////
//	START
////////////////

process.title = "cornerstone";

let start = function() {
	let listener = http.createServer(server).listen(server.get("port"), function() {
		console.info("Cornerstone listening at http://%s:%d [%s]", "localhost", server.get("port"), server.get("env"));
	});

	// https://gist.github.com/bobbydavid/2640463
	if (app.config.sockets) {
		server.io = require("socket.io").listen(listener);
		server.io.set("log level", 0);

		// Set up two-way session/socket access.
		server.io.set('authorization', function(handshake, accept) {
			if (!handshake.headers.cookie) return accept("Session cookie required.", false);

			handshake.cookie = require("cookie").parse(handshake.headers.cookie);
			handshake.cookie = require("connect").utils.parseSignedCookies(handshake.cookie, app.config.secret);
			handshake.sessionID = handshake.cookie["express.sid"];

			app.session.store.get(handshake.sessionID, function(err, session) {
				if (err) return accept("Error in session store.", false);
				if (!session) return accept("Session not found.", false);
				return accept(null, true);
			});
		});

		server.io.sockets.on("connection", function(socket) {
			let sessionID = socket.handshake.sessionID;
			app.connections[sessionID] = socket;
		});
	}

	require(`${app.dirs.external}/app`);

	// Now that all the resources have been loaded,
	// run all code that depends on them.
	app.emit("start");
};


////////////////
//	EXPORT
////////////////

// once we have all components, start
module.exports = Promise.all(components)
	.then(start);
