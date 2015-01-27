let fs = require("fs");
let path = require("path");


let dirSync = function(dir, options = {}) {
	let filepath = path.resolve(`${app.dirs.external}/${dir}`);

	if (!("whitelist" in options)) options.whitelist = /^([\w][\w\-_. ]*)\.js$/;
	if (!("reduce" in options)) options.reduce = true;

	let filter;
	// Whitelist can either be a function, regex, or an array of filenames.
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
	} else if (typeof options.whitelist === "boolean") {
		filter = () => options.whitelist;
	} else {
		filter = () => true;
	}

	// Build list of files in this directory.
	let files = fs
		.readdirSync(filepath)
		.filter(filter)
		.map(function(file) {
			return file.replace(/\.\w+$/, "");
		})
		.map((name) => {
			return {
				name,
				exports: require(filepath + "/" + name)
			};
		});

	if (options.reduce) {
		files = files
			.reduce((files, file) => {
				files[file.name] = file.exports;
				return files;
			}, {});
	}

	return files;
};


module.exports = {
	dirSync
};
