const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["MYID"],
	params: "",
	description: "Displays your Discord ID.",
	examples: ["MYID"],
	order: -1,
	active: true,
	complete: true,
	visible: true,
	guild: true,
	pm: true,
	deleteCall: false,
	minArgs: 0,
	botPermissions: [],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		say("reply", manifest.message.message, "your ID is \"" + manifest.author.author.id + "\".");
	}
}