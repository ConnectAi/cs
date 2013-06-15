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
	app
		.set("port", process.env.PORT || 3000)
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
	app.get("/", function(req, res){
		log("Hello.");
	});


////////////////
//	START
////////////////
	http.createServer(app).listen(app.get("port"), function() {
		log("Framework listening at http://%s:%d [%s]", "localhost", app.get("port"), app.get("env"));
	});
