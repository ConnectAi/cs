require("6to5/register");

require("./server")
	.then(function(start) {
		start();
	});
