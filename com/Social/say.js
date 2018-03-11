const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["SAY", "SPEAK"],
	params: "<message>",
	description: "Makes me say something!",
	examples: ["SAY \"Ayyyyyyyyy\""],
	order: -1,
	active: true,
	complete: true,
	visible: false,
	guild: true,
	pm: false,
	deleteCall: false,
	minArgs: 1,
	botPermissions: ["SEND_TTS_MESSAGES"],
	userPermissions: ["ADMINISTRATOR"],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		say("tts", manifest.message.message, manifest.message.raw.substring(manifest.command.name.length + 2));
	}
}