const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const getChannelMembers = Tools.discord.getChannelMembers;

module.exports = {
	aliases: ["IDLIST"],
	params: "",
	description: "Displays the Discord ID's of all users in the current guild.'",
	examples: ["IDLIST"],
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
		var users = getChannelMembers(manifest.channel.channel);
		var responseString = "Users and ID's found:\n";
		for (var i in users) {
			var nickString = ""; if (users[i].nickname != null) {nickString = "(" + users[i].nickname + ") ";}
			responseString += "\t" + users[i].user.username + " " + nickString + "- " + users[i].id + "\n";
		}
		say("send", manifest.message.message, responseString);
	}
}