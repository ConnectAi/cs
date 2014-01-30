// Add convenience methods to req/res.
var pipe = function(req, res, next) {
	res.console = function(...args) {
		var html =
			`<script>console.log(
				${args.map((arg) => JSON.stringify(arg))}
			);</script>`;
		res.send(html);
	};

	res.error = function(msg = "", code = 400) {
		res.send(code, msg);
		res.end();
	};

	res.view = function(path = "", data = {}, expose = {}) {
		// If a path is not passed,
		// determine it ourselves.
		if (typeof path === "object") {
			expose = data;
			data = path;
			path = "";
		}

		// If path is not passed, make it the route, stripped of all tokens.
		if (path === "") {
			path = req.route.path
				.replace(/^\//, "")
				.replace(/\/(:|index).*/, "");
		}
		
		// a prefixed path as an option
		if(res.locals.path) {
			path = res.locals.path + "/" + path;
		}

		// Expose public data to browser.
		res.locals.exposed.public = expose;
		
		if (app.config.debug) {
			// For debugging.
			res.locals.exposed.private = data;
			res.locals.exposed.config = app.config;
			res.locals.exposed.session = req.session;
		}

		res.locals({ params: req.params })
		res.render(path, data);
	};

	// Set variables for views.
	res.locals({
		server: {
			name: server.get("name"),
			port: server.get("port"),
			env: server.get("env")
		},
		config: app.config,
		req,
		status: res.statusCode,
		session: req.session,
		query: req.query,
		body: req.body,

		title: server.get("name")
	});

	res.locals.exposed = {
		server: res.locals.server,
		public: {}
	};

	next();
};

var wrapHandler = function(handler) {
	return function(req, res, next) {
		let params = req.route.keys.map((key) => req.params[key.name]);
		handler.call(this, req, res, next, ...params);
	};
};

var makeRoute = function(verb, route = controller, handlers, controller = "") {
	let originalRoute = route;

	if (route.indexOf("/") !== 0) {
		if (controller && route !== "index") {
			route = `${controller}/${route}`;
		} else if (controller && route === "index") {
			route = controller;
		} else {
			route = `/${route}`;
		}
	}

	if (originalRoute === "*") {
		route = new RegExp(`^\\/${controller}(\\/.*)?`);
	} else {
		route = (app.config.path + route).replace(/^\/\//, "/");
	}

	if (typeof handlers === "function") {
		handlers = wrapHandler(handlers);
	} else if (Array.isArray(handlers)) {
		handlers = handlers.map(wrapHandler);
	}

	server[verb](route, handlers);
}

var handleRoute = function(route, handlers, controller) {
	if (typeof handlers === "string") return;
	if (!Array.isArray(handlers)) handlers = [handlers];

	var groups = [];

	handlers.forEach((handler) => {
		let verb = "all";

		// Normalize all handlers to the same format.
		if (typeof handler === "object" && !Array.isArray(handler)) {
			for (let verb in handler) {
				groups.push({
					verb,
					handler: handler[verb]
				});
			}
			return;
		}

		groups.push({
			verb, handler
		});
	}, {});

	groups.forEach((group) => {
		makeRoute(group.verb, route, group.handler, controller);
	});
};

app.loader.then(function() {
	// Make routes for each policy defined in the config.
	for (let route in app.controllers.index) {
		let handlers = app.controllers.index[route];
		handleRoute(route, handlers);
	}

	for (let controller in app.controllers) {
		if (controller !== "index") {
			for (let route in app.controllers[controller]) {
				handleRoute(route, app.controllers[controller][route], controller);
			}
		}
	}
});

module.exports = {
	pipe
};
