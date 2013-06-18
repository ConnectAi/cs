////////////////
//	NATIVES
////////////////
	var express = require("express"),
		http = require("http"),
		path = require("path");


////////////////
//	GLOBALS
////////////////
	global.app = express();
	global.log = console.log;


////////////////
//	SETUP
////////////////
	app.set("port", process.env.PORT || 3000)
		.set("views", __dirname + "/views")
		.set("view engine", "ejs")
		.use(express.favicon())
		// .use(express.logger('dev'))
		.use(express.bodyParser())
		.use(express.methodOverride())
		.use(express.cookieParser("Shh! It's a secret."))
		.use(express.session())
		.use(app.router)
		.use(require("stylus").middleware(__dirname + "/public"))
		.use(express.static(path.join(__dirname, "public")));

	//	Run in passed-in environment.
	//	Defaults to "development".
	if (process.argv.length === 3) {
		app.set("env", process.argv[2]);
	}


////////////////
//	ROUTES
////////////////
	app.get("/:controller/:action/:id?", function(req, res, next) {
		res.locals({
			req,
			res,
			session: req.session,
			params: req.params,
			controller: req.params.controller,
			action: req.params.action,
			id: req.params.id
		});

		next();
	});


////////////////
//	MODULES
////////////////
	app.config = require("./config");
	app.utilities = require("./internal/utilities");
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
		http.createServer(app).listen(app.get("port"), function() {
			log("Framework listening at http://%s:%d [%s]", "localhost", app.get("port"), app.get("env"));
		});
	};

exports.start = start;
