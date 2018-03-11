const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["SHITPOST"],
	params: "<username/nickname>",
	description: "Generates a random message based on the user's previous messages.",
	examples: ["SHITPOST Owen2284"],
	order: -1,
	active: false,
	complete: false,
	visible: true,
	guild: true,
	pm: true,
	deleteCall: false,
	minArgs: 1,
	botPermissions: ["READ_MESSAGE_HISTORY"],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {}
}