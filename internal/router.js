var getRoutes = function(object) {
	var routes = [];
	for (var route in object) {
		if (typeof object[route] === "function") {
			routes.push(route);
		} else if (typeof object[route] === "object") {
			// if (!("action" in object)) {
			// 	object.action = "index";
			// }
			// routes.push(app.controllers[object.controller][action]);
		}

	}
	return routes;
};

var buildRoutes = function(object) {
	// log(object)
	var routes = getRoutes(object);
	routes.forEach(function(route) {
		var handler = object[route];
		var url = route.match(/^(?:(get|post|put|delete|all)\s+)?\/?([\w\-]+)$/);

		if (url) {
			var verb = url[1] || "get";
			var action = url[2];
			var path = object.name + "/" + action;

			var isEmpty = /^[^{]+\{\s*\}$/.test(""+handler);
			if (isEmpty) {
				handler = defaultHandler(path);
			}

			server[verb]("/" + path, handler);
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

buildRoutes(app.config.routes);

module.exports = {
	getRoutes,
	buildRoutes
};
