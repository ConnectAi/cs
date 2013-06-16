// http://traceur-compiler.googlecode.com/git/demo/repl.html

var defaultHandler = function(route) {
	log(route);
	return function(req, res) {
		res.render(route);
	};
};

class Controller {
	constructor(name, routes) {
		this.name = name;
		this.buildRoutes(routes);
	}

	buildRoutes(routes) {
		for (var route in routes) {
			var handler = routes[route];
			var isEmpty = /^[^{]+\{\s*\}$/.test("" + handler);

			if (isEmpty) {
				handler = defaultHandler(this.name + "/" + route);
			}

			app.all("/" + this.name + "/" + route, handler);
		}
	}
}

module.exports = Controller;
