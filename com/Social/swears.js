const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["SWEARS"],
	params: "",
	description: "Displays the swear counter.",
	examples: ["SWEARS"],
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
		var swearCount = data.chat["swears"]["counter"];
		if (swearCount < 0) {
			say("send", manifest.message.message, "Current swear counter: " + swearCount + ". Uh... good job?");
		}
		else if (swearCount == 0) {
			say("send", manifest.message.message, "Current swear counter: " + swearCount + ". How well behaved!");
		}
		else if (swearCount <= 50) {
			say("send", manifest.message.message, "Current swear counter: " + swearCount + ". Watch your language!");
		}
		else if (swearCount <= 250) {
			say("send", manifest.message.message, "Current swear counter: " + swearCount + ". How vulgar!");
		}
		else {
			say("send", manifest.message.message, "Current swear counter: " + swearCount + ". Jesus would shed a tear if he saw this degeneracy.");
		}
	}
}

