require('dotenv').config();

// Creating config object
const config = Object.freeze({
    bot: {
        commandCharacter: process.env.BOT_COMMAND_CHARACTER,
        githubRepo: process.env.BOT_GITHUB_REPO
    },
    logging: {
        fileSystemLoggingEnabled: process.env.FILE_SYSTEM_LOGGING_ENABLED === "1",
        fileSystemLoggingDirectories: {
            errors: process.env.FILE_SYSTEM_LOGGING_ERROR_DIR,
            logs: process.env.FILE_SYSTEM_LOGGING_LOG_DIR,
        }
    },
    webserver: {
        port: parseInt(process.env.WEB_SERVER_PORT)
    },
    reactions: {
        initialReactChance: parseFloat(process.env.REACTION_INITIAL_CHANCE),
        multiReactChance: parseFloat(process.env.REACTION_MULTI_CHANCE),
        guildEmojiChance: parseFloat(process.env.REACTION_GUILD_EMOJI_CHANCE)
    },
    shitpost: {
        initialShitpostChance: parseFloat(process.env.SHITPOST_INITIAL_CHANCE),
        atypicalFollowUpChance: parseFloat(process.env.SHITPOST_ATYPICAL_FOLLOWUP_CHANCE),
        maxSentenceLength: parseInt(process.env.SHITPOST_MAX_SENTENCE_LENGTH),
        maxSentenceCount: parseInt(process.env.SHITPOST_MAX_SENTENCE_COUNT)
    }
});

const fs = require("fs");
const path = require("path");

const appInsights = require('applicationinsights');
let telemetryClient = null;
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup()
    appInsights.start();
    telemetryClient = appInsights.defaultClient;

    log("Boot", "Telemetry client initialised.");
}

const Discord = require("discord.js");
const express = require('express');
const EmojiList = require("emojis-list");

// Shitpost data storage
const wordDictionary = {};
let channelsLastProcessedTimes = {};
let totalWords = 0;

// Load in bot commands
const commands = loadCommands();

// Creating bot client.
const client = new Discord.Client();

// Mount additional details onto client
client.config = config;
client.commands = commands;

