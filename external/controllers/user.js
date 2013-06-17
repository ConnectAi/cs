var User = {
	get() {},

	list(req, res) {
		res.json([2, 4, 6, 8]);
	},

	"post test"(req, res) {
		res.json([2, 4, 6, 8]);
	}
};

module.exports = User;
