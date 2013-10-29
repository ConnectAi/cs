#!/usr/bin/env node

var fs = require("fs")
 ,  path = require("path")
 ,  npm = require("npm")
 ,  program = require("commander")
 ,  ghdown = require("github-download")
;

program
	.version(require("../package").version)
;

program.command("init [folder]")
	.description("Create an empty cornerstone project or reinitialize an existing one.")
	.option("-b, --bare", "bare project")
	.action(function(folder, options) {
		var dir = process.cwd();
		if (folder) dir = path.join(dir, folder);

		if (options.bare) {
			console.log("bare project");
		} else {
			ghdown("git@github.com:ConnectAi/cornerstone-skeleton.git", dir)
				.on("error", function(err) {
					console.error(err);
				})
				.on("end", function() {
					fs.unlink(path.join(dir, ".gitignore"));
					npm.load(require(path.join(dir, "./package")), function() {
						npm.commands.install();
					});
				})
			;
		}
	})
;

program.parse(process.argv)
