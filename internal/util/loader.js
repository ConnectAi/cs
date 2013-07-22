var fs = require("fs");
var path = require("path");

var dirSync = function(dir, options = {}) {
	var filepath = path.resolve("external/" + dir);

	if (!("whitelist" in options)) options.whitelist = /^([\w][\w\-_. ]*)\.js$/;
	if (!("reduce" in options)) options.reduce = true;

	var filter;
	// Filter can either be a function, regex, or an array of filenames.
	if (typeof options.whitelist === "function") {
		filter = options.whitelist;
	} else if (options.whitelist instanceof RegExp) {
		filter = (file) => {
			return options.whitelist.test(file);
		};
	} else if (Array.isArray(options.whitelist)) {
		filter = (file) => {
			return !!~options.whitelist.indexOf(file);
		};
	} else {
		filter = () => true;
	}

	// Build list of files in this directory.
	var files = fs
		.readdirSync(filepath)
		.filter(filter)
		.map(function(file){
			return file.replace(/\.\w+$/, "");
		});

	if (options.reduce) {
		files = files
			.reduce((files, file) => {
				files[file] = require(filepath + "/" + file)
				return files;
			}, {});
	}

	return files;
};

module.exports = {
	dirSync
};
