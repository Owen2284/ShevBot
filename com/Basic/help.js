const Tools = require("./../../tools.js");
const fs = require("fs");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const pm = Tools.comms.pm;

module.exports = {
	aliases: ["HELP"],
	params: "",
	description: "Displays all comands and their usage.",
	examples: ["HELP","HELP REDDIT"],
	order: 0,
	active: true,
	complete: true,
	visible: false,
	guild: true,
	pm: true,
	deleteCall: true,
	minArgs: 0,
	botPermissions: [],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {

		// Get the string from the Tools function
		if (manifest.command.numArgs > 0) {
			for (var i in manifest.command.args) {
				// Get the string
				var commandHelpString = Tools.commands.getSpecificHelpString(commands, manifest.command.args[i], details.commandCharacter, false);

				// Send the string
				if (commandHelpString < 2000) {
					say("say", manifest.message.message, commandHelpString);
				} else {
					say("say", manifest.message.message, commandHelpString.substring(0,2000));
				}
			}
		} else {
			// Get the string
			var fullHelpString = Tools.commands.getFullHelpString(commands, manifest.author.author, details.commandCharacter);

			// Send the string
			if (fullHelpString < 2000) {
				say("pm", manifest.message.message, fullHelpString);
			} else {
				say("pm", manifest.message.message, fullHelpString.substring(0,2000));
			}
		}

	}
}