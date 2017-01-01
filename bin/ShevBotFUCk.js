/* 

ShevBot.js
Created on 3rd August 2016

Current Version: v0.5

Backend for my Discord bot, ShevBot.

https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot

*/

consoleMessage("Running ShevBot.js");

var Discord = require("discord.js");
var fs = require("fs");

var bot = new Discord.Client();

var messages = JSON.parse(readFile("messages.json"));

var found = JSON.parse(readFile("found.json"));

var debug = true;
var allowLooping = false;

var commandChar = "+";

var versionNumber = "v0.4";

var dataDir = "D:/Work/Bots/data/";
var soundDir = "D:/Work/Bots/sounds/";
var musicDir = "D:/Work/Bots/music/";

var swears = [
	"FUCK", 
	"SHIT",
	"CUNT", 
	"DICK", 
	"TWAT", 
	"ARSE"
];
var swearCounter = 0;

var commands = {

	"HELP": {
		description: "Lists all available commands.",
		parameters: "",
		usable:true,
		action: function(inBot, inMsg, inCmd, inCommands) {
			var helpingString = "";
			for ()
		}
	}
	
	"DATE": {
		description: "Displays the system date of the machine running ShevBot.",
		parameters: "",
		usable:true,
		action: function(inBot, inMsg, inCmd) {
			var date = new Date();
			var day = date.getDate().toString(); if(day.length<2) {day = "0" + day;}
			var month = date.getMonth().toString(); if(month.length<2) {month = "0" + month;}
			var year = date.getYear();
			var all = day + "/" + month + "/" + year;
			inBot.sendMessage(inMsg, "The date is " + all + ".");
		}
	},

	"TIME": {
		description: "Displays the system time of the machine running ShevBot.",
		parameters: "",
		usable:true,
		"action": function(inBot, inMsg, inCmd) {
			var date = new Date();
			var hours = date.getHours().toString(); if(hours.length<2) {hours = "0" + hours;}
			var mins = date.getMinutes().toString(); if(mins.length<2) {mins = "0" + mins;}
			var secs = date.getSeconds().toString(); if(secs.length<2) {secs = "0" + secs;}
			var all = hours + ":" + mins + ":" + secs;
			inBot.sendMessage(inMsg, "The time is " + all + ".");
		}
	},

	"SEARCH": {
		description:"BROKEN",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {
			if(command.length > 1) {
				var searchTerm = inCmd.substring(8).replace(/ /g, "+");
				inBot.sendMessage(message, "https://www.google.co.uk/#q=" + searchTerm);
			} else {
				inBot.sendMessage(message, "Please specify a search term.");
			}
		}
	},

	"MEME": {
		description:"BROKEN",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {		
			if(command.length > 1) {
				var searchTerm = raw.substring(6).replace(/ /g, "+");
				inBot.sendMessage(message, "Here's what I found for the meme '" + searchTerm + "', fam : https://www.google.co.uk/#q=" + searchTerm + "+meme");
			} else {
				inBot.sendMessage(message, "Please specify a search term.");
			}
		}

	},

	"TOGGLE": {
		description:"",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {}
	},

	"REFRESH": {
		description:"",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {}
	},

	"COUNT":{
		description:"",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {}
	},

	"FOUND": {
		description:"",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {}
	},

	"VOICE": {
		description:"",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {}
	},

	"SPEAK": {
		description:"",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {}
	},

	"SHUTUP": {
		description:"",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {}
	},

	"END": {
		description:"",
		parameters:"",
		usable:false,
		action: function(inBot, inMsg, inCmd) {}
	}

};

