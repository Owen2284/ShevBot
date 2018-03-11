const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["INFO"],
	params: "",
	description: "Find out detailed info about ShevBot.",
	examples: ["INFO"],
	order: 1,
	active: true,
	complete: true,
	visible: true,
	guild: true,
	pm: true,
	deleteCall: true,
	minArgs: 0,
	botPermissions: [],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		const message = manifest.message.message;
		var info = "Hi, I'm ShevBot!\n";
		info += "Created by Owen Shevlin.\n"
		info += "In development since 6th August 2016.\n"
		info += "Currently running on v" + details.versionNumber + ".\n";
		info += "GitHub Repo available at: " + details.repo + ".\n\n";
		info += "I'm a bot capable of running defined commands, parsing and responding to messages, analysing users, and more!\n";
		info += "To see a full list of the commands I understand, simply type \"" + details.commandCharacter + "HELP\".\n";
		info += "Hope you enjoy using me!";
		say("send", message, info);
	}
}