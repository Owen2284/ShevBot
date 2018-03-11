const Tools = require("./../../tools.js");
const readline = require('readline');
const fs = require("fs");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const pm = Tools.comms.pm;
const readJSON = Tools.fs.readJSON;
const writeJSON = Tools.fs.writeJSON;

module.exports = {
	aliases: ["MAIL"],
	params: "[\"read\",\"write\",\"clear\"]",
	description: "Allows operation of ShevBot's mail system.",
	examples: ["MAIL read","MAIL write \"What's up you meme-loving fuck.\"","MAIL clear"],
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
		const input = manifest.command.full;
		var allMails = data.commands["MAIL"]["mails"];
		if (input.length > 1) {
			switch(input[1].toUpperCase()) {
				case "READ":
					var myMails = []
					for (var ma = 0; ma < allMails.length; ++ma) {
						var currentMail = allMails[ma];
						if (currentMail["recipient"] === sender.id) {
							myMails.push(currentMail);
						}
					}
					if (myMails.length <= 0) {
						say("reply", message, "you have no messages to read.");
					} else {
						var responseText = "you have " + myMails.length + " messages:\n";
						for (var i in myMails) {
							responseText += "\n\tFrom: " + myMails[i]["sender"] + "\n\tMessage: " + myMails[i]["message"] + "\n";
						}
						say("reply", message, responseText);
					}
					break;
				case "WRITE":
					if (input.length >= 4) { 
						var demUsers = manifest.message.message.channel.guild.members.array();
						var idfound = false;
						var recipientid = input[2];
						var mailBody = manifest.message.raw.substring(input[0].length + input[1].length + input[2].length + 4);
						for (var deu = 0; deu < demUsers.length; ++deu) {
							var datUser = demUsers[deu];
							if (datUser.id === recipientid) {idfound = true;}
						}
						if (idfound) {
							allMails.push({"sender":sender.username,"recipient":recipientid,"message":mailBody});
							writeJSON(details.dataDir + "commands.json", data.commands);
							say("reply", message, "mail sent!");
						} else {
							say("send", message, "Discord ID provided does not match any user on this server.");
						}
					} else if (input.length == 3) {
						say("send", message, "Please include a message to send!");
					} else if (input.length == 2) {
						say("send", message, "Please include the Discord ID of a user on this server.");
					}
					break;
				case "CLEAR":
					var myMails = []
					for (var ma = 0; ma < allMails.length; ++ma) {
						var currentMail = allMails[ma];
						if (currentMail["recipient"] === sender.id) {
							myMails.push(currentMail);
						}
					}
					if (myMails.length > 0) {
						for (var ma in myMails) {
							allMails.splice(allMails.indexOf(myMails[ma]), 1);
						}
						say("reply", message, "I have deleted any mails that were stored for you.");
						writeJSON(details.dataDir + "commands.json", data.commands);
					} else {
						say("reply", message, "you have no messages to clear.");
					}
					break;
				default:
					say("send", message, "The " + details.commandCharacter + "mail command needs another argument after it, such as \"read\", \"write\" or \"clear\"."); 
					break;
			}
		} else {
			say("send", message, "The " + details.commandCharacter + "mail command needs another argument after it, such as \"read\", \"write\" or \"clear\".");
		}
	}
}