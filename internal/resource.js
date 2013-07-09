var fs = require("fs");
var path = require("path");

require("./utilities/helpers")();

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

	// Return list of files.
	return files.map((name) => {
		return {
			name,
			exports: require("../" + path + "/" + name)
		}
	});
};

var reduceWithConstructors = function(resources, resource) {
	resources[resource.name] = new resource.exports(resource.name);
	return resources;
};

var loaders = {
	controllers: () => loadDir("controllers").reduce(reduceWithConstructors, {}),
	models: () => loadDir("models").reduce(reduceWithConstructors, {}),

	services: function() {
		return loadDir("services")
			.reduce((services, service) => {
				services[service.name] = service.exports;
				return services;
			}, {})
	}
};

module.exports = {
	load: function(what) {
		return loaders[what]();
	}
};
