var fs = require("fs");

// Build list of files in this directory (other than this file).
var files = fs
	.readdirSync(__dirname)
	.map(function(file){
		return file.replace(/\.\w+/, "");
	})
	.filter(function(file){
		return file !== "index" && file[0] !== "_";
	});

// Build controllers object from files in the controllers folder.
var controllers = files
	.reduce(function(controllers, name) {
		var Controller = require("./" + name);
		controllers[name] = new Controller(name);
		return controllers;
	}, {});

module.exports = controllers;
