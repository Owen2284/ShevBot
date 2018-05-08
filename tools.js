// tools.js: Stores handy functions.

var fs = require("fs");

// General method for bot speech.
function say(inType, inMessage, inText) {
	if (inType === "send" || inType == "say") {inMessage.channel.send(inText);} 
	else if (inType === "tts") {inMessage.channel.send(inText, {tts: true})}
	else if (inType === "reply") {inMessage.reply(inText);}
	else if (inType === "pm") {pm(inMessage.author, inText);}
	else {cmd("whoops", "Invalid response type for bot message.");}
}

function pm(user, text) {
	user.send(text);
}

// General command for console logging.
function cmd(cType, cText, toConsole = true, toFile = true) {
	// Constant determining how long type should be.
	const BUFFER_LENGTH = 7;
	// Creating initial string.
	var cString = "[" + getTime() + "] [";

	// Buffing length if type is too short.
	if (cType.length < BUFFER_LENGTH) {
		cString += cType;
		for (var i = 0; i < BUFFER_LENGTH - cType.length; ++i) {cString += " ";}
	} 
	// Shortening type if too long.
	else if (cType.length > BUFFER_LENGTH) {
		cString += cType.substring(0, 7);
	} 
	// Or just add it.
	else {
		cString += cType;
	}

	// Close off string and log the message.
	cString += "] " + cText;
	if (toConsole) {console.log(cString);}
	if (toFile) {logToFile(cString)}

}

// Writes a given error to an error text file.
function err(error, errorDir = "err/") {
	var date = new Date();
	var errorFileName = errorDir + getDateTime().replace(/:/g, ";") + ".txt";
	var errorFileString = error.stack;
	writeFile(errorFileName, errorFileString, false);
	cmd("error", "Stack trace saved to \"" + errorFileName + "\".")
}

// Saves a given line to the days log file.
function logToFile(message, logDir = "log/") {
	var fileName = "";
	try {
		var dateTime = require('node-datetime');
		var dt = dateTime.create();
		fileName = logDir + dt.format('Y-m-d') + ".txt";
	}
	catch (e) {
		err(e);
		fileName = getDate().replace("/", "-") + ".txt";
	}
	if (fs.existsSync(fileName)) {
		fs.appendFileSync(fileName, message + "\n");
	} else {
		writeFile(fileName, message + "\n", false);
	}
}

// Gets the time for the TIME command.
function getTime() {
	var date = new Date();
	var hours = date.getHours().toString(); if(hours.length<2) {hours = "0" + hours;}
	var mins = date.getMinutes().toString(); if(mins.length<2) {mins = "0" + mins;}
	var secs = date.getSeconds().toString(); if(secs.length<2) {secs = "0" + secs;}
	return hours + ":" + mins + ":" + secs;
}

// Gets the date for the date command.
function getDate() {
	var date = new Date();
	var day = date.getDate().toString(); if(day.length<2) {day = "0" + day;}
	var month = date.getMonth().toString(); if(month.length<2) {month = "0" + month;}
	var year = date.getYear().toString();
	return day + "/" + month + "/" + year;
}

// Gets detailed date time.
function getDateTime() {
	try {
		var dateTime = require('node-datetime');
		var dt = dateTime.create();
		var formatted = dt.format('Y-m-d_H:M:S');
		return formatted;
	} catch (e) {
		err(e);
		return getDate().replace("/", "-") + "_" + getTime();
	}
}

// Loads in a file at the specified path.
function readFile(path, output = false) {
	var temp = fs.readFileSync(path, "utf8");
	if (typeof temp === "string") {cmd("files", path + " read successfully.", output);}
	return temp;
}

// Writes a string to a file specified by path.
function writeFile(path, fileString, output = false) {
	if (typeof fileString === "string") {
		fs.writeFileSync(path, fileString);
		cmd("files", path + " written successfully.", output);
	} else {
		cmd("whoops", "Invalid string for writeFile.");
	}
}

