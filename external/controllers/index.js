var controllers = ["user"].reduce(function(controllers, name){
	var controller = require("./" + name);
	controllers[name] = new app.Controller(name, controller);
	return controllers;
}, {});

module.exports = controllers;