// Set up bot event handlers
client.on("message", message => {
    const sender = message.author;
	const channel = message.channel;
	const content = message.content;

	const isCommand = content.substring(0, 1) === config.bot.commandCharacter;	
	const isBot = sender.bot;
	const isSelf = sender.id === client.user.id;

    if (isCommand && !isBot) {
        // Command
        try {
            // Split command
            const commandParts = content.split(" "); 
            commandParts[0] = commandParts[0].replace(config.bot.commandCharacter, "");

            // Try to find the command
            let commandRun = false;
            for (let command of commands) {
                if (command.name.toUpperCase() === commandParts[0].toUpperCase()) {
                    // TODO: Check if command is usable in channel

                    let args = commandParts.slice(1);
                    command.process(args, client, message);
                    commandRun = true;
                }
            }

            // Let user know if command couldn't be found
            if (!commandRun) {
                channel.send(`Sorry, I couldn't find the ${config.bot.commandCharacter}${commandParts[0].toUpperCase()} command.`);
            }
        }
        catch (e) {
            error(e);
        }
    }
    else if (!isCommand) {
        // Reactions
        try {
            const initialReactChance = config.reactions.initialReactChance;
            const multiReactChance = config.reactions.guildEmojiChance;
            const guildReactChance = config.reactions.multiReactChance; 
            let reactCount = 0;

            // Run the first random chance for whether there will be any reactions or not
            if (Math.random() < initialReactChance) {
                const standardEmoji = EmojiList;
                const guildEmoji = client.emojis.cache.array().filter(i => !i.animated);

                // Loop while the chance of reacting again passes (or until the limit is hit)
                const usedEmoji = [];
                do {
                    // Select a random unused emoji
                    let reactionEmoji = null;
                    do {
                        if (Math.random() < guildReactChance) {
                            reactionEmoji = guildEmoji[Math.floor(Math.random() * guildEmoji.length)];
                        }
                        else {
                            reactionEmoji = standardEmoji[Math.floor(Math.random() * standardEmoji.length)];
                        }                        
                    } while (usedEmoji.includes(reactionEmoji));

                    // Add selected emoji to the used list
                    usedEmoji.push(reactionEmoji);

                    // React to the message with the given emjoi
                    message.react(reactionEmoji);

                    ++reactCount;
                } while (Math.random() < multiReactChance && reactCount < 20);

                log("React", "Reacted to message " + message.id + " with " + reactCount + " emoji");
            }
        } catch (e) {
            error(e);
        }

        if (!isSelf) {
            // Shitpost
            try {
                const initialShitpostChance = config.shitpost.initialShitpostChance;

                // Run the random check to see if there will be a shitpost
                if (Math.random() < initialShitpostChance) {
                    const channelLastProcessedTime = channelsLastProcessedTimes[channel.id] || 0;

                    // Fetch the most recent 100 messages from the channel
                    channel.messages.fetch({ limit: 100 })
                        .then((previousMessages) => {
                            // Build a dictionary of all of the words in the previous 100 messages
                            for (let [_, previousMessage] of previousMessages) {
                                // Break out of loop if timestamp of message is before the last processed time for the channel
                                if (previousMessage.createdTimestamp <= channelLastProcessedTime) {
                                    break;
                                }

                                // Ignore message if it has no content
                                if (!previousMessage.content) {
                                    continue;
                                }

                                // Ignore message if it was written by the us
                                if (previousMessage.author.id === client.user.id) {
                                    continue;
                                }

                                // Remove some punctuation from the sentence, then split on spaces
                                const previousContentWords = previousMessage.content
                                    .replace(/\./g, "").replace(/\,/g, "").replace(/\;/g, "")
                                    .replace(/\!/g, "").replace(/\?/g, "").split(" ");

                                for (let word of previousContentWords) {
                                    // If the word is empty, ignore it
                                    if (!word) {
                                        continue;
                                    }

                                    // Ignore if word is a link, ignore it
                                    if (word.includes("/") || word.includes("://")) {
                                        continue;
                                    }

                                    // Trim the word
                                    word = word.trim();

                                    // Update the dictionary with the new instance of the word
                                    if (wordDictionary[word] > 0) {
                                        wordDictionary[word] = wordDictionary[word] + 1;
                                    }
                                    else {
                                        wordDictionary[word] = 1;
                                    }

                                    totalWords++;
                                }
                            }

                            // Update channel last processed time
                            let firstMessage = null;
                            for (let [_, previousMessage] of previousMessages) {
                                firstMessage = previousMessage;
                                break;
                            }
                            if (firstMessage) {
                                channelsLastProcessedTimes[channel.id] = firstMessage.createdTimestamp || 0;
                            }

                            // Flatten dictionary into a list
                            const wordList = [];
                            for (let wordKey in wordDictionary) {
                                wordList.push([wordKey, wordDictionary[wordKey]]);
                            }

                            // Determine the number of sentences to write
                            const sentenceCount = (Math.random() * config.shitpost.maxSentenceCount) + 1;
                            const sentenceList = [];

                            for (let sentenceNumber = 1; sentenceNumber <= sentenceCount; sentenceNumber++) {
                                // Begin constructing the sentence
                                let sentence = "";
                                let wordsAdded = 0;

                                // Determine a random length for the sentence, then loop until that length has been met
                                const sentenceLength = (Math.random() * config.shitpost.maxSentenceLength) + 1;
                                while (wordsAdded < sentenceLength) {
                                    // Generate a random number corresponding to the word to add
                                    const wordNumber = (Math.random() * totalWords) + 1;

                                    let currentWordNumberSum = 0;
                                    for (let [potentialWord, potentialWordCount] of wordList) {
                                        // Add the number of occurrences of the word in the data to the running count;
                                        currentWordNumberSum += potentialWordCount;

                                        // If the running count exceeds the random value, then add the current word to the sentence
                                        if (currentWordNumberSum > wordNumber) {
                                            // Add the word itself to the sentence
                                            sentence += potentialWord;

                                            // Add a space after the word, with a chance to add an occasional comma
                                            if (Math.random() < 0.08) {
                                                sentence += ", ";
                                            }
                                            else {
                                                sentence += " ";
                                            }

                                            // Break out of the loop
                                            break;
                                        }
                                    }

                                    wordsAdded++;
                                }

                                // Uppercase the start of the sentence, and trim the trailing spaces or comma
                                sentence = sentence.substring(0, 1).toUpperCase() + sentence.substring(1);
                                while (sentence.endsWith(",") || sentence.endsWith(" ")) {
                                    sentence = sentence.substring(0, sentence.length - 1);
                                }

                                // Pick a random end character
                                const endRandomValue = Math.random();
                                if (endRandomValue <= 0.5) {
                                    sentence += ".";
                                }
                                else if (endRandomValue <= 0.75) {
                                    sentence += "?";
                                }
                                else {
                                    sentence += "!";
                                }

                                // Add the sentence to the list
                                sentenceList.push(sentence);
                            }

                            // Construct the message from the sentence list
                            const joinedSentences = sentenceList.join(" ");

                            // Send the message
                            channel.send(joinedSentences);
                            
                            // Log action
                            log("Shitpost", "Posted a message");
                        });
                }
            }
            catch (e) {
                error(e);
            }
        }
    }
});

