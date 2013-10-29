#!/usr/bin/env node

var program = require("commander");

program
	.version(require("../package").version)

program.parse(process.argv)
