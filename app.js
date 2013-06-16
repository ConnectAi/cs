var traceur = require("traceur/src/node/traceur");
traceur.require.makeDefault();

require("./server").start();

// I had to change node_modules/express/node_modules/connect/lib/utils.js@exports.sign:160
