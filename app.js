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

var options = {
	"experimental": true,
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
	"privateNameSyntax": true,
	"privateNames": true,
	"cascadeExpression": false,
	"trapMemberLookup": false,
	"deferredFunctions": true,
	"propertyOptionalComma": false,
	"types": false,
	"debug": false,
	"sourceMaps": false,
	"freeVariableChecker": false,
	"validate": false,
	"strictSemicolons": false,
	"unstarredGenerators": false,
	"ignoreNolint": false,
	"blockBindings": true
};


traceur.require.makeDefault();
traceur.options = options;

require("./server").start();

// I had to change node_modules/express/node_modules/connect/lib/utils.js@exports.sign:160
