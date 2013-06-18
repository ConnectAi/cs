var defaultHandler = function(route) {
	return function(req, res) {
		res.render(route);
	};
};

var getRoutes = function(instance) {
	var routes = [];
	for (var route in instance) {
		if (typeof instance[route] === "function") {
			routes.push(route);
		}
	}
	return routes;
};

var buildRoutes = function(instance) {
	var routes = getRoutes(instance);
	routes.forEach(function(route) {
		var handler = instance[route];
		var url = route.match(/^(?:(get|post|put|delete|all)\s+)?\/?([\w\-]+)$/);

		if (url) {
			var verb = url[1] || "get";
			var action = url[2];
			var path = instance.name + "/" + action;

			var isEmpty = /^[^{]+\{\s*\}$/.test(""+handler);
			if (isEmpty) {
				handler = defaultHandler(path);
			}

			server[verb]("/" + path, handler);
		}
	});
}

class Controller {
	constructor(name) {
		this.name = name;

		buildRoutes(this);
	}
}

module.exports = Controller;
