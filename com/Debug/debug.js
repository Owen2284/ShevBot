const Tools = require("./../../tools.js");
const readline = require('readline');

module.exports = {
	aliases: ["DEBUG"],
	params: "",
	description: "Enables terminal entry and operation.",
	examples: ["DEBUG"],
	order: -1,
	active: false,
	complete: false,
	visible: false,
	guild: false,
	pm: true,
	deleteCall: false,
	minArgs: 0,
	botPermissions: [],
	userPermissions: ["ADMINISTRATOR"],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		const message = manifest.message.message;
		var rl = readline.createInterface({input: process.stdin, output: process.stdout});
		rl.question("", function(a) {
			console.log("\"" + a + "\"");
			rl.close();
		});
	}
}