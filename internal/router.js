server.get("/:controller/:action/:id?", function(req, res, next) {
	res.locals({
		req,
		res,
		session: req.session,
		params: req.params,
		controller: req.params.controller,
		action: req.params.action,
		id: req.params.id
	});

	next();
});
