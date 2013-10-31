#!/usr/bin/env node

var fs = require("fs")
 ,  path = require("path")
 ,  npm = require("npm")
 ,  program = require("commander")
 ,  request = require("request")
;

var urls = {
	raw: "https://raw.github.com/ConnectAi/cornerstone-skeleton/master/",
	tree: "https://api.github.com/repos/connectai/cornerstone-skeleton/git/trees/master?recursive=1"
};

program
	.version(require("../package").version)
;

program.command("init [folder]")
	.description("Create an empty cornerstone project or reinitialize an existing one.")
	.option("-b, --bare", "bare project")
	.action(function(folder, options) {
		var outputFolder = process.cwd();
		if (folder) outputFolder = path.join(outputFolder, folder);
		if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

		if (options.bare) {
			console.log("bare project");
		} else {
			request.get({
				url: urls.tree,
				json: true
			}, function(err, res, body) {
				var dirs, files;
				if (!err && res.statusCode == 200) {
					dirs = body.tree
						.filter(function(branch) {
							return branch.type === "tree";
						})
						.map(function(branch) {
							return branch.path;
						});

					files = body.tree
						.filter(function(branch) {
							return branch.type !== "tree";
						})
						.map(function(branch) {
							return branch.path;
						});

					dirs.forEach(function(dir) {
						var where = outputFolder + "/" + dir;
						if (!fs.existsSync(where)) {
							fs.mkdirSync(where);
							console.log("Writing", where);
						} else {
							console.log("Skipping", where);
						}
					});

					files.forEach(function(file) {
						var where = outputFolder + "/" + file;
						if (!fs.existsSync(where)) {
							request(urls.raw + file).pipe(fs.createWriteStream(where));
							console.log("Writing", where);
						} else {
							console.log("Skipping", where);
						}
					});

					if (folder) {
						var config = require(outputFolder + "/config.json");
						config.name = folder;
						fs.writeFile(outputFolder + "/config.json", JSON.stringify(config, null, "\t"));
					}
				}
			});
		}
	})
;

program.parse(process.argv)
