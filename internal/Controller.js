var defaultHandler = function(route) {
	return function(req, res) {
		res.render(route);
	};
};

class Controller {
	constructor(name) {
		this.name = name;

		app.router.buildRoutes(this);
	}
}

module.exports = Controller;