bot.on("message", function(message) {

	var sender = message.author;
	var raw = message.content;
	var input = raw.toUpperCase();
	var isCommand = input.substring(0, 1) === commandChar;	
	var command = raw.split(" "); command[0] = command[0].replace(commandChar, "").toUpperCase();
	
	if(!sender.bot || allowLooping) {

		commands["DATE"].action(bot, message, command);
		commands["TIME"].action(bot, message, command);

		// Chat evaluations.
		if (!isCommand) {

			// Message evaluator.
			var allCategories = ["fullMatches", "partMatches"];

			// Loop through all categories of messages.
			for (cat = 0; cat < allCategories.length; cat++) {
				// Get category from JSON.
				var category = messages[allCategories[cat]];
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
						if(determineMatch(allCategories[cat], keywords[j], input)) {
							// If match, output to console, get response, send message, and log the keyword and response.
							consoleMessage("Message match: " + keywords[j]);
							send = getResponse(responses);
							botMessage(command, message, send);
							arrayAddSingle(found["keywords"], keywords[j]);
							arrayAddSingle(found["responses"], send);
							writeFile("found.json", JSON.stringify(found));
							// Force advance to next pair.
							j = keywords.length;
						}
					}
				}
			}

			// Swearing evaluator.
			var swearDetected = false;
			for(swe = 0; swe < swears.length; swe++) {
				if(input.includes(swears[swe])){
					swearDetected = true;
				}
			}
			if(swearDetected) {
				for(swe = 0; swe < swears.length; swe++) {
					swearCounter = swearCounter + (input.match(/swears[swe]/g) || []).length;
				}
				bot.sendMessage(message, "Current swear counter: " + swearCounter);
			}

		}		

		// Command evaluations.
		else{
			var noCommand = false;
			switch(command[0]) {		
				case "HELP":
					bot.sendMessage(message, readFile("help.txt")); break;
				case "TOGGLE":
					if(command[1] === "LOOP") {
						if(!allowLooping) {bot.sendMessage(message, "You know not what you have done.");}
						allowLooping = !allowLooping;
					} else if(command[1] === "DEBUG") {
						debug = !debug;
					} else {
						bot.sendMessage(message, "Please specify a variable to toggle.")
					} break;
				/*
				case "TEST":
					bot.sendMessage(message, "Test successful!"); break;
				case "TIME":;
					bot.sendMessage(message, "The time is " + getTime() + "."); break;
				case "DATE":
					bot.sendMessage(message, "The date is " + getDate() + "."); break;
				*/
				case "REFRESH":
					var oldKeys = countMessages(messages, "keywords");
					var oldResp = countMessages(messages, "responses");
					messages = JSON.parse(cleanFile(readFile("found.json")));
					bot.sendMessage(message, "Messages refreshed.\n" + (countMessages(messages, "keywords") - oldKeys) + " new keywords!\n" + (countMessages(messages, "responses") - oldResp) + " new responses!"); break;
				case "COUNT":
					bot.sendMessage(message, "Keywords found: " + found["keywords"].length + "/" + countMessages(messages, "keywords") + ".\nResponses found: " + found["responses"].length + "/" + countMessages(messages, "responses") + "."); break;
				case "FOUND":
					if(command[1] === "KEYWORDS") {
						bot.sendMessage(message, "All keywords found: " + found["keywords"]);
					} else if(command[1] === "RESPONSES") {
						bot.sendMessage(message, "All responses found: " + found["responses"]);
					} else {
						bot.sendMessage(message, "Please enter either \"keywords\" or \"responses\" after \"" + commandChar + "found\".");
					} break;
				case "MEME":
					if(command.length > 1) {
						var searchTerm = raw.substring(6).replace(/ /g, "+");
						bot.sendMessage(message, "Here's what I found for the meme '" + searchTerm + "', fam : https://www.google.co.uk/#q=" + searchTerm + "+meme");
					} else {
						bot.sendMessage(message, "Please specify a search term.");
					} break;
				case "SEARCH":
					if(command.length > 1) {
						var searchTerm = raw.substring(8).replace(/ /g, "+");
						bot.sendMessage(message, "https://www.google.co.uk/#q=" + searchTerm);
					} else {
						bot.sendMessage(message, "Please specify a search term.");
					} break;
				case "END":
					if (sender.username === "Owen2284" || sender.username === "Owen") {
						botMessage("send", message, "ShevBot is shutting down. Bye!");
						setTimeout(terminate, 3000);
					} break;
				case "VOICE":
					if (bot.voiceConnections.length == 0) {
						if (command.length > 1) {
							var targetChannelRaw = raw.substring("!VOICE ".length);
							var targetChannelUpp = targetChannelRaw.toUpperCase();
							var channelsChannels = message.channel.server.channels;
							var joined = false;
							var joinedName = "general";
							for (chch = 0; chch < channelsChannels.length; chch++) {
								checkChannel = channelsChannels[chch];
								var theNameOfThis = checkChannel.name.toUpperCase();
								if (checkChannel instanceof Discord.VoiceChannel) {
									if (theNameOfThis === targetChannelUpp) {
										joinedName = checkChannel.name;
										bot.joinVoiceChannel(checkChannel, function(err, con) {});
										joined = true;
										break;
									}
								}
							}
							if (joined) {
								consoleMessage("Joined voice channel \"" + joinedName + "\".");
								botMessage("send", message, "Okay, I'll speak on the voice channel \"" + joinedName + "\"!");
							} else {
								botMessage("send", message, "Sorry, I couldn't find a voice channel called \"" + targetChannelRaw + "\" on this server...");
							}
						} else {
							botMessage("send", message, "Please enter a voice channel on this server after \"+voice\".");
						} 
					} else if (bot.voiceConnections.length == 1) {
						botMessage("send", message, "Sorry, I'm already speaking on \"" + bot.voiceConnection.voiceChannel.name + "\".");
					} else {
						consoleMessage("[whoops] ShevBot is currently on > 1 voice channel. This is bad.");
					} break;
				case "SPEAK":
					if (bot.voiceConnections.length == 1) {
						var currentConnection = bot.voiceConnection;
						var soundFileNames = fs.readdirSync(soundDir);
						var soundToPlay = soundFileNames[Math.floor((Math.random() * soundFileNames.length))];
						bot.voiceConnection.stopPlaying();
						currentConnection.playFile(soundDir + soundToPlay, {volume:"0.25"}, function(err, intent) {
							var whatIsAName = currentConnection.voiceChannel.name;
							consoleMessage("Starting to play \"" + soundToPlay + "\" on " + whatIsAName + ".");
							intent.on("time", function() {
								consoleMessage("Playing " + bot.voiceConnection.playing);
							});
							intent.on("end", function() {
								consoleMessage("Stopped playing.");
							});
							intent.on("error", function() {
								consoleMessage("Playback error.");
							})
						});
						consoleMessage(soundToPlay);
					} else if(bot.voiceConnections.length == 0) {
						botMessage("send", message, "Sorry, I'm not speaking on a voice channel at the moment.");
					} else {
						consoleMessage("[whoops] ShevBot is attempting to speak on more than one channel. Stopping speak request.");
					}
					break;
				case "SHUTUP":
					if (bot.voiceConnections.length == 1) {
						var currentChannel = bot.voiceConnection.voiceChannel;
						bot.leaveVoiceChannel(currentChannel, function(err, con) {});
						consoleMessage("Left voice channel \"" + currentChannel.name + "\".");
						botMessage("send", message, "I have stopped taking on the voice channel \"" + currentChannel.name + "\".");
					} else if(bot.voiceConnections.length == 0) {
						botMessage("send", message, "Sorry, I'm not speaking on a voice channel at the moment.");
					} else {
						consoleMessage("[whoops] ShevBot is currently on > 1 voice channel. This is bad.");
					}
					break;
				default:
					botMessage("send", message, "Whoops, that's not a ShevBot command!"); noCommand = true; break;
			}
			if (!noCommand) {
				confirmCommand(command);
			}
		}

	}

});