// Used during terminate().
function waitFor(millis) {
	var date = new Date();
	var startTime = date.getTime();
	var currentTime = date.getTime();
	while (currentTime < startTime + millis) {
		date = new Date();
		currentTime = date.getTime();
	}
}

// Counts the data in the responses or keyword JSONs when using the COUNT command.
function countKeysponses(jsonFile, fieldToCount) {
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

// Used by the FOUND command to print the found keyword/responses.
function arrayToString(tharr, delimeter) {
	var returnString = "";
	if (typeof tharr === "string") {return tharr;}
	else {for (ari = 0; ari < tharr.length; ari++) {returnString += tharr[ari] + delimeter;}}
	return returnString.substring(0, returnString.length - delimeter.length);
}

// Used by chat evaluation to get a possible response to a keyword.
function getResponse(inResponses) {
	if(typeof inResponses === "string") {return inResponses;}
	else {return inResponses[Math.floor((Math.random() * inResponses.length))];}
}

// Used by chat evaluation to determine keywork matches.
function determineMatch(inCat, inKeyword, inCheck) {
	if (inCat === "fullMatches") {
		if(inCheck === inKeyword) {return true;} 
		else {return false;}
	} else if (inCat === "partMatches") {
		if(inCheck.includes(inKeyword))  {return true;} 
		else {return false;}
	} else {
		cmd("whoops", "Invalid category for determineMatch.");
		return false;
	}
}

// Used to count swears in a message.
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

// http://stackoverflow.com/questions/208016/how-to-list-the-properties-of-a-javascript-object
function getAllProperties(object) {
	return Object.keys(object);
}

// http://stackoverflow.com/questions/2257993/how-to-display-all-methods-of-an-object-in-javasc
function getAllMethods(object) {
	return Object.getOwnPropertyNames(object).filter(function(property) {
		return typeof object[property] == 'function';
	});
}

function objectInfo(object) {
	if (object != undefined) {
		cmd("debug", "Info on " + object + ":");
		cmd("debug", "Class: " + object.constructor.name)
		cmd("debug", "Properties: " + getAllProperties(object));
		cmd("debug", "Methods: " + getAllMethods(object));
	} else {
		cmd("debug", "Object is undefined,");
	}
}

// Utilise existing methods to directly read in a JSON file in the correct format.
function readJSON(filepath, output = false) {
	try {
		var jsonData = JSON.parse(readFile(filepath));
		cmd("json", filepath + " read and parsed successfully.", output);
		return jsonData;
		hgiuguy
	} catch (e) {
		cmd("json", "Error reading/parsing \"" + filepath + "\".");		
		err(e);
		return null;
	}
}

// Utilise existing methods to directly write to a JSON file in the correct format.
function writeJSON(filepath, data, output = false) {
	try{
		writeFile(filepath, JSON.stringify(data, null, "\t"));
		cmd("json", filepath + " written successfully.", output);
	} catch (e) {
		cmd("json", "Error writing \"" + filepath + "\".");		
		err(e);
	}
}

function requireSafely(module, output = false) {
	try {
		var temp = require(module);
		cmd("module", "Module \"" + module + "\" successfully loaded.", output);
		return temp;
	} catch(e) {
		cmd("module", "Module \"" + module + "\" not found.");
		err(e);
		return null;
	}
}

function isLink(text) {
	var potentialLink = text.trim();
	return (potentialLink.length >= 5 && occurrences(potentialLink, " ", false) <= 0 && occurrences(potentialLink, ".", false) >= 1);
}

// Used by THEME command to update bot appearance.
function changeThemeAllChannels(bot, data) {

	// Fetching data and preparing structures.
	var channelArr = bot.channels.array();
	var changedGuilds = [];

	// Updating nicknames of guilds.
	for (var i in channelArr) {
		if (channelArr[i].type == "text" || channelArr[i].type == "voice") {
			var currentGuild = channelArr[i].guild;
			// Only changes things if guild hasn't been processed yet.
			if (changedGuilds.indexOf(currentGuild.id) <= -1) {
				currentGuild.member(bot.user).setNickname(data.commands["THEME"]["currentTheme"]["name"]);
				changedGuilds.push(currentGuild.id);
			}
		}
	}

	// Updating avatar.
	bot.user.setAvatar("./" + data.commands["THEME"]["currentTheme"]["image"]);

	// Notifying console.
	cmd("themes", "Theme changed to " + data.commands["THEME"]["currentTheme"]["name"] + ".");

}

// Command for splitting input into command array, with respect for speech marks.
function splitTextIntoCommand(inText) {

	// Defining the return variable.
	var returnedCommand = [];

	// Checking if any splitting needs to be done at all.
	if (occurrences(inText, " ", false) <= 0) {
		returnedCommand.push(inText);
		return returnedCommand;
	}

	// Declaring loop variables.
	var pointer = 0;
	var numSpeechMarks = occurrences(inText, "\"", false);
	var commandSegment = "";
	var withinSpeechMarks = false;
	var allowRunning = true;

	// Main loop.
	while (allowRunning) {

		// Get current character.
		var currentChar = inText.substring(pointer, pointer+1);

		// Continue adding characters to the 
		if (withinSpeechMarks || currentChar !== " ") {
			if (currentChar != "\"") {
				commandSegment += currentChar;
			} else {
				withinSpeechMarks == !withinSpeechMarks;
			}
		} 

		// Space detected; store command segment in command array.
		else {
			// Add part of command to the array, only if segment is valid.
			if (commandSegment.length > 0) {
				returnedCommand.push(commandSegment);
			}
			// Reset command segment.
			commandSegment = "";
		}

		// Move to next character.
		++pointer

		// Check if pointer is beyond the end of the string.
		if (pointer >= inText.length) {
			// Add part of command to the array, only if segment is valid.
			if (commandSegment.length > 0) {
				returnedCommand.push(commandSegment);
			}
			// Reset command segment.
			commandSegment = "";
			// Terminate loop.
			allowRunning = false;
		}

	}

	return returnedCommand;

}

// Command for splitting input into command array, with respect for speech marks.
// http://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes
function splitTextIntoCommandStolenFromStackOverflow(raw) {
	// Split command initially, with respect to quotes.
	var initialCommand = raw.match(/\w+|"(?:\\"|[^"])+"/g);
	var finalCommand = [];
	for (var i in initialCommand) {
		var currentSegment = initialCommand[i].replace(/\"/g, "").trim();
		if (currentSegment.length > 0) {
			finalCommand.push(currentSegment);
		}
	}
	return finalCommand;
}	

// Retrieves all user objects that have the username or nickname provided from the specified guild.
function getUserFromGuildViaNameOrNickname(guild, name) {
	var allUsers = getAllGuildMembers(guild);
	var returnUsers = [];
	for (var i in allUsers) {
		if ((allUsers[i].user.username.toUpperCase() == name.toUpperCase()) || (allUsers[i].nickname != null && allUsers[i].nickname.toUpperCase() === name.toUpperCase())) {
			returnUsers.push(allUsers[i]);
		}
	}
	return returnUsers;
}

// Gets memebers from the guild of the provided message or channel as an array.
function getGuildMembers(obj) {
	if (obj.constructor.name == "Guild") {
		return obj.members.array();
	} else if (obj.constructor.name == "TextChannel" || obj.constructor.name == "Message") {
		return obj.guild.members.array();
	} else if (obj.constructor.name == "DMChannel") {
		return [obj.recipient];
	} else if (obj.constructor.name == "GroupDMChannel") {
		return obj.recipients.array();
	} else {
		cmd("oops", "Tools.discord.getGuildMembers() doesn't support " + obj.constructor.name + " as an argument.");
		return [];
	}
}

// Formats and sends the reddit data from a manual API call.
function sendRedditData(subreddit, category, range, limit, message) {
	var request = require("request");
	var url = "https://www.reddit.com/r/" + subreddit + "/" + category + "/.json?t=" + range + "&limit=" + limit;
	request.get({url: url, json: true, headers: {'User-Agent': 'request'}}, (err, res, data) => {
		if (err) {
			console.log("Error:", err);
		} else if (res.statusCode !== 200) {
			cmd("request", "Status:", res.statusCode);
			say("send", message, "Sorry, but r/" + subreddit + " could not be found.");
		} else {
			var response = formatRedditData(subreddit, category, range, limit, data);
			say("send", message, response);
		}
	});
}

// Performs the nitty-gritty of getting and formatting the reddit posts.
function formatRedditData(subreddit, category, range, limit, data) {
	var posts = data["data"]["children"];
	var response = "The " + limit + " " + category + " posts from " + posts[0]["data"]["subreddit_name_prefixed"] + ":\n```Markdown\n";
	var references = "";
	var stickies = 0;
	for (var i in posts) {
		var post = posts[i]["data"];
		if (!post["stickied"]) {
			var postNum = (i - stickies) + 1;
			if (postNum > limit) {break;}
			response += postNum + " - " + post["title"] + " (";
			if (post["score"] >= 0) {response += "+";}
			response += post["score"] + ", " + post["num_comments"] + " comments) \n";
			references += "[" + postNum + "]:" + post["permalink"] + "\n";
		} else {
			stickies += 1;
		}
	}
	response += "\n" + references + "```";
	if (stickies > 0) {response += stickies + " stickied posts were ignored.";}
	return response;
}

// Random list element accessor.
function randomListElem(list) {
	return list[Math.floor(Math.random() * list.length)];
}

// Function that handles the process of changing the game ShevBot is playing.
function setNewStatus(bot, data) {
	var gameList = data.bot["games"];
	var newGame = randomListElem(gameList);
	bot.user.setGame(newGame);
	cmd("game", "Game changed to \"" + newGame + "\".");
}

// Easy accessor for an channel's type. (BEfore I found out there was a really easy way to do it.)
function getChannelType(channel) {
	return channel.constructor.name.replace("Channel", "");
}

// Gets a user and their nickname on the current server.
function getAllNamesOf(guilduser) {
	if (guilduser.constructor.name == "GuildMember") {
		var names = [guilduser.user.username];
		if (guilduser.nickname != null) {
			names.push(guilduser.nickname);
		}
		return names;
	} else if (guilduser.constructor.name == "User") {
		return [guilduser.user.username];
	} else {
		cmd("oops", "Tools.discord.getAllNamesOf() doesn't support " + guilduser.constructor.name + " as an argument.");
		return [];
	}
}

// Attempts to get a user's nickname or username.
function getNicknameDefaultToUsername(guilduser) {
	if (guilduser.constructor.name == "GuildMember" || guilduser.constructor.name == "User") {
		var namesList = getAllNamesOf(guilduser);
		return namesList[namesList.length];
	} else {
		cmd("oops", "Tools.discord.getNickname() doesn't support " + guilduser.constructor.name + " as an argument.");
		return "";
	}
}

// Large function that loads in any acceptable command .js files in the command directory. Returns a flat list of these command objects.
function acquireCommands(commandDir) {

	const CONSOLE_TAG = "cominit";

	// Reading in order.js and ordering the categories appropriately.
	var allCategories = [];
	try {
		// Fetch all files in the main command directory.
		var unorderedCategories = fs.readdirSync(commandDir);
		var notDirs = [];
		for (var p in unorderedCategories) {
			var dirToCheck = commandDir + unorderedCategories[p];
			var isDir = fs.lstatSync(dirToCheck).isDirectory();
			if (!isDir) {
				notDirs.push(unorderedCategories[p]);
			}
		}
		for (var p in notDirs) {
			var fileToSplice = notDirs[p];
			var spliceIndex = unorderedCategories.indexOf(fileToSplice);
			unorderedCategories.splice(spliceIndex, 1);
		}
		var firstCategories = [];
		var lastCategories = [];
		var manualCategories = [];

		// Read in order file and operation.
		var orderFile = readJSON("com/order.json");
		var operation = orderFile["operation"];
		// First segment processing
		if (orderFile["first"].length > 0) {
			for (var i in orderFile["first"]) {
				var catName = orderFile["first"][i];
				var indexo = unorderedCategories.indexOf(catName, 0);
				if (indexo >= 0) {
					unorderedCategories.splice(indexo, 1);
					firstCategories.push(catName);
				}
			}
		}

		// Last segment processing
		if (orderFile["last"].length > 0) {
			for (var i in orderFile["last"]) {
				var catName = orderFile["last"][i];
				var indexo = unorderedCategories.indexOf(catName, 0);
				if (indexo >= 0) {
					unorderedCategories.splice(indexo, 1);
					lastCategories.push(catName);
				}
			}
		}

		// Manual segment processing
		if (orderFile["manual"].length > 0) {
			for (var i in orderFile["manual"]) {
				var catName = orderFile["manual"][i];
				var indexo = unorderedCategories.indexOf(catName, 0);
				if (indexo >= 0) {
					unorderedCategories.splice(indexo, 1);
					manualCategories.push(catName);
				}
			}
		}

		// Assembling final list. Operation: "a" means plance things not in manual after manual, "b" means before manual, "i" means ignore any not in lists.
		if (operation == "i") {
			allCategories = firstCategories.concat(manualCategories).concat(lastCategories);
		}
		else if (operation == "b") {
			allCategories = firstCategories.concat(unorderedCategories).concat(manualCategories).concat(lastCategories);
		}
		else if (operation == "a" || true) {		// Default behaviour
			allCategories = firstCategories.concat(manualCategories).concat(unorderedCategories).concat(lastCategories);
		}

		cmd(CONSOLE_TAG, "order.json loaded in; categories organised as specified.");

	} catch (e) {
		cmd(CONSOLE_TAG, "Malformed order.json file, unable to correctly order the command categories.");
		err(e);
		allCategories = fs.readdirSync(commandDir);
	}

	// Getting modules.
	const syntaxChecker = require("syntax-error");
	
	// Initialising storage variables.
	var allCommands = [];
	var counters = [[], [], [], [], []];		// Success, filetype, compilation, fields, unknown.

	// Loop through all category directories.
	for (var i in allCategories) {
		var currentCat = allCategories[i];
		var categoryDir = commandDir + currentCat + "/";
		var allCommandFiles = fs.readdirSync(categoryDir);
		var categoryCommands = [];
		var requiredFields = readJSON("com/fields.json");
		for (var j in allCommandFiles) {
			var commandFile = allCommandFiles[j];
			var commandPath = categoryDir + commandFile;
			try {
				// Check that the file is a .js file.
				var fileTypeCheck = commandPath.endsWith(".js");
				if (fileTypeCheck) {
					// Check that the file correctly compiles.
					var compilationCheck = syntaxChecker(fs.readFileSync(commandPath), commandPath) == undefined;
					if (compilationCheck) {
						var fieldCheck = true;
						var failedFields = [];
						// Load in the command.
						var commandToTest = require("./" + commandPath);
						// Check that the command provided exists (exports != null)
						if (commandToTest != null && commandToTest != undefined) { 
							// Check that each field exists and check it's the correct type.
							for (var q in requiredFields) {
								var fieldToCheck = requiredFields[q];
								var commandFieldData = commandToTest[fieldToCheck["name"]];
								if (commandFieldData != null && commandFieldData != undefined) {
									// Use alternate check method for arrays.
									if (fieldToCheck["type"] == "array") {
										if (!Array.isArray(commandFieldData)) {
											fieldCheck = false;
											failedFields.push(fieldToCheck["name"]);
										}
									}
									// Otherwise use typeof to check
									else {
										var commandFieldType = typeof(commandFieldData);
										var isTypeMatch = (commandFieldType == fieldToCheck["type"]);
										if (!isTypeMatch) {
											fieldCheck = false;
											failedFields.push(fieldToCheck["name"]);
										}										
									}
								}
								else {fieldCheck = false; failedFields.push(fieldToCheck["name"]);}
							}
						}
						else {fieldCheck = false; failedFields.push("Whole command is null/undefined.");}
						if (fieldCheck) {
							// Accept the command.
							commandToTest.category = currentCat;
							categoryCommands.push(commandToTest);
							counters[0].push(commandFile);
							cmd(CONSOLE_TAG, " " + commandFile + " successfully loaded in.");
						}
						else {
							counters[3].push(commandFile);
							var fieldCheckFailedString = " " + commandFile + " failed to load in; field check failed.";
							if (commandToTest != null && commandToTest != undefined) {
								fieldCheckFailedString += " (" + failedFields[0] + ")";
							}
							else {
								fieldCheckFailedString += " (Failed fields: " + arrayToString(failedFields, ", ") + ")";
							}
							cmd(CONSOLE_TAG, fieldCheckFailedString);
						}
					}
					else {
						counters[2].push(commandFile);
						cmd(CONSOLE_TAG, " " + commandFile + " failed to load in; compilation check failed.");
					}
				}
				else {
					counters[1].push(commandFile);
					cmd(CONSOLE_TAG, " " + commandFile + " was ignored; incorrect file type.");
				}
			} catch (e) {
				counters[4].push(commandFile);
				cmd(CONSOLE_TAG, " " + commandFile + " failed to load in; unknown error occured.");
				err(e);
			}
		}
		categoryCommands.sort(function(a,b) {if (a.order < b.order) {return -1} else if (a.order > b.order) {return 1} else {return 0}})
		allCommands = allCommands.concat(categoryCommands);
	}

	cmd(CONSOLE_TAG, counters[0].length + " commands successfully loaded in.");
	cmd(CONSOLE_TAG, counters[2].length + " commands failed the compilation check. (Check the code for errors)");
	cmd(CONSOLE_TAG, counters[3].length + " commands failed the field check. (Ensure the command is the only export object and has all necessary fields)");
	cmd(CONSOLE_TAG, counters[4].length + " commands failed to load for due to an unknown exception.");
	cmd(CONSOLE_TAG, counters[1].length + " files ignored due to file type. (.js files only)");

	return allCommands; 
}

// Function that generates the help string for the HELP function. Doesn't account for message length limits.
function getFullHelpString(commandList, author, commandCharacter) {

	// Storage variables.
	var helpString = "Hi " + author + ", here are all of my commands! Type **" + commandCharacter + "HELP** along with the names of any commands you want to know more about (e.g. **" + commandCharacter + "HELP** GAME THEME)"
	var categoriesToDo = [];
	var commandsToDo = [];
	var commandsSoon = [];

	// Store all of the categories and commands.
	helpString += "\n\n";
	for (var com in commandList) {
		var commandObject = commandList[com];
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
		helpString += "__**" + headerString + "**__\n\n";

		// Add commands of the category.
		//var commandsToRemove = [];
		for (var com in commandsToDo) {
			var commandObject = commandList[commandsToDo[com]];
			var extra1 = ""; if (!commandObject.complete) {extra1 = "(IN DEV)";}
			if (commandObject.category == categoriesToDo[cat]) {
				helpString += "**" + commandCharacter + commandObject.aliases[0] + "** " 
					+ commandObject.params + "\t" + extra1 + "\n"; 
				//commandsToRemove = commandsToDo[com];
			}
		}
		helpString += "\n";
		
	}

	// Add the coming soon section.
	if (commandsSoon.length > 0) {
		helpString += "__**Coming Soon!**__\n";
		for (var i = 0; j = commandsSoon.length, i<j; i++) {
			if (i<j-1) {
				helpString += commandList[commandsSoon[i]].aliases[0] + ", ";
			} else {
				helpString += commandList[commandsSoon[i]].aliases[0];
			}
		}
		helpString += "\n";
	}

	return helpString;
}

// Gets help information for a specific command.
function getSpecificHelpString(commandList, commandName, commandCharacter, showDetailedHelp) {
	// Search through the currently stored commands to determine if a valid command was entered.
	var commandObject = null;
	var aliasIndex = -1;
    for (var i in commandList) {
		var thisCommandHere = commandList[i];
		var thisAliasIndexHere = thisCommandHere.aliases.indexOf(commandName.toUpperCase());
        if (thisAliasIndexHere >= 0 && thisCommandHere.active) {
			commandObject = thisCommandHere;
			aliasIndex = thisAliasIndexHere;
            break;
        }
	}
	
	if (commandObject != null) {
		// Storage variables.
		var helpString = "Here's some info on the **" + commandCharacter + commandObject.aliases[aliasIndex] + "** command:\n";

		helpString += "**Name**: " + commandCharacter + commandObject.aliases[0] + "\n";
		helpString += "**Aliases**: " + commandObject.aliases.splice(1).join(", ") + "\n";
		helpString += "**Parameters**: " + commandObject.params + "\n\n";

		helpString += "**Description**: " + commandObject.description + "\n";
		helpString += "**Category**: " + commandObject.category + "\n";		
		helpString += "**Examples**: \"" + commandObject.examples.join("\", \"") + "\"\n\n";

		helpString += "**Minimum required arguments**: " + commandObject.minArgs + "\n";		
		helpString += "**Usable in guild channels**: " + commandObject.guild + "\n";
		helpString += "**Usable in DM channels**: " + commandObject.pm + "\n";
		helpString += "**Command call deleted after completion**: " + commandObject.deleteCall + "\n\n";

		if (showDetailedHelp) {
			helpString += "**Permissions required by bot**: " + commandObject.botPermissions.join(", ") + "\n";
			helpString += "**Permissions required by user**: " + commandObject.userPermissions.join(", ") + "\n";
			helpString += "**Node.js packages required**: " + commandObject.packages.join(", ") + "\n\n";
		}

		return helpString;
	}
	else {
		return "Sorry, but I couldn't find the **" + commandCharacter + commandName.toUpperCase() + "** command."
	}
}


module.exports = {
	comms: {
		say: say,
		pm: pm,
		cmd: cmd
	},
	datetime: {
		getDate: getDate,
		getTime: getTime,
		getDateTime: getDateTime
	},
	fs: {
		readFile: readFile,
		writeFile: writeFile,
		readJSON: readJSON,
		writeJSON: writeJSON
	},
	require: {
		requireSafely: requireSafely,
	},
	text: {
		countOccurrences: occurrences,
		isLink: isLink
	},
	arrays: {
		arrayToString: arrayToString,
		getRandomElement: randomListElem
	},
	discord: {
		getChannelType: getChannelType,
		getChannelMembers: getGuildMembers,
		getChannelMembersByName: getUserFromGuildViaNameOrNickname,
		getAllNamesOf: getAllNamesOf,
		getNickname: getNicknameDefaultToUsername,
		setNewBotGame: setNewStatus
	},
	commands: {
		acquireCommands: acquireCommands,
		getFullHelpString: getFullHelpString,
		getSpecificHelpString: getSpecificHelpString,
		commandSplit: splitTextIntoCommandStolenFromStackOverflow,
		changeTheme: changeThemeAllChannels,
		sayRedditData: sendRedditData
	},
	keysponses: {
		getResponse: getResponse,
		determineMatch: determineMatch,
		countKeysponses: countKeysponses
	},
	debug: {
		err: err,
		logToFile: logToFile,
		objectInfo: objectInfo
	}
}