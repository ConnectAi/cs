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
	for (var route in controller) {
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

app.loader.done(function() {
	// Make routes for each policy defined in the config.
	var pattern = /^(?:(get|post|put|delete|all)\s+)?(\/[\w\-:?\/]*)$/;
	var verb, path, handlers;
	for (var route in app.config.routes) {
		[, verb, path] = (""+route).match(pattern);
		verb = verb || "all";
		handlers = app.config.routes[route];
		if (typeof handlers === "function") handlers = [handlers];
		server[verb](path, handlers);
	}

	server.all("/:controller/:action?/:id?", function(req, res, next) {
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

		res.error = function(msg = "", code = 400) {
			res.send(code, msg);
			res.end();
		};

		// Set variables for views.
		res.locals({
			server: {
				name: server.get("name"),
				port: server.get("port")
			},

			req,
			res,
			session: req.session,
			params: req.params,

			controller,
			action,
			id
		});

		res.locals.exports = {
			server: res.locals.server,
			params: req.params,
			controller,
			action,
			id
		};

		next();
	});

	for (var controller in app.controllers) {
		buildRoutes(app.controllers[controller]);
	}
});

module.exports = {
	getRoutes,
	buildRoutes
};
