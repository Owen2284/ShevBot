const Tools = require("./tools.js");
const func = Tools.commandSplit;

var data = ["Hello World.", "This is \" a test \".", "+voice join \"The Good Corner\" ", "new    \"  \"  test"];

console.log("");
console.log("---");
for (var i in data) {
	var result = func(data[i]);
	for (var j in result) {
		console.log(result[j]);
	}
	console.log("---");
}