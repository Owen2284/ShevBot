// events.js: Stores functions to be placed into shevbot listeners.

const Tools = require("./tools.js");
const Operations = require("./operations.js");
const { cmd } = require("./prep.js");

const log = Tools.comms.cmd;
const err = Tools.debug.err;
const readJSON = Tools.fs.readJSON;
const writeJSON = Tools.fs.writeJSON;
const commandSplit = Tools.commands.commandSplit;

// Ready event handler, greets allowed channels.
function onReady(bot, data, details, settings, commands) {
    if (settings.initialBoot) {
        // Increment the boot count.
        data.bot["boot"] = data.bot["boot"] + 1;
        writeJSON(details.dataDir + "bot.json", data.bot);

        // Run greeting code.
        if (!settings.debug) {
            var channelArr = bot.channels.cache.array();
            var commandCount = commands.length;
            var greetingString = data.commands["THEME"]["currentTheme"]["greeting"].replace("#VERSION", details.versionNumber).replace("#SERVERS", bot.guilds.cache.array().length).replace("#COMMANDS", commandCount);
            for (var i in channelArr) {
                var currentChannel = channelArr[i];
                if (Tools.discord.getChannelType(currentChannel) === "Text") {
                    for (var j in data.chat["greetings"]["channelsToGreet"]) {
                        if (currentChannel.name.toUpperCase() === data.chat["greetings"]["channelsToGreet"][j]) {
                            currentChannel.send(greetingString);
                            ++data.chat["greetings"]["counter"];
                            log("greet", "Channel \"" + currentChannel.name + "\" greeted.");
                        }
                    }
                }
            }
            writeJSON(details.dataDir + "chat.json", data.chat);
        }

        // Set a "game" to play.
        Tools.discord.setNewBotGame(bot, data);

        // Toggle the initial boot variable.
        settings.initialBoot = false;
    }
}

// Message event handler. Parses message and fires own events, and parse for commands and executes them.
function onMessage(bot, data, commands, details, settings, emojis, message) {
    var sender = message.author;
	var channel = message.channel;
	var raw = message.content;
	var input = raw.toUpperCase();
	var isCommand = input.substring(0, 1) === details.commandCharacter;	
	var isLink = Tools.text.isLink(raw);
	var isBot = sender.bot;
	
	if(!isBot || settings.allowLooping) {
		if (isCommand) {
			var command = commandSplit(raw); command[0] = command[0].replace(details.commandCharacter, "");
			Operations.evaluateCommand(message, sender, channel, command, bot, commands, data, details, settings);
		} else {
			Operations.evaluateKeysponses(message, sender, channel, raw, data, details);
			Operations.evaluateReactions(message, sender, channel, raw, data, details, emojis, bot);
			Operations.evaluateSwears(message, sender, channel, raw, data, details);
		}
	}
}

function onDisconnect() {
    log("disconnect", "Disconnected! Shutting down..."); 
    log("boot", "ShevBot ended."); 
    process.exit(1);
}

function onWarn(m) {
    log("warning", m.toString());
}

function onErrors(m) {
    log("error", m.toString());
}

function onDebug(settings, m) {
    if (settings.debug) {
        log("debug", m);
    }
}

function repeatEveryMinute() {
    // TODO: Interval function to test connection.
}

function repeatEveryHalfHour(bot, data) {
    Tools.discord.setNewBotGame(bot, data);
}

function repeatEveryHour() {
    // Dunno what to do with this.
}

exports.onReady = onReady;
exports.onMessage = onMessage;
exports.onDisconnect = onDisconnect;
exports.onWarn = onWarn;
exports.onErrors = onErrors;
exports.onDebug = onDebug;

exports.repeatEveryMinute = repeatEveryMinute
exports.repeatEveryHalfHour = repeatEveryHalfHour;
exports.repeatEveryHour = repeatEveryHour;