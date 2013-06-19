var defaultHandler = function(path) {
	return function(req, res) {
		res.render(path);
	};
};

var getRoutes = function(object) {
	var routes = [];
	for (var route in object) {
		var handler = object[route];
		if (typeof handler === "function") {
			routes.push(route);
		} else if (typeof handler === "object") {
			var {controller, action} = handler;

			if (!("action" in handler)) {
				handler.action = "index";
			}

			routes.push(app.controllers[controller][action]);
		}

	}
	return routes;
};

var buildRoutes = function(object) {
	var routes = getRoutes(object);
	routes
		.filter(function(file){
			return file[0] !== "_";
		})
		.forEach(function(route) {
			var handler = object[route];
			var url = (""+route).match(/^(?:(get|post|put|delete|all)\s+)?\/?([\w\-]+)$/);

			if (url) {
				var verb = url[1] || "get";
				var action = url[2];
				var path = object.name + "/" + action;
				var route = "/" + object.name;
				if (action !== "index") route += "/" + action;

				var isEmpty = /^[^{]+\{\s*\}$/.test(""+handler);
				if (isEmpty) {
					handler = defaultHandler(path);
				}

				server[verb](route, handler.bind(object));
			}
		});
};

server.get("/:controller/:action/:id?", function(req, res, next) {
	// Cache params (this is necessary).
	var {controller, action, id} = req.params;

	// Extending req.

	// Extending res.
	res.view = function(path, data = {}) {
		var path = controller + "/" + action;
		res.render(path, data);
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
