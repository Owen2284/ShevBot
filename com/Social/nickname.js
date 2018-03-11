const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["NICKNAME"],
	params: "<name>",
	description: "Randomises a person's nickname.",
	examples: ["NICKNAME Owen2284"],
	order: -1,
	active: true,
	complete: true,
	visible: true,
	guild: true,
	pm: false,
	deleteCall: false,
	minArgs: 1,
	botPermissions: ["CHANGE_NICKNAME", "MANAGE_NICKNAMES"],
	userPermissions: [],
	packages: ["moniker"],
	process: function(bot, manifest, data, settings, details, commands) {
		const message = manifest.message.message;
		const input = manifest.command.full;
		if (input.length > 1) {
			if (message.guild != null && message.guild.available) {
				var users = Tools.discord.getAllGuildMembers(message.guild);
				var theUser = null;
				for (var i in users) {
					if ((users[i].user.username.toUpperCase() === input[1].toUpperCase()) || (users[i].nickname != null && users[i].nickname.toUpperCase() === input[1].toUpperCase())) {
						theUser = users[i];
					}
				}
				if (theUser != null) {
					var Moniker = require("moniker");
					var nameGen = Moniker.generator([Moniker.adjective, Moniker.adjective, Moniker.noun]);
					var newNickArray = nameGen.choose().split("-");
					var newNickName = "";
					for (var i = 0; i < newNickArray.length; ++i) {
						newNickName += newNickArray[i].substring(0,1).toUpperCase() + newNickArray[i].substring(1) + " ";
					}
					newNickName = newNickName.substring(0, newNickName.length-1);
					theUser.setNickname(newNickName);
					say("send", message, "Nickname of " + theUser.user.username + " changed to \"" + newNickName + "\"!");
				} else {
					say("send", message, "Unable to find \"" + input[1] + "\" on the current server.");
				}
			} else {
				say("send", message, "This command can only be run in the text channel of a guild/server.")
			}
		} else {
			say("send", message, "Please provide the username/nickname of the user whose nickname should be changed.")
		}
	}
}