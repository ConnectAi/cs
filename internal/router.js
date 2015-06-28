// Add convenience methods to req/res.
let pipe = function(req, res, next) {
	res.console = function(...args) {
		let html = `
			<script>console.log(
				${args.map((arg) => JSON.stringify(arg))}
			);</script>
		`;
		res.send(html);
	};

	res.error = function(msg = "", code = 400) {
		res.send(code, msg);
		res.end();
	};

	res.view = function(path = "", data = {}, expose = {}) {
		// If a path is not passed,
		// determine it ourselves.
		if (typeof path === "object") {
			expose = data;
			data = path;
			path = "";
		}

		// If path is not passed, make it the route, stripped of all tokens.
		if (path === "") {
			path = req.route.path
				.replace(/^\//, "")
				.replace(/\/(:|index).*/, "");
		}

		// if changing layout
		if (res.layout) res.locals.layout = res.layout;

		// a prefixed path as an option
		if (res.path) {
			path = res.path + "/" + path;
		}

		// Expose public data to browser.
		res.locals.exposed.public = expose;

		if (app.config.debug) {
			// For debugging.
			res.locals.exposed.private = data;
			res.locals.exposed.config = app.config;
			res.locals.exposed.session = req.session;
			res.locals.exposed.controller = req.url.split("/")[1];
		}

		res.locals({ params: req.params });
		res.render(path, data);

		for (let key in data) {
			if (data[key] instanceof Promise) {
				let listener = function(socket) {
					if (req.sessionID === socket.handshake.sessionID) {
						data[key].then(function(data) {
							socket.emit("stream", [ key, data ]);
						});
						server.io.sockets.removeListener("connection", listener);
					}
				};
				server.io.sockets.on("connection", listener);
			}
		}
	};

	// Set variables for views.
	res.locals({
		server: {
			name: server.get("name"),
			port: server.get("port"),
			env: server.get("env")
		},
		config: app.config,
		req,
		status: res.statusCode,
		session: req.session,
		query: req.query,
		body: req.body,
		controller: req.url.split("/")[1],
		title: server.get("name")
	});

	res.locals.exposed = {
		server: res.locals.server,
		public: {}
	};

	next();
};


let wrapHandler = function(handler) {
	return function(req, res, next) {
		//console.log(req.url, "keys", req.route.keys);
		let params = req.route.keys.map((key) => req.params[key.name]);
		handler.call(this, req, res, next, ...params);
	};
};


let makeRoute = function(verb, route, handlers, controller = "") {
	if (!route) route = controller;

	let originalRoute = route;

	if (route.indexOf("/") !== 0) {
		if (controller && !~route.indexOf("index")) {
			route = `${controller}/${route}`;
		} else if (controller && !!~route.indexOf("index")) {
			route = route;
		} else {
			route = `/${route}`;
		}
	}

	if (originalRoute === "*") {
		route = new RegExp(`^\\/${controller}(\\/.*)?`);
	} else {
		route = (app.config.path + route).replace(/^\/\//, "/");
	}

	if (typeof handlers === "function") {
		handlers = wrapHandler(handlers);
	} else if (Array.isArray(handlers)) {
		handlers = handlers.map(wrapHandler);
	}

	server[verb](route, handlers);
}

let handleRoute = function(route, handlers, controller) {
	if (typeof handlers === "string") return;
	if (!Array.isArray(handlers)) handlers = [handlers];

	let groups = [];

	handlers.forEach((handler) => {
		let verb = "all";

		// Normalize all handlers to the same format.
		if (typeof handler === "object" && !Array.isArray(handler)) {
			for (let verb in handler) {
				groups.push({
					verb,
					handler: handler[verb]
				});
			}
			return;
		}

		groups.push({
			verb, handler
		});
	}, {});

	groups.forEach((group) => {
		makeRoute(group.verb, route, group.handler, controller);
	});
};

app.on("start", function() {
	// Make routes for each policy defined in the config.
	for (let route in app.controllers.index) {
		let handlers = app.controllers.index[route];
		handleRoute(route, handlers);
	}

	for (let controller in app.controllers) {
		if (controller !== "index") {
			for (let route in app.controllers[controller]) {
				handleRoute(route, app.controllers[controller][route], controller);
			}
		}
	}
});

module.exports = {
	pipe
};
