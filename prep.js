// prep.js: Contains methods for compilation checks, file loading, etc.

var fs = require("fs");

//#region FS and Compile checks
function directoryCheck() {
    // TODO: File and directory check.
    return null;
}

function compileCheck(data) {
    var results = {
        tools: null,
        operations: null,
        events: null,
        discord: null,
        success: true
    }

    // Compile check.
    try {
        cmd("boot", "Begining custom code file validation.");
        const syntaxChecker = require("syntax-error");
        var customCodeToCompile = data.bot["customCodeToCompile"];
        for (var i in customCodeToCompile) {
            var compileTestFilePath = customCodeToCompile[i];
            var compilationResult = syntaxChecker(fs.readFileSync(compileTestFilePath), compileTestFilePath);
            if (compilationResult != undefined) {
                cmd("FATAL", "\"" + compileTestFilePath + "\" has FAILED compilation testing. Please check the code for errors then relaunch ShevBot.");
                cmd("", compilationResult, false, true);
                results.success = false;
            }
        }
    }
    catch (e) {
        cmd("FATAL", "\"" + compileTestFilePath + "\" has FAILED compilation testing. Please check the code for errors then relaunch ShevBot.");
        err(e);
        process.exit(1);
    }
    
    if (results.success) {
        results.tools = requireSafely("./tools.js", true);
        results.operations = requireSafely("./operations.js", true);
        results.events = requireSafely("./events.js", true);
        results.discord = requireSafely("discord.js", true);

        if (results.tools == null || results.operations == null || results.events == null || results.discord == null) {
            results.success = false;
        }
    }

    return results;
}
//#endregion

//#region Details and Data
function getDetails() {
    return {
        versionNumber: "2.4.0",
        repo: "https://github.com/Owen2284/ShevBot",
        commandCharacter: "+",
        commandDir: "com/",
        dataDir: "dat/",
        soundDir: "sou/",
        musicDir: "mus/",
        avatarDir: "ava/",
        loggingDir: "log/",
        errorDir: "err/"
    }
}

function getConfig() {
    return JSON.parse(fs.readFileSync("config.json", "utf8"));
}

function getData() {
    const details = getDetails();
    return {
        bot: JSON.parse(fs.readFileSync(details.dataDir + "bot.json", "utf8")),
        chat: JSON.parse(fs.readFileSync(details.dataDir + "chat.json", "utf8")), 
        commands: JSON.parse(fs.readFileSync(details.dataDir + "commands.json", "utf8"))
    };
}

function getDefaultSettings() {
    return {
        debug: false,
        allowLooping: false,
        initialBoot: true,
        currentStreamDispatcher: null	
    };
}
//#endregion

//#region Prep versions of Tools.js functions

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
	//cmd("error", "Stack trace saved to \"" + errorFileName + "\".")
}

function requireSafely(module, output = false) {
	try {
		var temp = require(module);
		cmd("module", "Module \"" + module + "\" successfully loaded.", output);
		return temp;
	} catch(e) {
		err(e);
		return null;
	}
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
//#endregion

//#region Exports

exports.getConfig = getConfig;
exports.getData = getData;
exports.getDetails = getDetails;
exports.getDefaultSettings = getDefaultSettings;

exports.compileCheck = compileCheck;
exports.directoryCheck = directoryCheck;

exports.cmd = cmd;
exports.err = err;
exports.requireSafely = requireSafely;

//#endregion