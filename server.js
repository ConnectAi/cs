////////////////
//	NATIVES
////////////////
	var express = require("express"),
		http = require("http"),
		path = require("path");


////////////////
//	GLOBALS
////////////////
	global.app = {};
	global.server = express();
	global.log = console.log;


////////////////
//	SETUP
////////////////
	server
		.set("port", process.env.PORT || 3000)
		.set("name", "[framework]")
		.set("views", __dirname + "/views")
		.set("view engine", "ejs")
		.use(express.favicon())
		// .use(express.logger('dev'))
		.use(express.bodyParser())
		.use(express.methodOverride())
		.use(express.cookieParser("Shh! It's a secret."))
		.use(express.session())
		.use(server.router)
		.use(require("stylus").middleware(__dirname + "/public"))
		.use(express.static(path.join(__dirname, "public")));

	//	Run in passed-in environment.
	//	Defaults to "development".
	if (process.argv.length === 3) {
		server.set("env", process.argv[2]);
	}


////////////////
//	MODULES
////////////////
	app.config = require("./internal/config");
	app.utilities = require("./internal/utilities");
	app.router = require("./internal/router");
	app.Controller = require("./internal/Controller");
	app.Model = require("./internal/Model");
	app.controllers = require("./external/controllers");


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
	};

exports.start = start;
