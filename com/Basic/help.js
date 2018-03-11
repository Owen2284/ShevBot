const Tools = require("./../../tools.js");
const fs = require("fs");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const pm = Tools.comms.pm;

module.exports = {
	aliases: ["HELP"],
	params: "",
	description: "Displays all comands and their usage.",
	examples: ["HELP","HELP REDDIT"],
	order: 0,
	active: true,
	complete: true,
	visible: false,
	guild: true,
	pm: true,
	deleteCall: true,
	minArgs: 0,
	botPermissions: [],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {

		// Storage variables.
		var helpString = "Hi " + manifest.author.author + ", here are all of my commands!"
		var categoriesToDo = [];
		var commandsToDo = [];
		var commandsSoon = [];

		// Store all of the categories and commands.
		helpString += "```\n";
		for (var com in commands) {
			var commandObject = commands[com];
			if (commandObject.visible) {
				if (commandObject.active) {
					commandsToDo.push(com);
					if (categoriesToDo.indexOf(commandObject.category) == -1) {
						categoriesToDo.push(commandObject.category);
					}
				} else {
					commandsSoon.push(com);
				}
			}
		}

		for (var cat in categoriesToDo) {

			// Construct category header.
			var headerString = categoriesToDo[cat] + " Commands";
			var headerBorder = "";
			for (var i = 0; j = headerString.length, i<j; i++) {headerBorder += "-";}
			helpString += headerBorder + "\n" + headerString + "\n" + headerBorder + "\n";

			// Add commands of the category.
			var commandsToRemove = [];
			for (var com in commandsToDo) {
				var commandObject = commands[commandsToDo[com]];
				var extra1 = ""; if (!commandObject.complete) {extra1 = "(INCOMPLETE)";}
				if (commandObject.category == categoriesToDo[cat] && commandObject.active) {
					helpString += details.commandCharacter + commandsToDo[com].aliases[0] + " " + commandObject.params
					helpString += "\t" + extra1 + "\n - " + commandObject.description + "\n\n"; 
					commandsToRemove = commandsToDo[com];
				}
			}
			helpString += "\n";
			
		}

		// Add the coming soon section.
		helpString += "------------\nComing Soon!\n------------\n";
		for (var i = 0; j = commandsSoon.length, i<j; i++) {
			if (i<j-1) {helpString += commandsSoon[i] + ", ";} else {helpString += commandsSoon[i];}
		}
		helpString += "\n```";

		// Sending the help text.
		if (helpString < 2000) {
			say("pm", manifest.message.message, helpString);
		} else {
			say("pm", manifest.message.message, helpString.substring(0,2000));
		}
		

	}
}