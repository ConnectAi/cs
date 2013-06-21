class Route {
	constructor(controller, action = "index", verb = "get") {
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
		}
		path += "/:id?";
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

server.get("/:controller/:action?/:id?", function(req, res, next) {
	// Cache params (this is necessary).
	var {controller, action, id} = req.params;
	var route = new Route(controller, action, id);

	// Extending req.

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

	// Set variables for views.
	res.locals({
		req,
		res,

		session: req.session,
		params: req.params,

		controller,
		action,
		id,

		title: server.get("name") + " | " + action + " " + controller
	});

	next();
});

var start = function() {
	buildRoutes(app.config.routes);
};

module.exports = {
	getRoutes,
	buildRoutes,
	start
};
