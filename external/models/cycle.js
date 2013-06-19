class Cycle extends app.Model {
	constructor() {
		super();
		this.table = "cycle";
	}

	asdf(req, res) {
		this.db(req, res)
	}
}

module.exports = Cycle;
