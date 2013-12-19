var fs = require("fs");
var path = require("path");
var hbs = require("hbs");

var setupHandlebars = function() {
	var blocks = {};

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

	hbs.registerHelper("include", function(file, context, options) {
		
		if (arguments.length < 3) {
             options = context;
             context = this;
        }
		
		if(app.CACHE.includes[file]) {
			return app.CACHE.includes[file](context);
		} else {
		
			if (!/\.[\w-]+$/.test(file)) file += ".html";
			var filepath = path.resolve(`${app.dirs.external}/views/${file}`);
			var contents = fs.readFileSync(filepath, "utf8") || "";
			if (options.hash.inline) return contents;
			app.CACHE.includes[file] = hbs.compile(contents);
			return hbs.compile(contents)(context);
		}
	});

	hbs.registerHelper("log", function() {
		var slice = Array.prototype.slice;
		var args = slice.call(arguments, 0, -1);
		var options = slice.call(arguments, -1)[0];
		if (!args.length) args.unshift(this);
		if (options.hash.write) {
			return `<script>console.log("LOG:", ${JSON.stringify(args)});</script>`;
		}
		return console.log("LOG:", args) || "";
	});

	hbs.registerHelper('inArray', function() {
		var args = Array.prototype.slice.call(arguments);
		var needle = args[0];
		var haystack = args[1];
		var key = args[2];
		var options = args[3];

		// make an array out of an object if key was passed
		var _haystack = [];
		if(~["string", "number"].indexOf(typeof key)) {
			for(var i in haystack) {
				_haystack.push( haystack[i][key] );
			}
			haystack = _haystack;
		} else {
			options = args[2];
		}

		if(!!~haystack.indexOf(needle)) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});

	//	Handlebars Equality helper.
	//	{{#iff one}}:  !!one
	//	{{#iff one two}}:  one === two
	//	{{#iff one "[operator]" two}}:  one [operator] two
	hbs.registerHelper('iff', function() {
		var args = Array.prototype.slice.call(arguments);

		var	left = args[0],
			operator = '===',
			right,
			options = {};

		if(args.length === 2){
			right = true;
			options = args[1];
		}

		if(args.length === 3){
			right = args[1];
			options = args[2];
		}

		if(args.length === 4){
			operator = args[1];
			right = args[2];
			options = args[3];
		}

		if(options.hash && options.hash['case'] === false){
			left = (''+left).toLowerCase();
			right = (''+right).toLowerCase();
		}

		var operators = {
			"^==$": function(l, r){ return l == r; },
			"^!=$": function(l, r){ return l !== r; },
			"^IS$|^===$": function(l, r){ return l === r; },
			"^NOT$|^IS NOT$|^!==$|^!$": function(l, r){ return l != r; },
			"^OR$": function(l, r){ return l || r; },
			"^AND$|^&&$": function(l, r){ return l && r; },
			"^MOD$|^%$": function(l, r){ return !(l % r); },
			"^<$": function(l, r){ return l < r; },
			"^>$": function(l, r){ return l > r; },
			"^<=$": function(l, r){ return l <= r; },
			"^>=$": function(l, r){ return l >= r; },
			"^typeof$": function(l, r){ return typeof l == r; },
			"^isArray$": function(l, r){ return Array.isArray(l); },
			"^IN$|^E$": function(l, r){
				var isPresent = false;
				if(typeof r === 'object'){
					if(r.indexOf && r instanceof Array){
						if(/^\d+$/.test(l)){
							isPresent = !!~r.indexOf(+l) || !!~r.indexOf(''+l);
						}
						return isPresent || !!~r.indexOf(l);
					}else{
						return l in r;
					}
				} else if(typeof r === 'string') {
					return !!~r.indexOf(l);
				}
			}
		};

		var op, result, expression;
		for(op in operators){
			expression = RegExp(op, 'i');

			if(expression.test(operator)){
				result = operators[op](left, right);

				if(result){
					return options.fn(this);
				}else{
					return options.inverse(this);
				}
			}
		}

		if(!operators[operator]){
			throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
		}
	});

	hbs.registerHelper("json", function(what) {
		return JSON.stringify(what);
	});
};

module.exports = setupHandlebars;
