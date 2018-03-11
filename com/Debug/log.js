const Tools = require("./../../tools.js");

const log = Tools.comms.cmd;

module.exports = {
	aliases: ["LOG"],
	params: "<message>",
	description: "Logs a message to the command prompt.",
	examples: ["LOG \"Hi there admin.\""],
	order: -1,
	active: true,
	complete: true,
	visible: false,
	guild: false,
	pm: true,
	deleteCall: false,
	minArgs: 1,
	botPermissions: [],
	userPermissions: ["ADMINISTRATOR"],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		const message = manifest.message.message;
		log("log", message.content.substring(5));
	}
}