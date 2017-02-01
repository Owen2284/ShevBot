var fs = require("fs");

// General method for bot speech.
function say(inType, inMessage, inText) {
	if (inType === "send") {inMessage.channel.sendMessage(inText);} 
	else if (inType === "reply") {inMessage.reply(inText);} 
	else {cmd("[whoops] Invalid response type for bot message.");}
}

// General command for console logging.
function cmd(cText) {
	console.log("[" + getTime() + "] " + cText);
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
	if(typeof temp === "string") {cmd("[i/o] " + path + " read successfully.");}
	return temp;
}

// Writes a string to a file specified by path.
function writeFile(path, fileString) {
	if (typeof fileString === "string") {
		fs.writeFileSync(path, fileString);
		cmd("[i/o] " + path + " written successfully.");
	} else {
		cmd("[i/o] [whoops] Invalid string for writeFile.");
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
		consoleMessage("[whoops] Invalid category for determineMatch.");
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
		cmd("[dbg] Info on " + object + ":");
		cmd("[dbg] Class: " + object.constructor.name)
		cmd("[dbg] Properties: " + getAllProperties(object));
		cmd("[dbg] Methods: " + getAllMethods(object));
	} else {
		cmd("[dbg] Object is undefined,");
	}
}

function readJSON(filepath) {
	return JSON.parse(readFile(filepath));
}

function writeJSON(filepath, data) {
	writeFile(filepath, JSON.stringify(data, null, "\t"));
}

function requireSafely(module) {
	try {
		var temp = require(module);
		cmd("[mod] Module \"" + module + "\" successfully loaded.");
		return temp;
	} catch(e) {
		cmd("[mod] Module \"" + module + "\" not found.");
		return null;
	}
}

function isLink(text) {
	return 0.0;
}

exports.say = say;
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
exports.countMessages = countMessages;
exports.arrayToString = arrayToString;
exports.getResponse = getResponse;
exports.determineMatch = determineMatch;
exports.objectInfo = objectInfo;
exports.requireSafely = requireSafely;
exports.isLink = isLink;