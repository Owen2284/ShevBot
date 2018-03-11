const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const pm = Tools.comms.pm;

module.exports = {
	aliases: ["TEST"],
	params: "",
	description: "Test command.",
	examples: ["TEST"],
	order: -1,
	active: true,
	complete: true,
	visible: false,
	guild: true,
	pm: true,
	deleteCall: false,
	minArgs: 0,
	botPermissions: [],
	userPermissions: ["ADMINISTRATOR"],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		const message = manifest.message.message;
		const input = manifest.command.full;
		// Test code.
		//throw new Error("test");
		// Success message.
		say("send", message, "Test complete!");
	}
}