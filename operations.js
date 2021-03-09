// operations.js: Stores  any behavioural functions used by ShevBot (evalKeysponses, evalCommand, etc.)

const Tools = require("./tools.js");

const say = Tools.comms.say;
const pm = Tools.comms.pm;
const log = Tools.comms.cmd;
const err = Tools.debug.err;
const readJSON = Tools.fs.readJSON;
const writeJSON = Tools.fs.writeJSON;
const requireSafely = Tools.require.requireSafely;

function evaluateCommand(message, sender, channel, command, bot, commands, data, details, settings) {
    
    // Get the necessary command data.
    var commandID = command[0].toUpperCase();
    var commandName = command[0]
    var commandObject = undefined;
    var commandChannel = Tools.discord.getChannelType(channel);
    
    // Search through the currently stored commands to determine if a valid command was entered.
    for (var i in commands) {
        var thisCommandHere = commands[i];
        if (thisCommandHere.aliases.indexOf(commandID) >= 0) {
            commandObject = thisCommandHere;
            break;
        }
    }

    // Checks for a command match.
    if (commandObject != undefined) {
        // Runs all of the checks on the command data.
        const installedPackages = requireSafely("installed-packages");
        var activeCheck = commandObject.active;
        var botPermissionsCheck = commandObject.botPermissions.length == 0 || commandChannel != "Guild" || message.guild.member(bot.user).hasPermission(commandObject.botPermissions, false, true, false);
        var userPermissionsCheck = commandObject.userPermissions.length == 0 || commandChannel != "Guild" || message.member.hasPermission(commandObject.userPermissions, false, true, true);
        var packagesPromise = installedPackages();
        var argsCheck = command.length > commandObject.minArgs;
        var channelCheck = (commandChannel == "Text" && commandObject.guild) || ((commandChannel == "DM" || commandChannel == "GroupDM") && commandObject.pm)
        // Runs package check promise.
        packagesPromise.then(function(packages) {
            var packagesCheck = false;
            var allThere = true;
            for (var packNum in commandObject.packages) {
                if (packages.indexOf(commandObject.packages[packNum]) == -1) {
                    allThere = false;
                }
            }
            if (allThere) {
                packagesCheck = true;
            }
            // Final check check.
            if (activeCheck && botPermissionsCheck && userPermissionsCheck && packagesCheck && argsCheck && channelCheck) {
                try {
                    // Constructing manifest.
                    var manifest = {
                        message: {
                            message: message,                           // Mesage object
                            raw: message.content,                       // Raw text in the message
                            upper: message.content.toUpperCase(),       // Uppercase message
                            lower: message.content.toLowerCase(),       // Lowercase message
                            link: Tools.text.isLink(message.content)    // Wherer or not the message is likely a link
                        },
                        channel: {
                            channel: channel,                   // Channel message was sent on
                            guild: channel.guild,               // Guild (server) of the channel
                            type: commandChannel                // Type of channel (Guild, text, DM or group DM)
                        },
                        author: {
                            author: sender,                     // Sender of message
                            bot: sender.bot                     // Is author a bot or not
                        },
                        command: {
                            name: commandName,                  // Command name (e.g. HELP, TIME)
                            canon: commandObject.aliases[0],    // Canon version of name instead of alias used
                            args: command.slice(1),             // List of command arguments
                            numArgs: command.slice(1).length,   // Number of arguments
                            full: command                       // Entire command array
                        },
                        datetime: {
                            time: Tools.datetime.getTime(),     // Send time
                            date: Tools.datetime.getDate()      // Send date
                        }
                    };
                    // Running the command.
                    commandObject.process(bot, manifest, data, settings, details, commands);
                    //Delete call message if necessary.
                    var canDelete = commandChannel == "Guild" && message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES")
                    if (commandObject.deleteCall && canDelete) {message.delete();}		// TODO: Fix
                    // Logging.
                    log("command", sender.username + " ran command " + details.commandCharacter + commandID + " successfully.");
                } 
                catch (e) {
                    say("send", message, "Whoa! Shevbot encountered an error while executing the \"" + commandID + "\" command! Please check the console for the stack trace.");
                    log("command", sender.username + " ran command " + details.commandCharacter + commandID + ", but an error occurred.");
                    err(e);
                    if (!settings.debug) {
                        commandObject.process = function(bot, manifest, data, settings, details, commands) {
                            say("send", manifest.message.message, "This command has been disabled, as it encountered an error when it last ran. Run a REFRESH to re-allow this command's usage.");	
                        }
                    }
                }
            } else {
                // Outputting failure message.
                var failureMessage = "Sorry, I couldn't run " + details.commandCharacter + commandName + " for you, because:\n";
                var failedChecks = "";
                if (!argsCheck) {
                    failureMessage += " This command requires at least " + commandObject.minArgs + " arguments for it to be run.\n";
                    failedChecks += "Minimum Arguments, ";
                }
                if (!channelCheck) {
                    failureMessage += " This command can't be run in a " + (commandChannel == "Text" ? "server" : "DM") + " channel.";
                    failedChecks += "Channel, ";
                }
                if (!activeCheck) {
                    failureMessage += " The command is inactive!\n";
                    failedChecks += "Activity, ";
                }
                if (!botPermissionsCheck) {
                    failureMessage += " I don't have the correct permissions to run it. (Needed: " + Tools.arrays.arrayToString(commandObject.botPermissions, ", ") + ")\n";
                    failedChecks += "Bot Permissions, ";
                }
                if (!userPermissionsCheck) {
                    failureMessage += " You don't have the correct permissions to run it! (Needed: " + Tools.arrays.arrayToString(commandObject.userPermissions, ", ") + ")\n";
                    failedChecks += "User Permissions, ";
                }
                if (!packagesCheck) {
                    failureMessage += " I'm missing code packages necessary to run it. (Needed: " + Tools.arrays.arrayToString(commandObject.packages, ", ") + ")\n";
                    failedChecks += "Required Packages, ";
                }
                say("send", message, failureMessage);
                log("command", sender.username + " tried to run command " + details.commandCharacter + commandID + ", but failed the following checks: " + failedChecks.substring(0, failedChecks.length - 2));	
            }
        });
    } else {
        say("send", message, "Sorry, \"" + details.commandCharacter + commandName + "\" is not a command!");
        log("command", sender.username + " tried to run command " + details.commandCharacter + commandID + ", but this command doesn't exist in my command list.");		
    }

}

