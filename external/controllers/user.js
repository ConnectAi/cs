// TODO: Extend Controller.
var User = {
	get() {},

	"post list"(req, res) {
		res.json([2, 4, 6, 8]);
	},

	test(req, res) {
		res.locals({
			req,
			res,
			session: req.session,
			params: req.params
		});

		res.render("user/get");
	}
};

module.exports = User;