// General command for console logging.
function log(type, text, toConsole = true, toFile = true, toTelemetry = true) {
	// Constant determining how long the type should be.
	const BUFFER_LENGTH = 8;

	// Creating initial string.
	let message = "[" + getTimeString() + "] [";

	// Add the type to the message string
	if (type.length <= BUFFER_LENGTH) {
		message += type;

        // Buffing length if type is too short.
		for (var i = 0; i < BUFFER_LENGTH - type.length; ++i) {
            message += " ";
        }
	}
	// Shortening type if too long.
	else if (type.length > BUFFER_LENGTH) {
		message += type.substring(0, 7);
	} 

	// Close off string and log the message.
	message += "] " + text;

    // Log to console
	if (toConsole) {
        console.log(message);
    }

    // Log to file
	if (config.logging.fileSystemLoggingEnabled && toFile) {
        const fileName = config.logging.fileSystemLoggingDirectories.logs + "/" + getDateString("-", true) + ".txt";
        writeFile(fileName, message + "\n", true);
    }

    // Log to telemetry
    try {
        if (telemetryClient && toTelemetry) {
            telemetryClient.trackTrace({
                message 
            });
        }
    }
    catch (e) {
        console.log(e);
    }
}

// Writes a given error to an error text file.
function error(error) {
    // Log to console
    console.error("Error", error.message);

    // Log to file
    if (config.logging.fileSystemLoggingEnabled) {
        const filename = config.logging.fileSystemLoggingDirectories.errors + "/" + getDateString("-", true) + "-" + getTimeString("-") + ".txt";
        const content = error.stack;
        writeFile(filename, content, false);
        log("Error", "Stack trace saved to \"" + filename + "\".");
    }

    // Log to telemtry provider
    if (telemetryClient) {
        telemetryClient.trackException({
            exception: error
        })
    }
}

// Gets the time for the TIME command.
function getTimeString(delimeter = ":") {
	var date = new Date();
	
    var hours = date.getHours().toString(); 
    if (hours.length < 2) {
        hours = "0" + hours;
    }
	
    var mins = date.getMinutes().toString(); 
    if (mins.length < 2) {
        mins = "0" + mins;
    }
	
    var secs = date.getSeconds().toString(); 
    if (secs.length < 2) {
        secs = "0" + secs;
    }
	
    return hours + delimeter + mins + delimeter + secs;
}

// Gets the date for the date command.
function getDateString(delimeter = "/", flip = false) {
	var date = new Date();

	var day = date.getDate().toString(); 
    if (day.length < 2) {
        day = "0" + day;
    }

	var month = (date.getMonth() + 1).toString(); 
    if (month.length < 2) {
        month = "0" + month;
    
    }
	var year = date.getFullYear().toString();

    if (!flip) {
        return day + delimeter + month + delimeter + year;
    }
    else {
        return year + delimeter + month + delimeter + day;
    }
	
}

// Loads in a file at the specified path.
function readFile(path) {
	return fs.readFileSync(path, "utf8");
}

// Writes a string to a file specified by path.
function writeFile(path, content, append = false) {
    if (path.includes("/")) {
        const dirPath = path.substring(0, path.lastIndexOf("/"));
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    }

    if (append) {
        fs.appendFileSync(path, content);
    }
    else {
        fs.writeFileSync(path, content);
    }
}

function loadCommands() {
    const commands = [];

    // Read all of the folders (categories) in the commands folder
    const categoryFolders = fs.readdirSync("./commands/");
    for (let categoryFolderName of categoryFolders) {
        // Read the commands in each category folder
        const commandFiles = fs.readdirSync(`./commands/${categoryFolderName}`);
        for (let commandFile of commandFiles) {
            let command = null
            try {
                // Require the command from the file
                command = require(path.resolve(__dirname, `./../commands/${categoryFolderName}/${commandFile}`));
            }
            catch (e) {
                error(e);
                continue;
            }

            // If command's true flag is not explicitly active, then skip it
            if (command.active !== true) continue;

            // Set the category field of the command
            command.category = categoryFolderName;

            // Add the command to the list
            commands.push(command);
        }
    }

    // Order by category and order fields
    // TODO

    return commands;
}

// Activate the bot.
try {
	client.login(process.env.BOT_TOKEN);
    log("Boot", "Bot logged in.");
} catch (e) {
	error(e);
	client.destroy();
	process.exit(1);
}

// Spin up a web server to keep live checks happy for now.
try {
    const app = express();

    app.get('/', (req, res) => {
        res.send(readFile("site/index.html"));
    });
    app.listen(config.webserver.port);

    log("Boot", "Web server spun up.");
}
catch (e) {
    error(e);
	client.destroy();
	process.exit(1);
}