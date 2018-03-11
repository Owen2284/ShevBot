const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const pm = Tools.comms.pm;
const readJSON = Tools.fs.readJSON;
const writeJSON = Tools.fs.writeJSON;

module.exports = {
	aliases: ["REMINDER"],
	params: "[\"read\",\"write\",\"clear\"]",
	description: "Allows for the use of ShevBot's reminder system.",
	examples: ["REMINDER read","REMINDER write \"Buy eggs.\"","REMINDER clear"],
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
		var allRems = data.commands["REMINDER"]["reminders"];
		if (input.length > 1) {
			switch(input[1].toUpperCase()) {
				case "READ":
					var myRems = [];
					for (var ra = 0; ra < allRems.length; ++ra) {
						var currentRem = allRems[ra];
						if (currentRem["creator"] === sender.id) {
							myRems.push(currentRem);
						}
					}
					if (myRems.length <= 0) {
						say("reply", message, "you have no reminders to read.");
					} else {
						var responseText = "you have " + myRems.length + " reminders:";
						for (var i in myRems) {
							responseText += "\n\t" + myRems[i]["text"];
						}
						say("reply", message, responseText);
					}
					break;
				case "WRITE":
					if (input.length >= 3) { 
						var remainderBody = manifest.message.raw.substring(input[0].length + input[1].length + 3);
						allRems.push({"creator":sender.id,"text":remainderBody});
						writeJSON(details.dataDir + "commands.json", data.commands);
						say("reply", manifest.message.message, "reminder created!");
					} else if (input.length == 2) {
						say("send", message, "Please include a reminder to save!");
					}
					break;
				case "CLEAR":
					var myRems = [];
					for (var ra = 0; ra < allRems.length; ++ra) {
						var currentRem = allRems[ra];
						if (currentRem["creator"] === sender.id) {
							myRems.push(currentRem);
						}
					}
					if (myRems.length > 0) {
						for (var ra in myRems) {
							allRems.splice(allRems.indexOf(myRems[ra]), 1);
						}
						writeJSON(details.dataDir + "commands.json", data.commands);
						say("reply", message, "I have deleted any reminders you had saved.");
					} else {
						say("reply", message, "you have no reminders to clear.");
					}
					break;
				default:
					say("send", message, "The " + details.commandCharacter + "reminder command needs another argument after it, such as \"read\", \"write\" or \"clear\"."); break;
			}
		} else {
			say("send", message, "The " + details.commandCharacter + "reminder command needs another argument after it, such as \"read\", \"write\" or \"clear\"."); noCommand = true;
		}
	}
}