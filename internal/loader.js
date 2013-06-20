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

var setupHandlebars = function() {
	var hbs = require("hbs");
	var blocks = {};

	hbs.registerPartial("header", fs.readFileSync("external/views/header.html", "utf8"));
	hbs.registerPartial("footer", fs.readFileSync("external/views/footer.html", "utf8"));

	hbs.registerHelper("extend", function(name, context) {
	    var block = blocks[name];
	    if (!block) {
	        block = blocks[name] = [];
	    }
	    block.push(context.fn(this));
	});

	hbs.registerHelper("block", function(name) {
	    var val = (blocks[name] || []).join("\n");
	    blocks[name] = [];
	    return val;
	});
};

setupHandlebars();

module.exports = {
	controllers: loadDir("controllers"),
	models: loadDir("models")
};