bot.on("ready", function() {
	for (i = 0; i < bot.channels.length; i++) {
		if (!debug) {bot.sendMessage(bot.channels[i], "Hi everyone, ShevBot " + versionNumber + "  at your service!");}
	}
});

bot.on("disconnected", function() {
	consoleMessage("Disconnected! Shutting down...");
	process.exit(1);	
});

bot.on("debug", function(m) {consoleMessage("[debug]" + m.toString())});
bot.on("warn", function(m) {consoleMessage("[warn]" + m.toString())});
bot.on("error", function(m) {consoleMessage("[error]" + m.toString())});


consoleMessage("Connecting to Discord servers.");
bot.loginWithToken("MjEwNTIyNjI1NTU2ODczMjE2.CoQAAQ.i_cUZdvpeSiM5AYGgSEaFIqYkgQ");
consoleMessage("Running.");

function countMessages(jsonFile, fieldToCount) {
	var n = 0;
	var toCount = jsonFile["fullMatches"];
	for (i = 0; i < toCount.length; i++) {
		if (typeof toCount[i][fieldToCount] === "string") {n += 1;} 
		else {n += toCount[i][fieldToCount].length;}
	}
	toCount = jsonFile["partMatches"];
	for (i = 0; i < toCount.length; i++) {
		if (typeof toCount[i][fieldToCount] === "string") {n += 1;} 
		else {n += toCount[i][fieldToCount].length;}
	}
	return n;
}

