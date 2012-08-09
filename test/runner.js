var MiniUnit = require("mini-unit");
var testCases = [
	"./common-log-test"
].map(function (path) {
	return require(path);
});

MiniUnit.runSuit(testCases);
