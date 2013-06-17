var User = {
	get() {},

	list(req, res) {
		res.json([2, 4, 6, 8]);
	},

	test(req, res) {
		res.render("user/get");
	}
};

module.exports = User;
