// Build controllers object from files in the controllers folder.
// TODO: Create array from fs.
var controllers = ["user"].reduce(function(controllers, name) {
	var Controller = require("./" + name);
	controllers[name] = new Controller(name);
	return controllers;
}, {});

module.exports = controllers;
