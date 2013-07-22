var path = require("path");

var load = function(dir, whitelist = /^([\w][\w\-_. ]*)\.js$/) {
	var path = path.resolve("external/" + dir);

	var filter;
	// Filter can either be a function, regex, or an array of filenames.
	if (typeof whitelist === "function") {
		filter = whitelist;
	} else if (whitelist instanceof RegExp) {
		filter = (file) => {
			return whitelist.test(file);
		};
	} else if (Array.isArray(whitelist)) {
		filter = (file) => {
			return !!~whitelist.indexOf(file);
		};
	} else {
		filter = () => true;
	}

	// Build list of files in this directory.
	return fs
		.readdirSync(path)
		.filter(filter)
		.map(function(file){
			return file.replace(/\.\w+/, "");
		})
		.reduce((files, file) => {
			files[file] = require("../" + path + "/" + file)
			return files;
		}, {});
};

module.exports = load;
