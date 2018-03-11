const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["DATE"],
	params: "",
	description: "Displays the current date.",
	examples: ["DATE"],
	order: 2,
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
		say("send", manifest.message.message, "The date is " + manifest.datetime.date + ".");
	}
}