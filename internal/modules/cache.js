module.exports = {
	busters: {
		none: (req, res, next) => {
			next();
		},

		git: (req, res, next) => {
			let pattern = /^\/[0-9a-f]{5,40}\//;
			if (pattern.test(req.url)) req.url = req.url.replace(pattern, "/");
			next();
		}
	}
};