function evaluateKeysponses(message, sender, channel, text, data, details) {

    try {
        // Loop through all categories of messages.
        var logMessage = "";
        var allCategories = ["fullMatches", "partMatches"];	
        for (cat = 0; cat < allCategories.length; cat++) {

            // Get category from JSON.
            var category = data.chat["keysponses"][allCategories[cat]];

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
                    if(Tools.keysponses.determineMatch(allCategories[cat], keywords[j], text.toUpperCase())) {
                        // If match, get response, send message, and log the keyword and response.
                        logMessage += keywords[j] + ", ";
                        send = Tools.keysponses.getResponse(responses);
                        say(command, message, send);
                        var saveFoundData = false;
                        if (data.commands["FOUND"]["keywords"].indexOf(keywords[j]) == -1) {data.commands["FOUND"]["keywords"].push(keywords[j]); saveFoundData = true;}
                        if (data.commands["FOUND"]["responses"].indexOf(send) == -1) {data.commands["FOUND"]["responses"].push(send); saveFoundData = true;}
                        if (saveFoundData) {writeJSON(details.dataDir + "commands.json", data.commands);}
                        // Force advance to next pair.
                        j = keywords.length;
                    }

                }

            }

        }
        if (logMessage != "") {
            log("keyword", sender.username + "'s message matched the keywords: " + logMessage.substring(0, logMessage.length-2));
        }
        return;
    } catch (e) {
        log("keyword", "Chat evaluation failed, error encountered.");	
        err(e);
        return;
    }

}

function evaluateSwears(message, sender, channel, text, data, details) {

    try {
        // Determines swears in the message.
        var swearsFound = [];
        for(swe = 0; swe < data.chat["swears"]["swearlist"].length; swe++) {
            if(text.toUpperCase().includes(data.chat["swears"]["swearlist"][swe])){
                swearsFound.push(data.chat["swears"]["swearlist"][swe]);
                log("swear", "Swear detected.");
            }
        }

        // Counts the found swears.
        if(swearsFound.length > 0) {
            for(swe = 0; swe < swearsFound.length; swe++) {
                data.chat["swears"]["counter"] += Tools.text.countOccurrences(text.toUpperCase(), swearsFound[swe], true);
            }
            writeJSON(details.dataDir + "chat.json", data.chat);
        }
    } catch (e) {
        log("swear", "Swear evaluation failed, error encountered.");	
        err(e);
    }

}

function evaluateReactions(message, sender, channel, text, data, details, emojis, bot) {

    if (emojis != null) {
        try {
            var reactChance = 1;
            var multiReactChance = 0.50;
            var guildReactChance = 0.20; 
            let reactCount = 0;

            if (Math.random() < reactChance) {
                const standardEmoji = emojis;
                const guildEmoji = bot.emojis.cache.array().filter(i => !i.animated);

                const usedEmoji = [];
                do {
                    let reactionEmoji = null;
                    do {
                        if (Math.random() < guildReactChance) {
                            reactionEmoji = guildEmoji[Math.floor(Math.random() * guildEmoji.length)];
                        }
                        else {
                            reactionEmoji = standardEmoji[Math.floor(Math.random() * standardEmoji.length)];
                        }                        
                    } while (usedEmoji.includes(reactionEmoji));
                    usedEmoji.push(reactionEmoji);

                    log("react", "Reacted to message with \"" + reactionEmoji.toString() + "\" .");
	                message.react(reactionEmoji);

                    ++data.chat["reacts"]["counter"];
                    ++reactCount;
                } while (Math.random() < multiReactChance && reactCount < 20);
                log("react", "Reacted to message " + reactCount + " time(s).");
                writeJSON(details.dataDir + "chat.json", data.chat);
            }
        } catch (e) {
            log("react", "Reaction failed, error encountered:");	
            err(e, details.errorDir);
        }
    } else {
        log("react", "Reaction failed, EmojiList was not loaded in at launch.");
    }

}

exports.evaluateCommand = evaluateCommand;
exports.evaluateKeysponses = evaluateKeysponses;
exports.evaluateReactions = evaluateReactions
exports.evaluateSwears = evaluateSwears;