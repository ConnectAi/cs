class Route {
	constructor(controller, action = "index", verb = "all") {
		if (/^[A-Z][a-z]/.test(controller)) {
			controller = controller[0].toLowerCase() + controller.slice(1);
		}
		this.controller = controller;
		this.action = action;
		this.verb = verb;
	}

	get path() {
		var path = "/" + this.controller;
		if(this.action !== "index") {
			path += "/" + this.action;
			path += "/:id?";
		}
		return path;
	}

	get view() {
		return this.controller + "/" + this.action;
	}
}

var defaultHandler = function(path) {
	return function(req, res) {
		res.render(path);
	};
};

var getRoutes = function(controller) {
	var routes = [];
	for (let route in controller) {
		var handler = controller[route];
		if (typeof handler === "function") {
			routes.push(route);
		} else if (typeof handler === "object") {
			handler.action = handler.action || "index";
			routes.push(app.controllers[handler.controller][handler.action]);
		}

	}
	return routes;
};

var buildRoutes = function(controller) {
	var routes = getRoutes(controller);
	routes
		.filter(function(file){
			return file && file[0] !== "_";
		})
		.forEach(function(route) {
			var handler = controller[route];
			var pattern = /^(?:(get|post|put|delete|all)\s+)?\/?([\w\-]+)$/;

			if (pattern.test(route)) {

				var [, verb, action] = (""+route).match(pattern);
				var route = new Route(controller.name, action, verb);

				var isEmpty = /^[^{]+\{\s*\}$/.test(""+handler);
				if (isEmpty) {
					handler = defaultHandler(route.view);
				}

				server[route.verb](route.path, handler.bind(controller));
			}
		});
};

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

	res.view = function(path, data = {}, expose = {}) {
		// Expose public data to browser.
		res.locals.exposed.public = expose;

		if (app.config.debug) {
			// For debugging.
			res.locals.exposed.private = data;
			res.locals.exposed.session = req.session;
		}

		res.render(path, data);
	};

	// Set variables for views.
	res.locals({
		server: {
			name: server.get("name"),
			port: server.get("port"),
			env: server.get("env")
		},

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

app.loader.then(function() {
	// Make routes for each policy defined in the config.
	var pattern = /^(?:(get|post|put|delete|all)\s+)?(\/[\w\-:?\/]*)$/;
	var verb, path, handlers;
	for (let route in app.config.routes) {
		[, verb, path] = (""+route).match(pattern);
		verb = verb || "all";
		handlers = app.config.routes[route];
		if (typeof handlers === "function") handlers = [handlers];

		server[verb](app.config.path, handlers);
	}

	server.all(app.config.path + "/:controller/:action?/:id?", function(req, res, next) {
		// Cache params (this is necessary).
		var {controller, action, id} = req.params;
		var route = new Route(controller, action, id);

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
		let generalView = res.view;

		res.view = function(path = route.view, data = {}, expose = {}) {
			// If a path is not passed,
			// use the default path for the controller action.
			if (typeof path === "object") {
				expose = data;
				data = path;
				path = route.view;
			}
			generalView(path, data, expose);
		};

		// Set variables for views.
		res.locals({
			params: req.params,
			controller,
			action,
			id,
			title: `${server.get("name")} | ${action} ${controller} ${id}`
		});

		res.locals.exposed.{
			params = req.params;
			controller = controller;
			action = action;
			id = id;
		};

		next();
	});

	for (let controller in app.controllers) {
		buildRoutes(app.controllers[controller]);
	}
});

module.exports = {
	getRoutes,
	buildRoutes,
	pipe
};