function arrayContains(arra, val) {
	foundo = false;
	for (mo = 0; mo < arra.length; mo++) {
		if (arra[mo] === val) {foundo = true;}
	}
	return foundo;
}

function arrayAddSingle(aarr, val) {
	if (!arrayContains(aarr,val)) {aarr.push(val);}
}

function botMessage(inType, inMessage, inText) {
	if (inType === "send") {bot.sendMessage(inMessage, inText);} 
	else if (inType === "reply") {bot.reply(inMessage, inText);} 
	else {consoleMessage("[whoops] Invalid response type for bot message.");}
}

function consoleMessage(cText) {
	console.log("[" + getTime() + "] " + cText);
}

function determineMatch(inCat, inKeyword, inCheck) {
	if (inCat === "fullMatches") {
		if(inCheck === inKeyword) {return true;} 
		else {return false;}
	} else if (inCat === "partMatches") {
		if(inCheck.includes(inKeyword))  {return true;} 
		else {return false;}
	} else {
		consoleMessage("[whoops] Invalid category for determineMatch.");
		return false;
	}
}

function getResponse(inResponses) {
	if(typeof inResponses === "string") {return inResponses;}
	else {return inResponses[Math.floor((Math.random() * inResponses.length))];}
}

function getTime() {
	var date = new Date();
	var hours = date.getHours().toString(); if(hours.length<2) {hours = "0" + hours;}
	var mins = date.getMinutes().toString(); if(mins.length<2) {mins = "0" + mins;}
	var secs = date.getSeconds().toString(); if(secs.length<2) {secs = "0" + secs;}
	return hours + ":" + mins + ":" + secs;
}

function getDate() {
	var date = new Date();
	var day = date.getDate().toString(); if(day.length<2) {day = "0" + day;}
	var month = date.getMonth().toString(); if(month.length<2) {month = "0" + month;}
	var year = date.getYear().toString();
	return day + "/" + month + "/" + year;
}

function confirmCommand(theCommand) {
	consoleMessage("Command \"" + commandChar + theCommand.toString().replace(/,/g, " ") + "\" completed.");
}

function arrayToString(tharr, delimeter) {
	var returnString = "";
	if (typeof tharr === "string") {return tharr;}
	else {for (ari = 0; ari < tharr.length; ari++) {returnString += tharr[ari] + delimeter;}}
	return returnString.substring(0, returnString.length - delimeter.length);
}

function readFile(path) {
	var temp = fs.readFileSync(path, "utf8");
	if(typeof temp === "string") {consoleMessage(path + " read successfully.");}
	return temp;
}

function writeFile(path, fileString) {
	if (typeof fileString === "string") {
		fs.writeFileSync(path, fileString);
		consoleMessage(path + " written successfully.");
	} else {
		consoleMessage("[whoops] Invalid string for writeFile.");
	}
}

function terminate() {
	bot.destroy(function(err) {
		if (err != null) {
			consoleMessage(err); 
		}
	});
	process.exit(0);
}

function dumpDebugInfo(thing) {
	consoleMessage(thing);
	consoleMessage(typeof thing);
	//consoleMessage(instanceof thing);
}