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

	hbs.registerHelper("include", function(file, ...args) {
		var context = args[0];
		if (args.length === 1) context = this;
		if (!/\.[\w-]+$/.test(file)) file += ".html";
		var filepath = path.resolve(`external/views/${file}`);
		var contents = fs.readFileSync(filepath, "utf8") || "";
		return hbs.compile(contents)(context);
	});

	hbs.registerHelper("log", function() {
		var args = Array.prototype.slice.call(arguments);
		if (args.length <= 1) args.unshift(this);
		return console.log('LOG:', args.slice(0, -1)) || '';
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
