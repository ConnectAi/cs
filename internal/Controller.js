class Controller {
	constructor(name) {
		this.name = name;

		app.router.buildRoutes(this);
	}
}

module.exports = Controller;
