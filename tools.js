var fs = require("fs");

// General method for bot speech.
function say(inType, inMessage, inText) {
	if (inType === "send") {inMessage.channel.sendMessage(inText);} 
	else if (inType === "reply") {inMessage.reply(inText);} 
	else {cmd("whoops", "Invalid response type for bot message.");}
}

function pm(user, text) {
	user.sendMessage(text);
}

// General command for console logging.
function cmd(cType, cText) {
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
	console.log(cString);

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

// Loads in a file at the specified path.
function readFile(path) {
	var temp = fs.readFileSync(path, "utf8");
	//if(typeof temp === "string") {cmd("files", path + " read successfully.");}
	return temp;
}

// Writes a string to a file specified by path.
function writeFile(path, fileString) {
	if (typeof fileString === "string") {
		fs.writeFileSync(path, fileString);
		//cmd("files", path + " written successfully.");
	} else {
		cmd("whoops", "Invalid string for writeFile.");
	}
}

// Terminate function for the END command.
function terminate(bot) {
	waitFor(3000);
	bot.destroy(function(err) {
		if (err != null) {
			cmd(err); 
		}
	});
	process.exit(0);
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

function readJSON(filepath) {
	try {
		var jsonData = JSON.parse(readFile(filepath));
		cmd("files", filepath + " read and parsed successfully.");
		return jsonData;
	} catch (e) {
		cmd("files", "Error reading/parsing \"" + filepath + "\", the following error occured:");		
		console.log(e);
		return null;
	}
}

function writeJSON(filepath, data) {
	try{
		writeFile(filepath, JSON.stringify(data, null, "\t"));
		cmd("files", filepath + " written successfully.");
	} catch (e) {
		cmd("files", "Error writing \"" + filepath + "\", the following error occured:");		
		console.log(e);
	}
}

function requireSafely(module) {
	try {
		var temp = require(module);
		cmd("module", "Module \"" + module + "\" successfully loaded.");
		return temp;
	} catch(e) {
		console.log(e);
		cmd("module", "Module \"" + module + "\" not found.");
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

// Command for archiving a message into the archive file.
function archiveAdd(username, str, timestamp, type, details) {
	if (type == "messages" || type == "links") {
		var archive = readJSON(details.dataDir + "archives.json");
		var item = {
			"user": username,
			"message": str,
			"timestamp": timestamp
		}
		archive[type].push(item);
		writeJSON(details.dataDir + "archives.json", archive);
	} else {
		cmd("whoops", "Invalid archive type for archiveAdd() - \"" + type + "\".");
	}
}

// Command for retrieving a whole list of archive data from a specified category.
function archiveGetByCategory(type) {
	if (type == "messages" || type == "links") {
		var archive = readJSON(details.dataDir + "archives.json");
		return archive[type];
	} else {
		cmd("whoops", "Invalid archive type for archiveGet() - \"" + type + "\".");
	}
} 

// Command for retrieving a partial list of archive data based on id the data in the specified field matches the parameter data.
function archiveGetByField(type, field, data) {
	if (type == "messages" || type == "links") {
		var archive = archiveGetByCategory(type);
		var returnArray = [];
		for (var i in archive) {
			var archiveObject = archive[i];
			if (archiveObject[field] == data) {
				returnArray.push(archiveObject);
			}
		}
		return returnArray;	
	} else {
		cmd("whoops", "Invalid archive type for archiveGet() - \"" + type + "\".");
	}
}

// Retrieves a user object that has the name or nickname provided from the specified guild.
function getUserFromGuildViaNameOrNickname(guild, name) {
	var allUsers = guild.members.array();
	for (var i in allUsers) {
		
	}
}

exports.say = say;
exports.pm = pm;
exports.cmd = cmd;
exports.getDate = getDate;
exports.getTime = getTime;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.readJSON = readJSON;
exports.writeJSON = writeJSON;
exports.countOccurrences = occurrences;
exports.terminate = terminate;
exports.waitFor = waitFor;
exports.countKeysponses = countKeysponses;
exports.arrayToString = arrayToString;
exports.getResponse = getResponse;
exports.determineMatch = determineMatch;
exports.objectInfo = objectInfo;
exports.requireSafely = requireSafely;
exports.isLink = isLink;
exports.changeTheme = changeThemeAllChannels;
exports.commandSplit = splitTextIntoCommandStolenFromStackOverflow;
exports.commandSplitOld = splitTextIntoCommand;
exports.archiveAdd = archiveAdd;
exports.archiveGetByCategory = archiveGetByCategory;
exports.archiveGetByField = archiveGetByField;
exports.getUserFromGuild = getUserFromGuildViaNameOrNickname;