const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["TIME"],
	params: "",
	description: "Displays the current time.",
	examples: ["TIME"],
	order: 3,
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
		say("send", manifest.message.message, "The time is " + manifest.datetime.time + ".");
	}
}