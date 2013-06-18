server.get("/:controller/:action/:id?", function(req, res, next) {
	// Cache params (this is necessary).
	var controller = req.params.controller,
		action = req.params.action,
		id = req.params.id;

	// Extending req.

	// Extending res.
	res.view = function(path, data = {}) {
		log(controller, action);
		var path = controller + "/" + action;
		res.render(path, data);
	};

	// Set variables for views.
	res.locals({
		req,
		res,

		session: req.session,
		params: req.params,

		controller: controller,
		action: action,
		id: id,

		title: server.get("name") + " | " + action + " " + controller
	});

	next();
});
