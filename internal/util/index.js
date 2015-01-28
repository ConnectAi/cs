let fs = require("fs");


let log = function(line) {
	let date = new Date();
	let D = date.getDate(),
		M = date.getMonth() + 1,
		Y = date.getFullYear(),
		h = date.getHours(),
		m = date.getMinutes(),
		s = date.getSeconds();
	fs.appendFile("app.log", `${Y}-${M}-${D} | ${h}:${m}${s}:\t${line}\n`);
};


let include = function(path) {
	// make sure we have an includes cache var
	if (!app.CACHE.includes) app.CACHE.includes = {};

	// prepend the external dir
	path = `${app.dirs.external}/${path}`;

	// if there is no cached path
	if (!app.CACHE.includes[path]) {
		let contents = fs.readFileSync(path, "utf8") || "";
		app.CACHE.includes[path] = contents;
	}

	// return the compiled function
	return hbs.compile(app.CACHE.includes[path]);
};


require("./helpers")();


module.exports = {
	log,
	include,
	loader: require("./loader")
};
