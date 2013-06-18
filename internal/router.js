server.get("/:controller/:action/:id?", function(req, res, next) {
	// Cache params (this is necessary).
	var {controller, action, id} = req.params;

	// Extending req.

	// Extending res.
	res.view = function(path, data = {}) {
		var path = controller + "/" + action;
		res.render(path, data);
	};

	// Set variables for views.
	res.locals({
		req,
		res,

		session: req.session,
		params: req.params,

		controller,
		action,
		id,

		title: server.get("name") + " | " + action + " " + controller
	});

	next();
});
