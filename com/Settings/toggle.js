const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;

module.exports = {
	aliases: ["TOGGLE", "SWITCH"],
	params: "<var>",
	description: "Changes a boolean value inside ShevBot.",
	examples: ["TOGGLE GREET"],
	order: 0,
	active: true,
	complete: true,
	visible: true,
	guild: false,
	pm: true,
	deleteCall: false,
	minArgs: 1,
	botPermissions: [],
	userPermissions: ["ADMINISTRATOR"],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		if(manifest.command.args[0].toUpperCase() === "ALLOWLOOPING") {
			if(!settings.allowLooping) {say("send", manifest.message.message, "You know not what you have done.");}
			settings.allowLooping = !settings.allowLooping;
		} else if(manifest.command.args[0].toUpperCase() === "DEBUG") {
			settings.debug = !settings.debug;
		} else if (manifest.command.args[0].toUpperCase() === "GREET") {
			settings.initialGreet = !settings.initialGreet;
		} else {
			say("send", manifest.message.message, "Please specify an actual variable to toggle.")
		}
	}
}