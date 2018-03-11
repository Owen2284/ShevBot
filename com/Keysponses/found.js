const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const arrayToString = Tools.arrays.arrayToString;

module.exports = {
	aliases: ["FOUND"],
	params: "[\"keywords\",\"responses\"]",
	description: "List the keywords or responses found so far.",
	examples: ["FOUND keywords","FOUND responses"],
	order: -1,
	active: true,
	complete: true,
	visible: true,
	guild: true,
	pm: true,
	deleteCall: false,
	minArgs: 1,
	botPermissions: [],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		if (manifest.command.args[0].toUpperCase() === "KEYWORDS") {
			say("send", manifest.message.message, "All keywords found: \n" + arrayToString(data.commands["FOUND"]["keywords"], "\n"));
		} else if (manifest.command.args[0].toUpperCase() === "RESPONSES") {
			say("send", manifest.message.message, "All responses found: \n" + arrayToString(data.commands["FOUND"]["responses"], "\n"));
		} else {
			say("send", manifest.message.message, "Please enter either \"keywords\" or \"responses\" after \"" + details.commandCharacter + "FOUND\".");
		}
	}
}