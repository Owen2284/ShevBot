const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const readJSON = Tools.fs.readJSON;
const requireSafely = Tools.require.requireSafely;

module.exports = {
	aliases: ["REFRESH"],
	params: "",
	description: "Refreshes ShevBot's databases and commands.",
	examples: ["REFRESH"],
	order: 1,
	active: true,
	complete: false,
	visible: true,
	guild: true,
	pm: true,
	deleteCall: false,
	minArgs: 0,
	botPermissions: [],
	userPermissions: ["ADMINISTRATOR"],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		// Count number of current things.
		var keys = Tools.keysponses.countKeysponses(data.chat["keysponses"], "keywords") * -1;
		var resp = Tools.keysponses.countKeysponses(data.chat["keysponses"], "responses") * -1;
		var coms = 0; for (var i in commands) {
			var commandObject = commands[i];
			if (commandObject.active) {coms -= 1;}
		}

		// Read in new keywords and responses.
		data.chat["keysponses"] = readJSON(details.dataDir + "chat.json")["keysponses"];

		// Replace commands in the parameter object with the new commands.
		var newCommands = requireSafely("./commands.js").shevbotCommands;
		for (var key in newCommands) {
			var newCommObj = newCommands[key];
			commands[key] = newCommObj;
		}

		// Count new things.
		keys += Tools.keysponses.countKeysponses(data.chat["keysponses"], "keywords");
		resp += Tools.keysponses.countKeysponses(data.chat["keysponses"], "responses");
		for (var i in commands) {
			var commandObject = commands[i];
			if (commandObject.active) {coms += 1;}
		}

		// Output counts.
		say("send", manifest.message.message, "Databases and commands refreshed:\n" + 
			coms + " new commands!\n" +
			keys + " new keywords!\n" + 
			resp + " new responses!");
	}
}