var controllers = ["User"].map(function(name){
	var controller = require("./" + name);
	return controller;
});

module.exports = controllers;
