var fs = require("fs");
var path = require("path");
var hbs = require("hbs");

var setupHandlebars = function() {
	var hooks = {};
	hbs.registerHelper("hook", function(name) {
		var val = (hooks[name] || []).join("\n");
		hooks[name] = [];
		return val;
	});

	hbs.registerHelper("bind", function(name, context) {
		var hook = hooks[name];
		if (!hook) {
			hook = hooks[name] = [];
		}
		hook.push(context.fn(this));
	});

	// Setup cache store
	if (!app.CACHE.includes) app.CACHE.includes = {};
	hbs.registerHelper("include", function(file, context, options) {
		if (arguments.length < 3) {
			options = context;
			context = this;
		}

		var contents;
		// Check the cache
		if (file in app.CACHE.includes) {
			contents = app.CACHE.includes[file](context);
		} else {
			if (!/\.[\w-]+$/.test(file)) file += ".html";
			let filepath = path.resolve(`${app.dirs.external}/views/${file}`);
			contents = fs.readFileSync(filepath, "utf8") || "";
		}

		// Cache the contents for future use
		app.CACHE.includes[file] = contents;
		if (options.hash.parse === false) return contents;
		return hbs.compile(contents)(context);
	});

	hbs.registerHelper("stream", function(id) {
		return `<var data-promise="${id}"></var>`;
	});

	hbs.registerHelper("log", function() {
		var slice = Array.prototype.slice;
		var args = slice.call(arguments, 0, -1);
		var options = slice.call(arguments, -1)[0];
		if (!args.length) args.unshift(this);
		if (options.hash.client) {
			return `<script>console.log("LOG:", ${JSON.stringify(args)});</script>`;
		}
		return console.log("LOG:", args) || "";
	});

	//	Handlebars Equality helper.
	//	{{#iff one}}:  !!one
	//	{{#iff one two}}:  one === two
	//	{{#iff one "[operator]" two}}:  one [operator] two
	hbs.registerHelper("iff", function() {
		var args = Array.prototype.slice.call(arguments);

		var	left = args[0],
			operator = "===",
			right,
			options = {};

		if (args.length === 2) {
			right = true;
			options = args[1];
		}

		if (args.length === 3) {
			right = args[1];
			options = args[2];
		}

		if (args.length === 4) {
			operator = args[1];
			right = args[2];
			options = args[3];
		}

		if (options.hash && options.hash["case"] === false) {
			left = (""+left).toLowerCase();
			right = (""+right).toLowerCase();
		}

		var operators = {
			"^==$": function(l, r) { return l == r; },
			"^!=$": function(l, r) { return l !== r; },
			"^IS$|^===$": function(l, r) { return l === r; },
			"^NOT$|^IS NOT$|^!==$|^!$": function(l, r) { return l != r; },
			"^OR$": function(l, r) { return l || r; },
			"^AND$|^&&$": function(l, r) { return l && r; },
			"^MOD$|^%$": function(l, r) { return !(l % r); },
			"^<$": function(l, r) { return l < r; },
			"^>$": function(l, r) { return l > r; },
			"^<=$": function(l, r) { return l <= r; },
			"^>=$": function(l, r) { return l >= r; },
			"^typeof$": function(l, r) { return typeof l == r; },
			"^isArray$": function(l, r) { return Array.isArray(l); },
			"^IN$|^E$": function(l, r) {
				var isPresent = false;
				if (typeof r === "object") {
					if (r.indexOf && r instanceof Array) {
						if (/^\d+$/.test(l)) {
							isPresent = !!~r.indexOf(+l) || !!~r.indexOf(""+l);
						}
						return isPresent || !!~r.indexOf(l);
					}else{
						return l in r;
					}
				} else if (typeof r === "string") {
					return !!~r.indexOf(l);
				}
			}
		};

		var op, result, expression;
		for (op in operators) {
			expression = RegExp(op, "i");

			if (expression.test(operator)) {
				result = operators[op](left, right);

				if (result) {
					return options.fn(this);
				}else{
					return options.inverse(this);
				}
			}
		}

		if (!operators[operator]) {
			throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
		}
	});

	hbs.registerHelper("json", function(what) {
		return JSON.stringify(what);
	});
};

module.exports = setupHandlebars;
