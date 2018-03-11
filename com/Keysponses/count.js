const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["COUNT"],
	params: "",
	description: "Counts the amount of keywords and responses found so far.",
	examples: ["COUNT"],
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
		say("send", manifest.message.message, "Keywords found: " + data.commands["FOUND"]["keywords"].length + "/" + Tools.keysponses.countKeysponses(data.chat["keysponses"], "keywords") + ".\nResponses found: " + data.commands["FOUND"]["responses"].length + "/" + Tools.keysponses.countKeysponses(data.chat["keysponses"], "responses") + ".");
	}
}