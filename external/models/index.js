var fs = require("fs");

// Build list of files in this directory (other than this file).
var files = fs
	.readdirSync(__dirname)
	.map(function(file){
		return file.replace(/\.\w+/, "");
	})
	.filter(function(file){
		return file !== "index";
	});

// Build models object from files in the models folder.
var models = files
	.reduce(function(models, name) {
		var Model = require("./" + name);
		models[name] = new Model(name);
		return models;
	}, {});

module.exports = models;
