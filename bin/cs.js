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
					var nodes = body.tree.reduce(function(nodes, branch) {
						if (!(branch.type in nodes)) nodes[branch.type] = [];
						nodes[branch.type].push(branch.path);
						return nodes;
					}, {});

					nodes.tree.forEach(function(dir) {
						var where = outputFolder + "/" + dir;
						if (!fs.existsSync(where)) {
							fs.mkdirSync(where);
							console.log("Writing", where);
						} else {
							console.log("Skipping", where);
						}
					});

					nodes.blob.forEach(function(file) {
						var where = outputFolder + "/" + file;
						if (!fs.existsSync(where)) {
							var writer = fs.createWriteStream(where);
							request(urls.raw + file).pipe(writer);

							if (folder && file === "config.json") {
								writer.on("finish", function() {
									var config = require(where);
									config.name = folder;
									fs.writeFile(where, JSON.stringify(config, null, "\t"));
								});
							}
							console.log("Writing", where);
						} else {
							console.log("Skipping", where);
						}
					});
				}
			});
		}
	})
;

program.parse(process.argv)
