const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const pm = Tools.comms.pm;
const readJSON = Tools.fs.readJSON;
const writeJSON = Tools.fs.writeJSON;

module.exports = {
	aliases: ["GAME"],
	params: "[\"select\",\"view\",\"add\",\"remove\",\"clear\"]",
	description: "Stores a list of games that can be randomly selected for users to play.",
	examples: ["GAME view","GAME select","GAME add \"Overwatch\""],
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
		const message = manifest.message.message;
		const input = manifest.command.full;
		switch(input[1].toUpperCase()) {
			case "ADD":
				if (input.length > 2) {
					var newGame = input[2]
					data.commands["GAME"]["list"].push(newGame);
					writeJSON(details.dataDir + "commands.json", data.commands);
					say("send", message, "\"" + newGame + "\" added to the current game list.");
				} else {
					say("send", message, "Please provide a game to add to the list.")
				}
				break;
			case "REMOVE":
				if (input.length > 2) {
					var gameToRemove = input[2]
					var theIndex = data.commands["GAME"]["list"].indexOf(gameToRemove)
					if (theIndex > -1) {
						data.commands["GAME"]["list"].splice(theIndex, 1);
						writeJSON(details.dataDir + "commands.json", data.commands);
						say("send", message, "\"" + gameToRemove + "\" removed from the current game list.");
					} else {
						say("send", message, "\"" + gameToRemove + "\" was not found in the game list.");
					}
				} else {
					say("send", message, "Please provide a game to remove from the list.")
				}
				break;
			case "CLEAR":
				data.commands["GAME"]["list"] = [];
				writeJSON(details.dataDir + "commands.json", data.commands);
				say("send", message, "Game list cleared.");
				break;
			case "SELECT":
				var gameIndex = Math.floor(Math.random() * data.commands["GAME"]["list"].length);
				say("send", message, "Selected game: " + data.commands["GAME"]["list"][gameIndex]);
				break;
			case "VIEW":
				var gameString = ""
				for (var numbi = 0; numbi < data.commands["GAME"]["list"].length; ++numbi){
					gameString += data.commands["GAME"]["list"][numbi] + ", "
				}
				say("send", message, "Current games in the list: " + gameString.substring(0, gameString.length-2));
				break;
			default:
				say("send", message, "The " + details.commandCharacter + "game command needs another argument after it, such as \"add\", \"remove\" or \"select\"."); break;
		}
	}
}