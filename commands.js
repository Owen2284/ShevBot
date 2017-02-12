const Tools = require("./tools.js");
const readline = require('readline');
const fs = require("fs");

const say = Tools.say;
const cmd = Tools.cmd;

var commands = {

	"HELP": {
		params: "",
		description: "Displays all comands and their usage.",
		category: "Basic",
		active: true,
		complete: true,
		visible: false,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {

			// Storage variables.
			var helpString = "```\n";
			var categoriesToDo = [];
			var commandsToDo = [];
			var commandsSoon = [];

			// TODO: Make it a PM?
			if (input.length == 1) {

				// Store all of the categories and commands.
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
							helpString += details.commandCharacter + commandsToDo[com] + " " + commandObject.params
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
				say("send", message, helpString);

			} else {
				cmd("command", "Non-typical help execution.");	
			}

		}
	},

	"INFO": {
		params: "",
		description: "Find out detailed info about ShevBot.",
		category: "Basic",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			var info = "Hi, I'm ShevBot!\n";
			info += "Created by Owen Shevlin.\n"
			info += "In development since 6th August 2016.\n"
			info += "Currently running on v" + details.versionNumber + ".\n";
			info += "GitHub Repo available at: " + details.repo + ".\n\n";
			info += "I'm a bot capable of running defined commands, parsing and responding to messages, analysing users, and more!\n";
			info += "To see a full list of the commands I understand, simply type \"" + details.commandCharacter + "HELP\".\n";
			info += "Hope you enjoy using me!";
			say("send", message, info);
		}
	},

	"TIME": {
		params: "",
		description: "Displays the current time.",
		category: "Basic",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			say("send", message, "The time is " + Tools.getTime() + ".");
		}
	},

	"DATE": {
		params: "",
		description: "Displays the current date.",
		category: "Basic",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			say("send", message, "The date is " + Tools.getDate() + ".");
		}
	},

	"TOGGLE": {
		params: "<var>",
		description: "Changes a boolean value inside ShevBot.",
		category: "Settings",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			if(input[1].toUpperCase() === "ALLOWLOOPING") {
				if(!settings.allowLooping) {say("send", message, "You know not what you have done.");}
				settings.allowLooping = !settings.allowLooping;
			} else if(input[1].toUpperCase() === "DEBUG") {
				settings.debug = !settings.debug;
			} else if (input[1].toUpperCase() === "GREET") {
				settings.initialGreet = !settings.initialGreet;
			} else {
				say("send", message, "Please specify a variable to toggle.")
			}
		}
	},

	"REFRESH": {
		params: "",
		description: "Refreshes ShevBot's databases and commands.",
		category: "Settings",
		active: true,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			// Count number of current things.
			var keys = Tools.countMessages(data.messages, "keywords") * -1;
			var resp = Tools.countMessages(data.messages, "responses") * -1;
			var coms = 0; for (var i in commands) {
				var commandObject = commands[i];
				if (commandObject.active) {coms -= 1;}
			}

			// Read in new keywords and responses.
			messages = JSON.parse(Tools.readFile(details.dataDir + "keysponses.json"));

			// Replace commands in the parameter object with the new commands.
			var newCommands = Tools.requireSafely("./commands.js").shevbotCommands;
			for (var key in newCommands) {
				var newCommObj = newCommands[key];
				commands[key] = newCommObj;
			}

			// Count new things.
			keys += Tools.countMessages(data.messages, "keywords");
			resp += Tools.countMessages(data.messages, "responses");
			for (var i in commands) {
				var commandObject = commands[i];
				if (commandObject.active) {coms += 1;}
			}

			// Output counts.
			say("send", message, "Databases and commands refreshed:\n" + 
				coms + " new commands!\n" +
				keys + " new keywords!\n" + 
				resp + " new responses!");
		}
	},

	"COUNT": {
		params: "",
		description: "Counts the amount of keywords and responses found so far.",
		category: "Keyword/Response",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			say("send", message, "Keywords found: " + data.found["keywords"].length + "/" + Tools.countMessages(data.messages, "keywords") + ".\nResponses found: " + data.found["responses"].length + "/" + Tools.countMessages(data.messages, "responses") + ".");
		}
	},

	"FOUND": {
		params: "[\"keywords\",\"responses\"]",
		description: "List the keywords or responses found so far.",
		category: "Keyword/Response",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			if(input.length > 1 && input[1].toUpperCase() === "KEYWORDS") {
				say("send", message, "All keywords found: \n" + Tools.arrayToString(data.found["keywords"], "\n"));
			} else if(input.length > 1 && input[1].toUpperCase() === "RESPONSES") {
				say("send", message, "All responses found: \n" + Tools.arrayToString(data.found["responses"], "\n"));
			} else {
				say("send", message, "Please enter either \"keywords\" or \"responses\" after \"" + settings.commandCharacter + "found\".");
			}
		}
	},

	"SEARCH": {
		params: "<term>",
		description: "Searches the web for the search term provided.",
		category: "Web",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			if(input.length > 1) {
				var searchTerm = message.content.substring(8).replace(/ /g, "+");
				say("send", message, "Here's what I found for \"" + searchTerm + "\" via Google : https://www.google.co.uk/#q=" + searchTerm);
			} else {
				say("send", message, "Please specify a search term.");
			}
		}
	},

	"MEME": {
		params: "<term>",
		description: "Find the zestiest memes for the search term provided.",
		category: "Web",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			if(input.length > 1) {
				var searchTerm = message.content.substring(6).replace(/ /g, "+");
				say("send", message, "Here's what I found for the meme \"" + searchTerm + "\", fam : https://www.google.co.uk/#q=" + searchTerm + "+meme");
			} else {
				say("send", message, "Please specify a meme, m8.");
			}
		}
	},

	"END": {
		params: "",
		description: "Closes the program.",
		category: "Debug",
		active: false,
		complete: false,
		visible: false,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			if (sender.username === "Owen2284" || sender.username === "Owen") {
				say("send", message, "ShevBot is shutting down. Bye!");
				Tools.terminate(bot);
			}
		}
	},

	"MYID": {
		params: "",
		description: "Displays your Discord ID.",
		category: "ID",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			say("reply", message, "your ID is \"" + sender.id + "\".");
		}
	},

	"IDOF": {
		params: "<name>",
		description: "Displays the Discord ID of the name provided.",
		category: "ID",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {

			if (input.length >= 2) {

				// Find the matching users.
				var nameToFind = input[1].toUpperCase();
				var guildMembers = message.channel.guild.members.array();
				var users = [];
				for (var i in guildMembers) {
					var member = guildMembers[i];
					if (member.user.username.toUpperCase() === nameToFind || (member.nickname != null && member.nickname.toUpperCase() === nameToFind) ) {
						users.push(member);
					}
				}

				// Print the found users.
				if (users.length == 0) {
					say("send", message, "\"" + input[1] + "\" not found on this server.");
				} else if (users.length == 1) {
					var nickString = ""; if (users[0].nickname != null) {nickString = " (" + users[0].nickname + ") ";}
					say("send", message, "The Discord ID of " + users[0].user.username + nickString + " is \"" + users[0].id + "\".");
				} else {
					var responseString = "Multiple users found:";
					for(var i=0;i<users.length;i++){
						var user = users[i];
						var nickString = ""; if (user.nickname != null) {nickString = " (" + user.nickname + ") ";}
						responseString += "\n\tThe Discord ID of " + user.user.username + nickString + " is \"" + user.id + "\".";
					}
					say("send", message, responseString);
				}

			} else {
				say("send", message, "Please enter a username to get an ID for.");
			}

		}
	},

	"IDLIST": {
		params: "<name>",
		description: "Displays the Discord ID's of all connected users.'",
		category: "ID",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			var users = message.channel.guild.members.array();
			var responseString = "Users and ID's found:\n";
			for (var i in users) {
				var nickString = ""; if (users[i].nickname != null) {nickString = "(" + users[i].nickname + ") ";}
				responseString += "\t" + users[i].user.username + " " + nickString + "- " + users[i].id + "\n";
			}
			say("send", message, responseString);
		}
	},

	"VOICE": {
		params: "[\"join\",\"speak\", \"switch\", \"leave\"]",
		description: "Operates ShevBot's voice capabilities.",
		category: "Voice",
		active: true,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			if (input.length > 1) {
				switch(input[1].toUpperCase()) {
					case "JOIN":
						if (bot.voiceConnections.array().length == 0) {
							if (input.length > 2) {
								var targetChannelRaw = message.content.substring(1 + input[0].length + 1 + input[1].length + 1);
								var targetChannelUpp = targetChannelRaw.toUpperCase();
								var channelsChannels = message.channel.guild.channels.array();
								var joined = false;
								var joinedName = "general";
								for (chch = 0; chch < channelsChannels.length; chch++) {
									checkChannel = channelsChannels[chch];
									var theNameOfThis = checkChannel.name.toUpperCase();
									if (theNameOfThis === targetChannelUpp && checkChannel.constructor.name === "VoiceChannel") {
										joinedName = checkChannel.name;
										checkChannel.join();
										joined = true;
										break;
									}
								}
								if (joined) {
									cmd("voice", "Joined voice channel \"" + joinedName + "\".");
									say("send", message, "Okay, I'll speak on the voice channel \"" + joinedName + "\"!");
								} else {
									say("send", message, "Sorry, I couldn't find a voice channel called \"" + targetChannelRaw + "\" on this server...");
								}
							} else {
								say("send", message, "Please enter a voice channel on this server after \"" + details.commandCharacter + "VOICE JOIN\".");
							} 
						} else if (bot.voiceConnections.array().length == 1) {
							say("send", message, "Sorry, I'm already speaking on \"" + bot.voiceConnections.array()[0].channel.name + "\".");
						} else {
							cmd("voice", "ShevBot is currently on > 1 voice channel. This is bad.");
						} break;
					case "SWITCH":
						say("send", message, "Sorry, I haven't had that command programmed in yet!");
					case "LEAVE":
						if (bot.voiceConnections.array().length == 1) {
							if (data.currentStreamDispatcher != null) {data.currentStreamDispatcher.end(); data.currentStreamDispatcher == null;}
							var currentChannel = bot.voiceConnections.array()[0].channel;
							currentChannel.leave();
							cmd("voice", "Left voice channel \"" + currentChannel.name + "\".");
							say("send", message, "I have stopped taking on the voice channel \"" + currentChannel.name + "\".");
						} else if(bot.voiceConnections.array().length == 0) {
							say("send", message, "Sorry, I'm not speaking on a voice channel at the moment.");
						} else {
							cmd("whoops", "ShevBot is currently on > 1 voice channel. This is bad.");
						} break;
					case "SPEAK":
						if (bot.voiceConnections.array().length == 1) {
							var currentConnection = bot.voiceConnections.array()[0];
							var soundFileNames = fs.readdirSync(details.soundDir);
							var soundToPlay = soundFileNames[Math.floor((Math.random() * soundFileNames.length))];
							var soundToPlayDir = details.soundDir + soundToPlay;
							if (data.currentStreamDispatcher != null) {data.currentStreamDispatcher.end(); data.currentStreamDispatcher == null;}
							data.currentStreamDispatcher = currentConnection.playFile(soundToPlayDir, {volume:"0.25"});
							cmd("voice", "Playing \"" + soundToPlay + "\"");
						} else if(bot.voiceConnections.array().length == 0) {
							say("send", message, "Sorry, I'm not speaking on a voice channel at the moment.");
						} else {
							cmd("whoops", "ShevBot is attempting to speak on more than one channel. Stopping speak request.");
						} break;
					default:
						say("send", message, "The " + details.commandCharacter + "voice command needs another argument after it, such as \"join\"  or \"leave\".");
						break;
				}
			} else {
				say("send", message, "The " + details.commandCharacter + "voice command needs another argument after it, such as \"join\" or \"leave\".");
			}
		}
	},

	"MAIL": {
		params: "[\"read\",\"write\",\"clear\"]",
		description: "Allows operation of ShevBot's mail system.",
		category: "Mail",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			var allMails = data.persistents["mail"];
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
							var demUsers = message.channel.guild.members.array();
							var idfound = false;
							var recipientid = input[2];
							var mailBody = message.content.substring(input[0].length + input[1].length + input[2].length + 4);
							for (var deu = 0; deu < demUsers.length; ++deu) {
								var datUser = demUsers[deu];
								if (datUser.id === recipientid) {idfound = true;}
							}
							if (idfound) {
								allMails.push({"sender":sender.username,"recipient":recipientid,"message":mailBody});
								Tools.writeFile(details.dataDir + "persistents.json", JSON.stringify(data.persistents, null, "\t"));
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
							Tools.writeFile(details.dataDir + "persistents.json", JSON.stringify(data.persistents, null, "\t"));
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
	},

	"REMINDER": {
		params: "[\"read\",\"write\",\"clear\"]",
		description: "Allows for the use of ShevBot's reminder system.",
		category: "Reminder",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			var allRems = data.persistents["reminders"];
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
							var remainderBody = message.content.substring(input[0].length + input[1].length + 3);
							allRems.push({"creator":sender.id,"text":remainderBody});
							Tools.writeFile(details.dataDir + "persistents.json", JSON.stringify(data.persistents, null, "\t"));
							say("reply", message, "reminder created!");
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
							Tools.writeFile(details.dataDir + "persistents.json", JSON.stringify(data.persistents, null, "\t"));
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
	},

	"SAY": {
		params: "<message>",
		description: "Makes me say something!",
		category: "Social",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			say("send", message, message.content.substring(5));
		}
	},

	"THEME": {
		params: "<theme name>",
		description: "Lists ShevBot themes, or changes the theme when a theme's name is provided.",
		category: "Cosmetic",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			// Change theme to specified theme.
			if (input.length > 1) {
				var themeName = input[1];
				var found = false;
				for (var i in data.themes) {
					var themeObj = data.themes[i];
					if (themeObj["name"].toUpperCase() === themeName.toUpperCase()) {
						if (data.persistents["currentTheme"]["name"].toUpperCase() !== themeName.toUpperCase()) {
							data.persistents["currentTheme"] = themeObj;
							Tools.changeTheme(bot, data);
							Tools.writeFile(details.dataDir + "persistents.json", JSON.stringify(data.persistents, null, "\t"));
						}
						say("send", message, data.persistents["currentTheme"]["change"]);
						found = true;
					}
				}
				if (!found) {say("send", message, "Sorry, but ShevBot has no \"" + themeName + "\" theme.");}
			} 
			// Displays a list of all themes.
			else {
				var themesString = "Available ShevBot themes: ";
				for (var i in data.themes) {
					if (i>0) {themesString += ", ";}
					var themeObj = data.themes[i];
					themesString += themeObj.name;
				}
				themesString += ".";
				say("send", message, themesString);
			}
		}
	},

	"SILENCE": {
		params: "",
		description: "",
		category: "Social",
		active: false,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {}
	},

	"TOPIC": {
		params: "",
		description: "Sets a random topic for the current channel.",
		category: "Social",
		active: false,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {}
	},

	"YOUTUBE": {
		params: "<channel name>",
		description: "Fetches the most recent video from a Youtube channel.",
		category: "Web",
		active: false,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {}
	},

	"TWITTER": {
		params: "<twitter user tag / hashtag>",
		description: "Fetches the most recent tweet from the specified twitter user or hashtag.",
		category: "Web",
		active: false,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {}
	},

	"REDDIT": {
		params: "<subreddit name>",
		description: "Fetches the top post of the specified subreddit.",
		category: "Web",
		active: false,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {}
	},

	"SHITPOST": {
		params: "<username / nickname>",
		description: "Generates a random message based on the user's previous messages.",
		category: "Social",
		active: false,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {}
	},

// ==================================================================================================================================

	"LOG": {
		params: "<message>",
		description: "Logs a message to the command prompt.",
		category: "Debug",
		active: true,
		complete: true,
		visible: false,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			cmd("[log] " + message.content.substring(5));
		}
	},	

	"DEBUG": {
		params: "",
		description: "Enables terminal entry and operation.",
		category: "Debug",
		active: false,
		complete: false,
		visible: false,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			var rl = readline.createInterface({input: process.stdin, output: process.stdout});
			rl.question("", function(a) {
				console.log("\"" + a + "\"");
				rl.close();
			});
		}
	},

	"TEST": {
		params: "",
		description: "Test command.",
		category: "Debug",
		active: true,
		complete: true,
		visible: false,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			say("send", message, "Test complete!");
		}
	}

}

exports.shevbotCommands = commands;

/*
"COMMAND": {
		params: "",
		description: "",
		category: "Basic",
		active: false,
		complete: false,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {}
	},
*/