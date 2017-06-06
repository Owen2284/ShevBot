/* 

ShevBot
Created on 3rd August 2016

Current Version: v2.3.0

Backend for my Discord bot, ShevBot.

https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot

*/

// Details
const details = {
	versionNumber: "2.3.0",
	repo: "https://github.com/Owen2284/ShevBot",
	commandCharacter: "+",
	dataDir: "data/",
	soundDir: "sounds/",
	musicDir: "music/"
}

// Modules.
const Tools = require("./tools.js");
Tools.cmd("boot", "ShevBot launched.");
Tools.cmd("module", "Module \"./tools.js\" successfully loaded.");
const Discord = Tools.requireSafely("discord.js");
const EmojiList = Tools.requireSafely("emojis-list");

// Tools.
const readJSON = Tools.readJSON;
const writeJSON = Tools.writeJSON;
const say = Tools.say;
const pm = Tools.pm;
const cmd = Tools.cmd;
const commandSplit = Tools.commandSplit;

// Commands.
var commands = Tools.requireSafely("./commands.js").shevbotCommands;

// Files
var data = {
	bot: readJSON(details.dataDir + "bot.json"),
	chat: readJSON(details.dataDir + "chat.json"), 
	commands: readJSON(details.dataDir + "commands.json")
};

// Settings
var settings = {
	debug: false,
	allowLooping: false,
	initialBoot: true,
	currentStreamDispatcher: null	
};

// Creating bot.
var bot = new Discord.Client();

// Ready event handler, greets allowed channels.
bot.on("ready", function() {

	if (settings.initialBoot) {

		// Increment the boot count.
		data.bot["boot"] = data.bot["boot"] + 1;
		writeJSON(details.dataDir + "bot.json", data.bot);
		cmd("boot", "Boot count incremented.");

		// Run greeting code.
		if (!settings.debug) {
			var channelArr = bot.channels.array();
			var greetingString = data.commands["THEME"]["currentTheme"]["greeting"].replace("#VERSION", details.versionNumber);
			for (var i in channelArr) {
				var currentChannel = channelArr[i];
				if (currentChannel.constructor.name === "TextChannel") {
					for (var j in data.chat["greetings"]["channelsToGreet"]) {
						if (currentChannel.name.toUpperCase() === data.chat["greetings"]["channelsToGreet"][j]) {
							currentChannel.send(greetingString);
							++data.chat["greetings"]["counter"];
							cmd("greet", "Channel \"" + currentChannel.name + "\" greeted.");
						}
					}
				}
			}
			writeJSON(details.dataDir + "chat.json", data.chat);
		}

		// Set a "game" to play.
		Tools.setNewGame(bot, data);

		// Toggle the initial boot variable.
		settings.initialBoot = false;
	}

});

// Message event handler. Parses message and fires own events, and parse for commands and executes them.
bot.on("message", function(message) {
	
	var sender = message.author;
	var channel = message.channel;
	var raw = message.content;
	var input = raw.toUpperCase();
	var isCommand = input.substring(0, 1) === details.commandCharacter;	
	var isLink = Tools.isLink(raw);
	var isBot = sender.bot;
	
	if(!isBot || settings.allowLooping) {
		if (isCommand) {
			var command = commandSplit(raw); command[0] = command[0].replace(details.commandCharacter, "");
			evaluateCommand(message, sender, channel, command);
		} else if (isLink){
			evaluateLink(message, sender, channel, raw);
		} else {
			evaluateMessage(message, sender, channel, raw);
			evaluateKeysponses(message, sender, channel, raw);
			evaluateReactions(message, sender, channel, raw);
			evaluateSwears(message, sender, channel, raw);
		}
	}

});

// Internal event handlers. 
bot.on("disconnected", function() {cmd("disconnect", "Disconnected! Shutting down..."); Tools.cmd("boot", "ShevBot ended."); process.exit(1);});
bot.on("warn", function(m) {cmd("warning", m.toString());});
bot.on("error", function(m) {cmd("error", m.toString());});
bot.on("debug", function(m) {if (settings.debug) {cmd("debug", m.toString())}});
bot.on("voiceSpeaking", function() {if (settings.debug) {cmd("warning", "Speech detected.");}});

// Creating interval calls.
const MINUTE = 60000;
setInterval(Tools.setNewGame, 30 * MINUTE, bot, data);

// Activate the bot.
bot.login("MjEwNTIyNjI1NTU2ODczMjE2.CsbtfA.dHoAx_dx4v2Yp2oJ-5qmxC6Uhqk");

/*---------------------------------------------------------------------------*/

