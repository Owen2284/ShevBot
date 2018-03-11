const Tools = require("./../../tools.js");
const readline = require('readline');
const fs = require("fs");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const getChannelMembersByName = Tools.discord.getChannelMembersByName;

module.exports = {
	aliases: ["IDOF"],
	params: "<name>",
	description: "Displays the Discord ID of the name provided.",
	examples: ["IDOF Owen2284","IDOF MechaOoccoo"],
	order: -1,
	active: true,
	complete: true,
	visible: true,
	guild: true,
	pm: false,
	deleteCall: false,
	minArgs: 1,
	botPermissions: [],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		const message = manifest.message.message;

		// Find the matching users.
		var nameToFind = manifest.command.args[0].toUpperCase();
		var users = getChannelMembersByName(manifest.channel.channel, nameToFind);

		// Print the found users.
		if (users.length == 0) {
			say("send", message, "\"" + input[1] + "\" not found on this server.");
		} else if (users.length == 1) {
			var nickString = ""; if (users[0].nickname != null) {nickString = " (" + users[0].nickname + ") ";}
			say("send", message, "The Discord ID of " + users[0].user.username + nickString + " is \"" + users[0].id + "\".");
		} else {
			var responseString = "Multiple users found:";
			for(var i=0;i<users.length;i++){
				var user = users[i];
				var nickString = ""; if (user.nickname != null) {nickString = " (" + user.nickname + ") ";}
				responseString += "\n\tThe Discord ID of " + user.user.username + nickString + " is \"" + user.id + "\".";
			}
			say("send", message, responseString);
		}

	}
}