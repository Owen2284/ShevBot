/* 

ShevBot
Created on 3rd August 2016

Current Version: v2.4.0

Backend for my Discord bot, ShevBot.

https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot

*/

//#region Preparation
// Begining prep stage
var Prep;
try {
	Prep = require("./prep.js");
}
catch (ex) {
	console.log("[FATAL] prep.js could not be loaded.");
	process.exit(1);
}
Prep.cmd("boot", "ShevBot launched.");

// Details
const details = Prep.getDetails();

// Directories and files.
var directoryResult = Prep.directoryCheck();
if (directoryResult != null) {
	Prep.err(directoryResult);
	Prep.cmd("FATAL", "Error occured while checking file and directory structure, check error folder for more info.");
	process.exit(1);
}

// Files
var config = Prep.getConfig();
var data = Prep.getData();

// Custom code compilation test.
var compileResults = Prep.compileCheck(data);
if (!compileResults.success) {
	if (compileResults.tools == null) {
		Prep.cmd("FATAL", "The tools.js file could not be loaded in, or is syntactically incorrect. Please re-acquire or correct the file.");
	}
	if (compileResults.operations == null) {
		Prep.cmd("FATAL", "The operations.js file could not be loaded in, or is syntactically incorrect. Please re-acquire or correct the file.");
	}
	if (compileResults.events == null) {
		Prep.cmd("FATAL", "The events.js file could not be loaded in, or is syntactically incorrect. Please re-acquire or correct the file.");
	}
	if (compileResults.discord == null) {
		Prep.cmd("FATAL", "The discord.js framework was not found. Please install it via \"npm install discord.js\".");		
	}

	Prep.cmd("FATAL", "Closing due to missing packages or failed compilation on custom .js files.");
	process.exit(1);
}

// Modules.
const Tools = compileResults.tools;
const Operations = compileResults.operations;
const Events = compileResults.events;
const Discord = compileResults.discord;
const EmojiList = Tools.require.requireSafely("emojis-list");

// Tools.
const readJSON = Tools.fs.readJSON;
const writeJSON = Tools.fs.writeJSON;
const say = Tools.comms.say;
const pm = Tools.comms.pm;
const log = Tools.comms.cmd;
const err = Tools.debug.err;

// Commands.
try {
	var commands = Tools.commands.acquireCommands(details.commandDir);
	if (commands == null || commands == undefined || commands.length == 0) {log("warn", "No valid commands were loaded in.");}
} catch (e) {
	log("warn", "No valid commands were loaded in.");
	err(e, details.errorDir);
}

// Settings
var settings = Prep.getDefaultSettings();

// Ending prep stage.
Prep = null;
//#endregion

//#region Bot Setup
// Creating bot.
var bot = new Discord.Client();

// Adding events.
bot.on("ready", function() {Events.onReady(bot, data, details, settings, commands);});
bot.on("message", function(message) {Events.onMessage(bot, data, commands, details, settings, EmojiList, message);});
bot.on("disconnected", function() {Events.onDisconnect();});
bot.on("warn", function(m) {Events.onWarn(m);});
bot.on("error", function(m) {Events.onErrors(m);});
bot.on("debug", function(m) {Events.onDebug(settings, m);});
// TODO: New events to track more data.

// Creating interval calls.
const MINUTE = 60000;
setInterval(Events.repeatEveryMinute, MINUTE);
setInterval(Events.repeatEveryHalfHour, 30 * MINUTE, bot, data);
setInterval(Events.repeatEveryHour, 60 * MINUTE);

// Activate the bot.
try {
	bot.login(config["token"]);
} catch (e) {
	log("FATAL", "Invalid token provided for bot connection, please check that config.json exists and ensure the \"token\" field is set.");
	err(e, details.errorDir);
	bot.destroy();
	process.exit(1);
}
//#endregion