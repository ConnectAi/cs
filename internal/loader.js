var fs = require("fs");

var loadDir = function(dir) {
	var path = "external/" + dir;

	// Build list of files in this directory (other than this file).
	var files = fs
		.readdirSync(path)
		.filter(function(file){
			return file !== "index.js" && file[0] !== ".";
		})
		.map(function(file){
			return file.replace(/\.\w+/, "");
		});

	// Build models object from files in the models folder.
	var resources = files
		.reduce(function(resources, name) {
			var Resource = require("../" + path + "/" + name);
			name = app.utilities.capitalize(name);
			resources[name] = new Resource(name);
			return resources;
		}, {});

	return resources;
};

module.exports = {
	controllers: loadDir("controllers"),
	models: loadDir("models")
};
