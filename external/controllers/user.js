// TODO: Extend Controller.
var User = {
	get() {},

	"post list"(req, res) {
		res.json([2, 4, 6, 8]);
	},

	test(req, res) {
		res.render("user/get");
	}
};

module.exports = User;
