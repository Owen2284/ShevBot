/* 

ShevBot.js
Created on 3rd August 2016

Current Version: v1.0.1

Backend for my Discord bot, ShevBot.

https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot

*/

consoleMessage("Running ShevBot.js");

var Discord = require("discord.js");
var fs = require("fs");

var bot = new Discord.Client();

var messages = JSON.parse(readFile("data/messages.json"));

var found = JSON.parse(readFile("data/found.json"));

var persistents = JSON.parse(readFile("data/persistents.json"));

var debug = false;
var allowLooping = false;

var commandChar = "+";

var versionNumber = "v1.0.1";

var dataDir = "D:/Projects/ShevBot/data/";
var soundDir = "D:/Projects/ShevBot/sounds/";
var musicDir = "D:/Projects/ShevBot/music/";

var greetingChannels = [
	"BOT"
];

var swears = [
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
var swearCounter = 0;

bot.on("message", function(message) {

	var sender = message.author;
	var raw = message.content;
	var input = raw.toUpperCase();
	var isCommand = input.substring(0, 1) === commandChar;	
	var command = raw.split(" "); command[0] = command[0].replace(commandChar, "");
	
	if(!sender.bot || allowLooping) {

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
							writeFile("data/found.json", JSON.stringify(found, null, "\t"));
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
					consoleMessage("Swear detected.");
				}
			}
			if(swearDetected) {
				for(swe = 0; swe < swears.length; swe++) {
					swearCounter += occurrences(input, swears[swe], false);
				}
				bot.sendMessage(message, "Current swear counter: " + swearCounter);
			}

		}		

		// Command evaluations.
		else{
			var noCommand = false;
			switch(command[0].toUpperCase()) {		
				case "HELP":
					bot.sendMessage(message, readFile("data/help.txt")); break;
				case "TOGGLE":
					if(command[1] === "LOOP") {
						if(!allowLooping) {bot.sendMessage(message, "You know not what you have done.");}
						allowLooping = !allowLooping;
					} else if(command[1] === "DEBUG") {
						debug = !debug;
					} else {
						bot.sendMessage(message, "Please specify a variable to toggle.")
					} break;
				case "TEST":
					bot.sendMessage(message, "Test successful!"); break;
				case "TIME":;
					bot.sendMessage(message, "The time is " + getTime() + "."); break;
				case "DATE":
					bot.sendMessage(message, "The date is " + getDate() + "."); break;
				case "REFRESH":
					var oldKeys = countMessages(messages, "keywords");
					var oldResp = countMessages(messages, "responses");
					messages = JSON.parse(readFile("data/found.json"));
					bot.sendMessage(message, "Messages refreshed.\n" + (countMessages(messages, "keywords") - oldKeys) + " new keywords!\n" + (countMessages(messages, "responses") - oldResp) + " new responses!"); break;
				case "COUNT":
					bot.sendMessage(message, "Keywords found: " + found["keywords"].length + "/" + countMessages(messages, "keywords") + ".\nResponses found: " + found["responses"].length + "/" + countMessages(messages, "responses") + "."); break;
				case "FOUND":
					if(command.length > 1 && command[1].toUpperCase() === "KEYWORDS") {
						bot.sendMessage(message, "All keywords found: \n" + arrayToString(found["keywords"], "\n"));
					} else if(command.length > 1 && command[1].toUpperCase() === "RESPONSES") {
						bot.sendMessage(message, "All responses found: \n" + arrayToString(found["responses"], "\n"));
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
					if (command.length > 1) {
						switch(command[1].toUpperCase()) {
							case "JOIN":
								if (bot.voiceConnections.length == 0) {
									if (command.length > 2) {
										var targetChannelRaw = raw.substring("!VOICE JOIN ".length);
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
										botMessage("send", message, "Please enter a voice channel on this server after \"+voice join\".");
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
									var soundToPlayDir = soundDir + soundToPlay;
									bot.voiceConnection.stopPlaying();
									currentConnection.playFile(soundToPlayDir, {volume:"0.25"}, function(err, intent) {
										var whatIsAName = currentConnection.voiceChannel.name;
										consoleMessage("Starting to play \"" + soundToPlayDir + "\" on " + whatIsAName + ".");
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
									consoleMessage(soundToPlayDir);
								} else if(bot.voiceConnections.length == 0) {
									botMessage("send", message, "Sorry, I'm not speaking on a voice channel at the moment.");
								} else {
									consoleMessage("[whoops] ShevBot is attempting to speak on more than one channel. Stopping speak request.");
								} break;
							case "LEAVE":
								if (bot.voiceConnections.length == 1) {
									var currentChannel = bot.voiceConnection.voiceChannel;
									bot.leaveVoiceChannel(currentChannel, function(err, con) {});
									consoleMessage("Left voice channel \"" + currentChannel.name + "\".");
									botMessage("send", message, "I have stopped taking on the voice channel \"" + currentChannel.name + "\".");
								} else if(bot.voiceConnections.length == 0) {
									botMessage("send", message, "Sorry, I'm not speaking on a voice channel at the moment.");
								} else {
									consoleMessage("[whoops] ShevBot is currently on > 1 voice channel. This is bad.");
								} break;
							default:
								botMessage("send", message, "The +voice command needs another argument after it, such as \"join\", \"speak\" or \"leave\"."); noCommand = true;
						}
					} else {
						botMessage("send", message, "The +voice command needs another argument after it, such as \"join\", \"speak\" or \"leave\"."); noCommand = true;
					} break;
				case "MAIL":
					var allMails = persistents["mail"];
					if (command.length > 1) {
						switch(command[1].toUpperCase()) {
							case "READ":
								var senderid = sender.id;
								var anyMails = false;
								for (var ma = 0; ma < allMails.length; ++ma) {
									var currentMail = allMails[ma];
									if (currentMail["recipient"] === senderid) {
										botMessage("send", message, "From: " + currentMail["sender"] + "\nMessage: " + currentMail["message"]);
										anyMails = true;
									}
								}
								if (!anyMails) {
									botMessage("reply", message, "you have no ShevMails.");
								}
								break;
							case "WRITE":
								if (command.length >= 4) { 
									var demUsers = message.channel.server.members;
									var idfound = false;
									var recipientid = command[2];
									var mailBody = raw.substring(command[0].length + command[1].length + command[2].length + 4);
									for (var deu = 0; deu < demUsers.length; ++deu) {
										var datUser = demUsers[deu];
										if (datUser.id === recipientid) {idfound = true;}
									}
									if (idfound) {
										allMails.push({"sender":sender.username,"recipient":recipientid,"message":mailBody});
										botMessage("reply", message, "mail sent!");
										writeFile("data/persistents.json", JSON.stringify(persistents, null, "\t"));
									} else {
										botMessage("send", message, "Discord ID provided does not match any user on this server.");
									}
								} else if (command.length == 3) {
									botMessage("send", message, "Please include a message to send!");
								} else if (command.length == 2) {
									botMessage("send", message, "Please include the Discord ID of a user on this server.");
								}
								break;
							case "CLEAR":
								var senderid = sender.id;
								var anyMails = false;
								for (var ma = 0; ma < allMails.length; ++ma) {
									var currentMail = allMails[ma];
									if (currentMail["recipient"] === senderid) {
										allMails.splice(ma, 1);
										anyMails = true;
									}
								}
								if (anyMails) {
									botMessage("reply", message, "I have deleted any ShevMails stored for you.");
									writeFile("data/persistents.json", JSON.stringify(persistents, null, "\t"));
								} else {
									botMessage("reply", message, "you have no ShevMails.");
								}
								break;
							default:
								botMessage("send", message, "The +mail command needs another argument after it, such as \"read\", \"write\" or \"clear\"."); noCommand = true; break;
						}
					} else {
						botMessage("send", message, "The +mail command needs another argument after it, such as \"read\", \"write\" or \"clear\"."); noCommand = true;
					}
					break;
				case "REMINDER":
					var allRems = persistents["reminders"];
					if (command.length > 1) {
						switch(command[1].toUpperCase()) {
							case "READ":
								var senderid = sender.id;
								var anyRems = false;
								for (var ra = 0; ra < allRems.length; ++ra) {
									var currentRem = allRems[ra];
									if (currentRem["creator"] === senderid) {
										botMessage("send", message, "Reminder: " + currentRem["text"]);
										anyRems = true;
									}
								}
								if (!anyRems) {
									botMessage("reply", message, "you have no reminders.");
								}
								break;
							case "WRITE":
								if (command.length >= 3) { 
									var remainderBody = raw.substring(command[0].length + command[1].length + 3);
									allRems.push({"creator":sender.id,"text":remainderBody});
									botMessage("reply", message, "reminder created!");
									writeFile("data/persistents.json", JSON.stringify(persistents, null, "\t"));
								} else if (command.length == 2) {
									botMessage("send", message, "Please include a reminder to save!");
								}
								break;
							case "CLEAR":
								var senderid = sender.id;
								var anyRems = false;
								for (var ra = 0; ra < allRems.length; ++ra) {
									var currentRem = allRems[ra];
									if (currentRem["creator"] === senderid) {
										allRems.splice(ra, 1);
										anyRems = true;
									}
								}
								if (anyRems) {
									botMessage("reply", message, "I have deleted any reminders saved for you.");
									writeFile("data/persistents.json", JSON.stringify(persistents, null, "\t"));
								} else {
									botMessage("reply", message, "you have no reminders.");
								}
								break;
							default:
								botMessage("send", message, "The +reminder command needs another argument after it, such as \"read\", \"write\" or \"clear\"."); noCommand = true; break;
						}
					} else {
						botMessage("send", message, "The +reminder command needs another argument after it, such as \"read\", \"write\" or \"clear\"."); noCommand = true;
					}
					break;
				case "MYID":
					botMessage("reply", message, "your ID is \"" + sender.id + "\"."); break;
				case "IDOF":
					if (command.length >= 2) {
						var deezUsers = message.channel.server.members.getAll("username",command[1]);
						if (deezUsers.length == 0) {
							botMessage("send", message, "No such user found on this server.");
						} else if (deezUsers.length == 1) {
							botMessage("send", message, "The Discord ID of \"" + deezUsers[0] + "\" is \"" + deezUsers[0].id + "\".");
						} else {
							var responseStrang = "Multiple users found:";
							for(var i=0;i<deezUsers.length;i++){
								var user = deezUsers[i];
								responseStrang += "\nThe Discord ID of \"" + user + "\" is \"" + user.id + "\".";
							}
							botMessage("send", message, responseStrang);
						}
					} else {
						botMessage("send", message, "Please enter a username to get an ID for.");
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
	/*
	if (!debug) {
		for (var chi = 0; chi < bot.channels.length; chi++) {
			var channelToSayOn = bot.channels[chi];
			if (arrayContains(greetingChannels, channelToSayOn.name.toUpperCase())) {bot.sendMessage(channelToSayOn, "Hi everyone, ShevBot " + versionNumber + " at your service!");}
		}
	}
	*/
	if (!debug) {
		var channelArr = bot.channels.array();
		consoleMessage(channelArr);
		var testChannel = channelArr[0];
		consoleMessage(testChannel);
		var testName = testChannel.name;
		consoleMessage(testName);
		for (var chi = 0; chi < channelArr.length; chi++) {
			var channelToSayOn = channelArr[chi];
			channelToSayOn.sendMessage("Hi everyone, ShevBot " + versionNumber + " at your service!");
		}
	}
});

bot.on("disconnected", function() {
	consoleMessage("Disconnected! Shutting down...");
	process.exit(1);	
});

bot.on("debug", function(m) {consoleMessage("[debug] " + m.toString())});
bot.on("warn", function(m) {consoleMessage("[warn] " + m.toString())});
bot.on("error", function(m) {consoleMessage("[error] " + m.toString())});

bot.on("voiceSpeaking", function() {consoleMessage("[speech]");});

consoleMessage("Connecting to Discord servers.");
bot.login("MjEwNTIyNjI1NTU2ODczMjE2.CsbtfA.dHoAx_dx4v2Yp2oJ-5qmxC6Uhqk");
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
	if (inType === "send") {inMessage.channel.sendMessage(inText);} 
	else if (inType === "reply") {inMessage.reply(inText);} 
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
}

function arrayContains(aarrr, objuct) {
	for (var ift = 0; ift < aarrr.length; ift++) {
		if (aarrr[ift] === objuct) {
			return true;
		}
	}
	return false;
}

/** Function count the occurrences of substring in a string;
 * @param {String} string   Required. The string;
 * @param {String} subString    Required. The string to search for;
 * @param {Boolean} allowOverlapping    Optional. Default: false;
 * @author Vitim.us http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string, subString, allowOverlapping) {

	string += "";
	subString += "";
	if (subString.length <= 0) return (string.length + 1);

	var n = 0, pos = 0, step = allowOverlapping ? 1 : subString.length;

	while (true) {
		pos = string.indexOf(subString, pos);
		if (pos >= 0) {
			++n;
			pos += step;
		} else break;
	}
	return n;
}