class Home extends app.Controller {
	index(req, res) {
		res.send("Welcome home.");
	}
}

module.exports = Home;
