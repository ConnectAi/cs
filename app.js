var traceur = require("traceur/src/node/traceur");

traceur.options.arrayComprehension = true;
traceur.options.arrowFunctions = true;
traceur.options.blockBinding = true;
traceur.options.blockBindings = true;
traceur.options.cascadeExpression = true;
traceur.options.classes = true;
traceur.options.debug = false;
traceur.options.defaultParameters = true;
traceur.options.deferredFunctions = true;
traceur.options.destructuring = true;
traceur.options.experimental = true;
traceur.options.forOf = true;
traceur.options.freeVariableChecker = false;
traceur.options.generatorComprehension = true;
traceur.options.generators = true;
traceur.options.ignoreNolint = false;
traceur.options.modules = true;
traceur.options.privateNames = true;
traceur.options.privateNameSyntax = true;
traceur.options.propertyMethods = true;
traceur.options.propertyNameShorthand = true;
traceur.options.propertyOptionalComma = false;
traceur.options.restParameters = true;
traceur.options.sourceMaps = true;
traceur.options.spread = true;
traceur.options.strictSemicolons = false;
traceur.options.templateLiterals = true;
traceur.options.trapMemberLookup = false;
traceur.options.types = true;
traceur.options.unstarredGenerators = false;
traceur.options.validate = false;


traceur.require.makeDefault(function(path) {
	return !/node_modules/.test(path);
});

require("./server").start();
