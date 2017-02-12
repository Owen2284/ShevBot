/* 

ShevBot
Created on 3rd August 2016

Current Version: v2.1.1

Backend for my Discord bot, ShevBot.

https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot

*/

// Details
const details = {
	versionNumber: "2.2.0",
	repo: "https://github.com/Owen2284/ShevBot",
	commandCharacter: "+",
	dataDir: "data/",
	soundDir: "sounds/",
	musicDir: "music/"
}

// Modules.
const Tools = require("./tools.js");
Tools.cmd("module", "Module \"./tools.js\" successfully loaded.");
const Discord = Tools.requireSafely("discord.js");
const EmojiList = Tools.requireSafely("emojis-list");

// Tools.
const readJSON = Tools.readJSON;
const writeJSON = Tools.writeJSON;
const say = Tools.say;
const cmd = Tools.cmd;
const commandSplit = Tools.commandSplit;

// Commands.
var commands = Tools.requireSafely("./commands.js").shevbotCommands;

// Files
var data = {
	messages: readJSON(details.dataDir + "keysponses.json"), 
	found: readJSON(details.dataDir + "found.json"), 
	persistents: readJSON(details.dataDir + "persistents.json"),
	counters: readJSON(details.dataDir + "counters.json"),
	themes: readJSON(details.dataDir + "themes.json"),
	currentStreamDispatcher: null
};

// Settings
var settings = {
	debug: false,
	allowLooping: false,
	initialGreet: true
};

const greetingChannels = [
	"BOT"
];

const swears = [
	"FUCK", 
	"SHIT",
	"CUNT", 
	"DICK", 
	"TWAT", 
	"ARSE",
	"PISS",
	"COCK",
	"WANK",
	"SLAG",
	"WHORE",
	"NIGGA"
];

// Creating bot.
var bot = new Discord.Client();

// Ready event handler, greets allowed channels.
bot.on("ready", function() {

	if (!settings.debug && settings.initialGreet) {

		var channelArr = bot.channels.array();
		var greetingString = data.persistents["currentTheme"]["greeting"].replace("#VERSION", details.versionNumber);
		
		for (var i in channelArr) {
			var currentChannel = channelArr[i];
			if (currentChannel.constructor.name === "TextChannel") {
				for (var j in greetingChannels) {
					if (currentChannel.name.toUpperCase() === greetingChannels[j]) {
						currentChannel.sendMessage(greetingString);
						cmd("greet", "Channel \"" + currentChannel.name + "\" greeted.");
					}
				}
			}
		}

		settings.initialGreet = false;

	}

});

// Message event handler. Parses message and fires own events, and parse for commands and executes them.
bot.on("message", function(message) {
	
	var sender = message.author;
	var channel = message.channel;
	var raw = message.content;
	var input = raw.toUpperCase();
	var isCommand = input.substring(0, 1) === details.commandCharacter;	
	var isBot = sender.bot;
	
	if(!isBot || settings.allowLooping) {

		if (isCommand) {
			var command = commandSplit(raw); command[0] = command[0].replace(details.commandCharacter, "");
			evaluateCommand(message, sender, channel, command);
		} else {
			evaluateChat(message, sender, channel, raw);
			evaluateReactions(message);
			evaluateSwears(message, sender, channel, raw);
		}

	}

});

// Internal event handlers. 
bot.on("disconnected", function() {cmd("disconnect", "Disconnected! Shutting down..."); process.exit(1);});
bot.on("warn", function(m) {cmd("warning", m.toString())});
bot.on("error", function(m) {cmd("error", m.toString())});
bot.on("debug", function(m) {if (settings.debug) {cmd("debug", m.toString())}});
bot.on("voiceSpeaking", function() {if (settings.debug) {cmd("warning", "Speech detected.");}});

// Activate the bot.
bot.login("MjEwNTIyNjI1NTU2ODczMjE2.CsbtfA.dHoAx_dx4v2Yp2oJ-5qmxC6Uhqk");

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

function evaluateChat(message, sender, channel, text) {

	try {
		// Loop through all categories of messages.
		var allCategories = ["fullMatches", "partMatches"];	
		for (cat = 0; cat < allCategories.length; cat++) {

			// Get category from JSON.
			var category = data.messages[allCategories[cat]];

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
						if (data.found["keywords"].indexOf(keywords[j]) == -1) {data.found["keywords"].push(keywords[j]);}
						if (data.found["responses"].indexOf(send) == -1) {data.found["responses"].push(send);}
						writeJSON(details.dataDir + "found.json", data.found);
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
		for(swe = 0; swe < swears.length; swe++) {
			if(text.toUpperCase().includes(swears[swe])){
				swearsFound.push(swears[swe]);
				cmd("swear", "Swear detected.");
			}
		}

		// Counts the found swears.
		if(swearsFound.length > 0) {
			for(swe = 0; swe < swearsFound.length; swe++) {
				data.counters["swears"] += Tools.countOccurrences(text.toUpperCase(), swearsFound[swe], true);
			}
			say("send", message, "Current swear counter: " + data.counters["swears"]);
			writeJSON(details.dataDir + "counters.json", data.counters);
		}
	} catch (e) {
		cmd("swear", "Swear evaluation failed, error encountered:");	
		console.log(e.stack);
	}

}

function evaluateReactions(message) {

	try {
		var reactChance = 0.05;
		var q = Math.random();

		if (q < reactChance) {
			var emojiNumber = Math.floor(Math.random() * EmojiList.length);
			message.react(EmojiList[emojiNumber]);
			++data.counters["reacts"];
			cmd("react", "Reacted to message.");
		}
	} catch (e) {
		cmd("react", "Reaction failed, error encountered:");	
		console.log(e.stack);
	}

}