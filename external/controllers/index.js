// Build controllers object from files in the controllers folder.
// TODO: Create array from fs.
var controllers = ["user"].reduce(function(controllers, name){
	var actions = require("./" + name);
	controllers[name] = new app.Controller(name, actions);
	return controllers;
}, {});

module.exports = controllers;
