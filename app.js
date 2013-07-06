var traceur = require("traceur/src/node/traceur");

var defaults = {
	"experimental": false,
	"arrayComprehension": true,
	"arrowFunctions": true,
	"classes": true,
	"defaultParameters": true,
	"destructuring": true,
	"forOf": true,
	"propertyMethods": true,
	"propertyNameShorthand": true,
	"templateLiterals": true,
	"restParameters": true,
	"spread": true,
	"generatorComprehension": true,
	"generators": true,
	"modules": true,
	"blockBinding": false,
	"privateNameSyntax": false,
	"privateNames": false,
	"cascadeExpression": false,
	"trapMemberLookup": false,
	"deferredFunctions": false,
	"propertyOptionalComma": false,
	"types": false,
	"debug": false,
	"sourceMaps": false,
	"freeVariableChecker": false,
	"validate": false,
	"strictSemicolons": false,
	"unstarredGenerators": false,
	"ignoreNolint": false,
	"blockBindings": false
};

traceur.options.experimental = true;
traceur.options.arrayComprehension = true;
traceur.options.arrowFunctions = true;
traceur.options.classes = true;
traceur.options.defaultParameters = true;
traceur.options.destructuring = true;
traceur.options.forOf = true;
traceur.options.propertyMethods = true;
traceur.options.propertyNameShorthand = true;
traceur.options.templateLiterals = true;
traceur.options.restParameters = true;
traceur.options.spread = true;
traceur.options.generatorComprehension = true;
traceur.options.generators = true;
traceur.options.modules = true;
traceur.options.blockBinding = true;
traceur.options.privateNameSyntax = true;
traceur.options.privateNames = true;
traceur.options.cascadeExpression = false;
traceur.options.trapMemberLookup = false;
traceur.options.deferredFunctions = true;
traceur.options.propertyOptionalComma = false;
traceur.options.types = false;
traceur.options.debug = false;
traceur.options.sourceMaps = true;
traceur.options.freeVariableChecker = false;
traceur.options.validate = false;
traceur.options.strictSemicolons = false;
traceur.options.unstarredGenerators = false;
traceur.options.ignoreNolint = false;
traceur.options.blockBindings = true;


traceur.require.makeDefault(function(path) {
	return !/node_modules/.test(path);
});

require("./server").start();
