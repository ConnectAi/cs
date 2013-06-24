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

	// Return list of files.
	return files.map((name) => {
		return {
			name,
			exports: require("../" + path + "/" + name)
		}
	});
};

var setupHandlebars = function() {
	var hbs = require("hbs");
	var blocks = {};

	hbs.registerPartial("header", fs.readFileSync("external/views/header.html", "utf8"));

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

	hbs.registerHelper("log", function(){
		var args = Array.prototype.slice.call(arguments);
		return console.log('LOG:', args.slice(0, -1)) || '';
	});

	//	Handlebars Equality helper.
	//	{{#iff one}}:  !!one
	//	{{#iff one two}}:  one === two
	//	{{#iff one "[operator]" two}}:  one [operator] two
	hbs.registerHelper('iff', function(){
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
};

var reduceWithConstructors = function(resources, resource) {
	resources[resource.name] = new resource.exports(resource.name);
	return resources;
};

setupHandlebars();

module.exports = {
	controllers: loadDir("controllers").reduce(reduceWithConstructors, {}),
	models: loadDir("models").reduce(reduceWithConstructors, {}),

	services: loadDir("services").reduce((services, service) => {
		services[service.name] = service.exports;
		return services;
	}, {})
};
