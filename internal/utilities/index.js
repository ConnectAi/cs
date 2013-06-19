require("./es6-shim");

var capitalize = function(word) {
	return word[0].toUpperCase() + word.substr(1);
};

module.exports = {
	capitalize
};
