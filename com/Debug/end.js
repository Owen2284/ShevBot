const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["END"],
	params: "",
	description: "Closes the program.",
	examples: ["END"],
	order: -1,
	active: false,
	complete: false,
	visible: false,
	guild: true,
	pm: true,
	deleteCall: true,
	minArgs: 0,
	botPermissions: [],
	userPermissions: ["ADMINISTRATOR"],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		if (manifest.author.author.username === "Owen2284" || manifest.author.author.username === "Owen") {
			say("send", manifest.message.message, "ShevBot is shutting down. Bye!");
			process.exit(0);
		}
	}
}