function evaluateCommand(message, sender, channel, command) {

	// Get the necessary command data.
	var commandStart = command[0].toUpperCase();
	var commandName = command[0]
	var commandObject = commands[commandStart];
	cmd("command", "Executing command:- \"" + commandStart + "\"");

	// Checks for a command match.
	if (commandObject != undefined) {
		if (commandObject.active) {
			try {
				commandObject.process(bot, message, sender, channel, command, data, settings, details, commands);
				cmd("command", "Execution suceeded.");
			} 
			catch (e) {
				say("send", message, "Whoa! Shevbot encountered an error while executing the \"" + commandStart + "\" command! Please check the console for the stack trace.");
				cmd("command", "Execution failed, error encountered:");	
				console.log(e.stack);
			}
			return;
		} else {
			say("send", message, "Sorry, that command isn't currently active!");
			cmd("command", "Execution failed, command inactive.");
			return;		
		}
	} else {
		say("send", message, "Sorry, \"" + details.commandCharacter + commandName + "\" is not a command!");
		cmd("command", "Execution failed, command not found.");
		return;		
	}

}

function evaluateLink(message, sender, channel, text) {

	try {
		Tools.archiveAdd(sender.username, text, message.createdTimestamp, "links", details);
		cmd("links", "Link archived.");
	} catch (e) {
		cmd("links", "Execution failed, error encountered:");
		console.log(e.stack);
	}

}

function evaluateMessage(message, sender, channel, text) {

	try {
		Tools.archiveAdd(sender.username, text, message.createdTimestamp, "messages", details);
		cmd("message", "Message archived.");
	} catch (e) {
		cmd("message", "Execution failed, error encountered:");
		console.log(e.stack);
	}

}

function evaluateKeysponses(message, sender, channel, text) {

	try {
		// Loop through all categories of messages.
		var allCategories = ["fullMatches", "partMatches"];	
		for (cat = 0; cat < allCategories.length; cat++) {

			// Get category from JSON.
			var category = data.chat["keysponses"][allCategories[cat]];

			// Loop through all keyword-response pairs in the category.
			for (i = 0; i < category.length; i++) {

				// Retrieve data about each pair.
				var keywords = category[i]["keywords"]; if(typeof keywords === "string") {keywords = [keywords];}
				var responses = category[i]["responses"];
				var command = category[i]["command"];
				var send = "";

				// Loop through each potential keyword.
				for (j = 0; j < keywords.length; j++) {

					// Check if this keyword matches.
					if(Tools.determineMatch(allCategories[cat], keywords[j], text.toUpperCase())) {
						// If match, output to console, get response, send message, and log the keyword and response.
						cmd("keyword", "Keyword match: " + keywords[j]);
						send = Tools.getResponse(responses);
						say(command, message, send);
						if (data.commands["FOUND"]["keywords"].indexOf(keywords[j]) == -1) {data.commands["FOUND"]["keywords"].push(keywords[j]);}
						if (data.commands["FOUND"]["responses"].indexOf(send) == -1) {data.commands["FOUND"]["responses"].push(send);}
						writeJSON(details.dataDir + "commands.json", data.commands);
						// Force advance to next pair.
						j = keywords.length;
					}

				}

			}

		}
		return;
	} catch (e) {
		cmd("keyword", "Chat evaluation failed, error encountered:");	
		console.log(e.stack);
		return;
	}

}

function evaluateSwears(message, sender, channel, text) {

	try {
		// Determines swears in the message.
		var swearsFound = [];
		for(swe = 0; swe < data.chat["swears"]["swearlist"].length; swe++) {
			if(text.toUpperCase().includes(data.chat["swears"]["swearlist"][swe])){
				swearsFound.push(data.chat["swears"]["swearlist"][swe]);
				cmd("swear", "Swear detected.");
			}
		}

		// Counts the found swears.
		if(swearsFound.length > 0) {
			for(swe = 0; swe < swearsFound.length; swe++) {
				data.chat["swears"]["counter"] += Tools.countOccurrences(text.toUpperCase(), swearsFound[swe], true);
			}
			say("send", message, "Current swear counter: " + data.chat["swears"]["counter"]);
			writeJSON(details.dataDir + "chat.json", data.chat);
		}
	} catch (e) {
		cmd("swear", "Swear evaluation failed, error encountered:");	
		console.log(e.stack);
	}

}

function evaluateReactions(message, sender, channel, text) {

	try {
		var reactChance = 0.05;
		var q = Math.random();

		if (q < reactChance) {
			var emojiNumber = Math.floor(Math.random() * EmojiList.length);
			message.react(EmojiList[emojiNumber]);
			++data.chat["reacts"]["counter"];
			cmd("react", "Reacted to message.");
			writeJSON(details.dataDir + "chat.json", data.chat);
		}
	} catch (e) {
		cmd("react", "Reaction failed, error encountered:");	
		console.log(e.stack);
	}

}