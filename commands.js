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
			var helpString = "Hi " + sender.username + ", here are all of my commands!"
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
			if (helpString < 2000) {
				say("pm", message, helpString);
			} else {
				say("pm", message, helpString.substring(0,2000));
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
			var keys = Tools.countKeysponses(data.chat["keysponses"], "keywords") * -1;
			var resp = Tools.countKeysponses(data.chat["keysponses"], "responses") * -1;
			var coms = 0; for (var i in commands) {
				var commandObject = commands[i];
				if (commandObject.active) {coms -= 1;}
			}

			// Read in new keywords and responses.
			data.chat["keysponses"] = Tools.readJSON(details.dataDir + "chat.json")["keysponses"];

			// Replace commands in the parameter object with the new commands.
			var newCommands = Tools.requireSafely("./commands.js").shevbotCommands;
			for (var key in newCommands) {
				var newCommObj = newCommands[key];
				commands[key] = newCommObj;
			}

			// Count new things.
			keys += Tools.countKeysponses(data.chat["keysponses"], "keywords");
			resp += Tools.countKeysponses(data.chat["keysponses"], "responses");
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
			say("send", message, "Keywords found: " + data.commands["FOUND"]["keywords"].length + "/" + Tools.countKeysponses(data.chat["keysponses"], "keywords") + ".\nResponses found: " + data.commands["FOUND"]["responses"].length + "/" + Tools.countKeysponses(data.chat["keysponses"], "responses") + ".");
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
				say("send", message, "All keywords found: \n" + Tools.arrayToString(data.commands["FOUND"]["keywords"], "\n"));
			} else if(input.length > 1 && input[1].toUpperCase() === "RESPONSES") {
				say("send", message, "All responses found: \n" + Tools.arrayToString(data.commands["FOUND"]["responses"], "\n"));
			} else {
				say("send", message, "Please enter either \"keywords\" or \"responses\" after \"" + details.commandCharacter + "found\".");
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
		complete: true,
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
							if (settings.currentStreamDispatcher != null) {settings.currentStreamDispatcher.end(); settings.currentStreamDispatcher == null;}
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
							if (settings.currentStreamDispatcher != null) {settings.currentStreamDispatcher.end(); settings.currentStreamDispatcher == null;}
							settings.currentStreamDispatcher = currentConnection.playFile(soundToPlayDir, {volume:"0.25"});
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
								Tools.writeJSON(details.dataDir + "commands.json", data.commands);
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
							Tools.writeJSON(details.dataDir + "commands.json", data.commands);
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
							var remainderBody = message.content.substring(input[0].length + input[1].length + 3);
							allRems.push({"creator":sender.id,"text":remainderBody});
							Tools.writeJSON(details.dataDir + "commands.json", data.commands);
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
							Tools.writeJSON(details.dataDir + "commands.json", data.commands);
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
		visible: false,
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
				for (var i in data.commands["THEME"]["availableThemes"]) {
					var themeObj = data.commands["THEME"]["availableThemes"][i];
					if (themeObj["name"].toUpperCase() === themeName.toUpperCase()) {
						if (data.commands["THEME"]["currentTheme"]["name"].toUpperCase() !== themeName.toUpperCase()) {
							data.commands["THEME"]["currentTheme"] = themeObj;
							Tools.changeTheme(bot, data);
							Tools.writeJSON(details.dataDir + "commands.json", data.commands);
						}
						say("send", message, data.commands["THEME"]["currentTheme"]["change"]);
						found = true;
					}
				}
				if (!found) {say("send", message, "Sorry, but ShevBot has no \"" + themeName + "\" theme.");}
			} 
			// Displays a list of all themes.
			else {
				var themesString = "Available ShevBot themes: ";
				for (var i in data.commands["THEME"]["availableThemes"]) {
					if (i>0) {themesString += ", ";}
					var themeObj = data.commands["THEME"]["availableThemes"][i];
					themesString += themeObj.name;
				}
				themesString += ".";
				say("send", message, themesString);
			}
		}
	},

	"GAME": {
		params: "[\"select\",\"view\",\"add\",\"remove\",\"clear\"]",
		description: "Stores a list of games that can be randomly selected for users to play.",
		category: "Gaming",
		active: true,
		complete: true,
		visible: true,
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			if (input.length > 1) {
				switch(input[1].toUpperCase()) {
					case "ADD":
						if (input.length > 2) {
							var newGame = input[2]
							data.commands["GAME"]["list"].push(newGame);
							Tools.writeJSON(details.dataDir + "commands.json", data.commands);
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
								Tools.writeJSON(details.dataDir + "commands.json", data.commands);
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
						Tools.writeJSON(details.dataDir + "commands.json", data.commands);
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
			} else {
				say("send", message, "The " + details.commandCharacter + "game command needs another argument after it, such as \"add\", \"remove\" or \"select\"."); noCommand = true;
			}
		}
	},

	"NICKNAME": {
		params: "<name>",
		description: "Randomises a person's nickname.",
		category: "Social",
		active: true,
		complete: true,
		visible: true,
		guild: true,
		pm: false,
		minArgs: 1,
		permissions: ["CHANGE_NICKNAME", "MANAGE_NICKNAMES"],
		packages: ["moniker"],
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			if (input.length > 1) {
				if (message.guild != null && message.guild.available) {
					var users = Tools.getAllGuildMembers(message.guild);
					var theUser = null;
					for (var i in users) {
						if ((users[i].user.username.toUpperCase() === input[1].toUpperCase()) || (users[i].nickname != null && users[i].nickname.toUpperCase() === input[1].toUpperCase())) {
							theUser = users[i];
						}
					}
					if (theUser != null) {
						var Moniker = require("moniker");
						var nameGen = Moniker.generator([Moniker.adjective, Moniker.adjective, Moniker.noun]);
						var newNickArray = nameGen.choose().split("-");
						var newNickName = "";
						for (var i = 0; i < newNickArray.length; ++i) {
							newNickName += newNickArray[i].substring(0,1).toUpperCase() + newNickArray[i].substring(1) + " ";
						}
						newNickName = newNickName.substring(0, newNickName.length-1);
						theUser.setNickname(newNickName);
						say("send", message, "Nickname of " + theUser.user.username + " changed to \"" + newNickName + "\"!");
					} else {
						say("send", message, "Unable to find \"" + input[1] + "\" on the current server.");
					}
				} else {
					say("send", message, "This command can only be run in the text channel of a guild/server.")
				}
			} else {
				say("send", message, "Please provide the username/nickname of the user whose nickname should be changed.")
			}
		}
	},

	"TOPIC": {
		params: "",
		description: "Sets a random topic for the current channel.",
		category: "Social",
		active: true,
		complete: true,
		visible: true,
		guild: true,
		pm: false,
		minArgs: 0,
		permissions: ["MANAGE_CHANNELS"],
		packages: ["casual", "moniker"],
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			var Casual = require("casual");
			var Moniker = require("moniker");
			var topicString = "";
			var randVal = Math.random() * 4;
			if (randVal < 1) {
				topicString = Casual.catch_phrase;
			} else if (randVal < 2) {
				topicString = Casual.full_name;
			} else if (randVal < 3) {
				var user = Tools.getAllGuildMembers(channel)[Math.floor(Math.random() * Tools.getAllGuildMembers(channel).length)];
				var gen = Moniker.generator([Moniker.adjective, Moniker.noun]);
				if (user.nickname != null) {
					topicString = user.nickname;
				} else {
					topicString = user.user.username;
				}
				topicString += "'s " + gen.choose().replace(/-/g, " ");
			} else {
				var gen = Moniker.generator([Moniker.adjective, Moniker.adjective, Moniker.noun]);
				topicString = gen.choose().replace(/-/g, " ");
				topicString = topicString.substring(0,1).toUpperCase() + topicString.substring(1);
			}
			var endings = [" discussion.", ", agree or disagree?", " observations.", " fan club.", ", and how it effects you.", " debating.", " circlejerk.", " 101."]
			var messageString = topicString + endings[Math.floor(Math.random() * endings.length)];
			channel.setTopic(messageString);
		}
	},

	"YOUTUBE": {
		params: "[\"search\", \"channel\"] <search term/channel ID>",
		description: "Runs a YouTube search for a provided search term or channel ID.",
		category: "Web",
		active: true,
		complete: false,
		visible: true,
		guild: true,
		pm: true,
		minArgs: 2,
		permissions: [],
		packages: ["youtube-node"],
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			const YouTube = require("youtube-node");
			const MAX_RESULTS = 3;
			var yt = new YouTube();
			yt.setKey("AIzaSyAyPKgiV79FI_VnMGwGLQtHjBWMy7c6Ots");
			if (input[1].toLowerCase() === "search") {
				yt.addParam("order", "relevance");
				yt.addParam("maxResults", MAX_RESULTS);
				yt.search(input[1], MAX_RESULTS, function(error, result) {
					if (error) {
						cmd("youtube", "Error occured:");
						console.log(error);
						say("send", message, "Could not find the channel \"" + input[2] + "\".");
					} else {
						var videos = result["items"];
						var response = "Top " + MAX_RESULTS + " search results for \"" + input[2] + "\":\n```Markdown\n";
						for (var i in videos) {
							var v = videos[i]["snippet"];
							response += (parseInt(i)+1) + " " + v["title"] + " (" + v["channelTitle"] + ")\n";
						}
						response += "```";
						say("send", message, response);
					}
				});
			} else if (input[1].toLowerCase() === "channel") {
				yt.addParam("channelId", input[2]);		// TODO: Get channel ID from channel name.
				yt.addParam("order", "date");
				yt.addParam("maxResults", MAX_RESULTS);
				yt.search("", MAX_RESULTS, function(error, result) {
					if (error) {
						cmd("youtube", "Error occured:");
						console.log(error);
						say("send", message, "Could not find the channel with the ID \"" + input[2] + "\".");
					} else {
						var videos = result["items"];
						var response = "Newest " + MAX_RESULTS + " videos from \"" + videos[0]["snippet"]["channelTitle"] + "\":\n```Markdown\n";
						for (var i in videos) {
							var v = videos[i]["snippet"];
							response += (parseInt(i)+1) + " " + v["title"] + "\n";
						}
						response += "```";
						say("send", message, response);
					}
				});
			} else {
				say("send", message, "Please specify whether you want a Youtube search or channel operation.")
			}
		}
	},

	"REDDIT": {
		params: "<subreddit name> [\"hot\", \"new\", \"top\"]",
		description: "Fetches the top 5 posts of the specified subreddit, based on the given category.",
		category: "Web",
		active: true,
		complete: true,
		visible: true,
		guild: true,
		pm: true,
		minArgs: 2,
		permissions: [],
		packages: ["requests"],
		process: function(bot, message, sender, channel, input, data, settings, details, commands) {
			var subreddit = input[1].toLowerCase();
			var category = input[2].toLowerCase();
			var range = "all";
			var limit = 5;
			if (["hot", "top", "new"].indexOf(category) > -1) {
				var response = Tools.sayRedditData(subreddit, category, range, limit, message);
			} else {
				say("send", message, "Sorry, \"" + category + "\" is not a valid category.");
			}
		}
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
			cmd("log", message.content.substring(5));
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
		guild: true,
		pm: true,
		minArgs: 0,
		permissions: [],
		packages: [],
		process: function(bot, manifest, input, data, settings, details, commands) {}
	},

	Manifest contains all data input from the user (message, channel, author, command input, raw input, channel type, arg count, time, date, etc.) 
*/