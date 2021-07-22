require('dotenv').config();

// Creating config object
const config = Object.freeze({
    bot: {
        commandCharacter: process.env.BOT_COMMAND_CHARACTER,
        githubRepo: process.env.BOT_GITHUB_REPO,
        websiteUrl: process.env.BOT_WEBSITE_URL
    },
    files: {
        backupInterval: parseInt(process.env.FILE_BACKUP_INTERVAL)
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
        maxSentenceCount: parseInt(process.env.SHITPOST_MAX_SENTENCE_COUNT),
        randomSentenceTryInterval: parseInt(process.env.SHITPOST_RANDOM_SENTENCE_TRY_INTERVAL)
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
const Handlebars = require("handlebars");

// Shitpost data storage
let wordDictionary = {
    version: "1.0",
    entries: {},
    totalWordsProcessed: 0,
    channels: {}
};
if (fs.existsSync("data/dictionary.json")) {
    wordDictionary = JSON.parse(readFile("data/dictionary.json"));
}

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
        commandProtocol(channel, content, message);
    }
    else if (!isCommand) {
        // Reactions
        reactionProtocol(message);

        if (!isSelf) {
            // Shitpost
            shitpostProtocol(channel);
        }
    }
});

// Backup interval
client.setInterval(() => {
    // Save the dictionary to a file
    try {
        writeFile("data/dictionary.json", JSON.stringify(wordDictionary));
        log("File", "Backed up dictionary.");
    }
    catch (e) {
        error(e);
    }
}, config.files.backupInterval)

// Reaction interval
client.setInterval(() => {
    // Return early if no channels
    const channels = client.channels.cache.filter(() => true);
    if (!channels.size) {
        return;
    }

    // Find most recently checked channel
    let targetChannelId = 0;
    let newestCheckTime = 0;
    for (let channelId in wordDictionary.channels) {
        const lastCheckTime = wordDictionary.channels[channelId].lastCheckTime;
        if (lastCheckTime > newestCheckTime) {
            targetChannelId = channelId;
            newestCheckTime = lastCheckTime;
        }
    }

    // If no channel found, return
    if (targetChannelId === 0) {
        return;
    }

    // Find channel, and try to send shitpost
    const targetChannel = client.channels.cache.filter((channel) => channel.id === targetChannelId).array()[0];
    shitpostProtocol(targetChannel);

}, config.shitpost.randomSentenceTryInterval);

function commandProtocol(channel, content, message) {
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

function reactionProtocol(message) {
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
}

function shitpostProtocol(channel) {
    try {
        const initialShitpostChance = config.shitpost.initialShitpostChance;

        // Run the random check to see if there will be a shitpost
        if (Math.random() < initialShitpostChance) {
            // Fetch the most recent 100 messages from the channel
            channel.messages.fetch({ limit: 100 })
                .then((previousMessages) => {
                    // Update the dictionary with this batch of messages
                    updateDictionary(channel.id, previousMessages);

                    // Get a version of the dictionary with correctly weighted chances
                    const weightedDictionary = createWeightedDictionary();

                    // Determine the number of sentences to write
                    const sentenceCount = (Math.random() * config.shitpost.maxSentenceCount) + 1;
                    const sentenceList = [];

                    for (let sentenceNumber = 1; sentenceNumber <= sentenceCount; sentenceNumber++) {
                        const sentence = generateSentence(weightedDictionary);

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

function updateDictionary(channelId, messageBatch) {
    if (!wordDictionary.channels[channelId]) {
        wordDictionary.channels[channelId] = {
            lastCheckTime: 0
        };
    }
    const channelEntry = wordDictionary.channels[channelId];

    // Run through the message batch
    for (let [_, message] of messageBatch) {
        // Break out of loop if timestamp of message is before the last processed time for the channel
        if (message.createdTimestamp <= channelEntry.lastCheckTime) {
            break;
        }

        // Ignore message if it has no content, or if it was written by a bot
        if (!message.content || message.author.bot) {
            continue;
        }

        // Create list to hold finished word chain
        let messageWordChain = [];

        // Split the word by spaces for processing
        for (let word of message.content.split(" ")) {
            // If word is a link, ignore it
            if (word.includes("://")) {
                messageWordChain.push(null);
                continue;
            }

            // Remove select characters from the word (unless it's an emoji)
            let sentenceEnder = false;
            if (!word.startsWith("<:") || !word.endsWith(">")) {
                word = word.replace(/[^a-zA-Z0-9_\-\'.?!]/g, " ").trim();

                // Determine if this word is the end of a sentence
                if (word.endsWith(".") || word.endsWith("!") || word.endsWith("?")) {
                    sentenceEnder = true;
                }

                word = word.replace(/[.?!]/g, " ").trim();
            }

            // If the word is empty/null/undefined, ignore it
            if (!word) {
                messageWordChain.push(null);
                continue;
            }

            // Else, word is good, add it to the chain
            messageWordChain.push(word);

            // If word was at the end of a sentence, add a break after it in the chain
            if (sentenceEnder) {
                messageWordChain.push(null);
            }
        }

        // Run through message word chain and update dictionary
        for (let i = 0; i < messageWordChain.length; ++i) {
            // Pull out the current and next word
            const word = messageWordChain[i];
            const nextWord = i + 1 < messageWordChain.length ? messageWordChain[i + 1] : null;

            // Continue if the current word was removed, or was the end of a sentence
            if (!word) {
                continue;
            }

            // Add entry for the current word to the dictionary if it doesn't exist
            if (!wordDictionary.entries[word.toLowerCase()]) {
                wordDictionary.entries[word.toLowerCase()] = {
                    count: 0,
                    appearances: {},
                    followups: {}
                };
            }
            const dictionaryEntry = wordDictionary.entries[word.toLowerCase()];

            // Increase the count of times the word has appeared
            dictionaryEntry.count += 1;

            // Add the appearance to the list if not present
            if (!dictionaryEntry.appearances[word]) {
                dictionaryEntry.appearances[word] = {
                    count: 0
                };
            }
            const appearanceEntry = dictionaryEntry.appearances[word];

            // Increment the number of times that appearance has appeared
            appearanceEntry.count += 1;

            // Add the next word to the followup list if not present
            let followupEntry = null;
            if (!nextWord) {
                followupEntry = dictionaryEntry.followups["#:#null#:#"];
                if (!followupEntry) {
                    dictionaryEntry.followups["#:#null#:#"] = {
                        count: 0
                    };
                    followupEntry = dictionaryEntry.followups["#:#null#:#"];
                }
            }
            else {
                followupEntry = dictionaryEntry.followups[nextWord.toLowerCase()];
                if (!!nextWord && !followupEntry) {
                    dictionaryEntry.followups[nextWord.toLowerCase()] = {
                        count: 0
                    };
                    followupEntry = dictionaryEntry.followups[nextWord.toLowerCase()];
                }
            }

            // Increment the count of the next word following up the current word
            followupEntry.count += 1;

            // Increment the total word processed count of the dictionary
            wordDictionary.totalWordsProcessed += 1;
        }
    }

    // Update channel last processed time
    let newestMessage = null;
    for (let [_, message] of messageBatch) {
        newestMessage = message;
        break;
    }
    if (newestMessage) {
        channelEntry.lastCheckTime = newestMessage.createdTimestamp;
    }
}

function createWeightedDictionary() {
    const weightedDictionary = [];

    // Loop though every entry
    for (let entryKey in wordDictionary.entries) {
        const entry = wordDictionary.entries[entryKey];
        const weightedEntry = {
            word: entryKey,
            chance: 0,
            appearances: [],
            followups: []
        }

        // Calculate the chance of that entry being chosen
        weightedEntry.chance = entry.count / wordDictionary.totalWordsProcessed;

        // Calculate the chance of each appearance of the word being used
        for (let appearanceEntryKey in entry.appearances) {
            const appearanceEntry = entry.appearances[appearanceEntryKey];
            weightedEntry.appearances.push({
                text: appearanceEntryKey,
                chance: appearanceEntry.count / entry.count
            })
        }

        // Calculate the chance of each followup being used
        for (let followupEntryKey in entry.followups) {
            const followupEntry = entry.followups[followupEntryKey];
            weightedEntry.followups.push({
                word: followupEntryKey,
                chance: followupEntry.count / entry.count
            })
        }

        // Add the weighted entry to the weighted dictionary
        weightedDictionary.push(weightedEntry);
    }

    return weightedDictionary;
}

function generateSentence(weightedDictionary) {
    // Begin constructing the sentence
    let sentence = "";
    let wordsAdded = 0;

    // Determine a random length for the sentence
    const sentenceLength = (Math.random() * config.shitpost.maxSentenceLength) + 1;

    // Loop until sentence length has been met
    let previousWord = null;
    while (wordsAdded < sentenceLength) {
        // Run a random check to see if the previous words followups will be ignored
        const ignoreFollowups = Math.random() < config.shitpost.atypicalFollowUpChance;

        let currentWord = null;

        // If this is the first word of the sentence, then select a random word 
        if (!previousWord || ignoreFollowups) {
            // Generate random float, and use that to determine the word
            const wordRoll = Math.random();

            let runningTotal = 0;
            for (let i = 0; i < weightedDictionary.length; ++i) {
                currentWord = weightedDictionary[i];
                runningTotal += currentWord.chance;

                if (runningTotal > wordRoll) {
                    break;
                }
            }
        }
        // Else, use the previous words followups to determine the next word
        else {
            // Check number of followups
            let currentFollowup = null;
            if (previousWord.followups.length === 0) {
                previousWord = null;
                continue;
            }
            if (previousWord.followups.length === 1) {
                // Pick the first followup if there's only one
                currentFollowup = previousWord.followups[0];
            }
            else {
                // Select a random followup from the previous words followup list
                const followupRoll = Math.random();

                let runningTotal = 0;
                for (let i = 0; i < previousWord.followups.length; ++i) {
                    currentFollowup = previousWord.followups[i];
                    runningTotal += currentFollowup.chance;

                    if (runningTotal > followupRoll) {
                        break;
                    }
                }
            }

            // If null entry returned, retry loop with completely random word
            if (currentFollowup.word === "#:#null#:#") {
                previousWord = null;
                continue;
            }

            // Turn the followup into a word from the dictionary entries
            currentWord = weightedDictionary.filter((entry) => entry.word === currentFollowup.word)[0];
        }

        // Select an appearance for the word
        let currentAppearance = null;

        if (currentWord.appearances.length === 1) {
            currentAppearance = currentWord.appearances[0];
        }
        else {
            let runningTotal = 0;
            const appearanceRoll = Math.random();

            for (let i = 0; i < currentWord.appearances.length; ++i) {
                currentAppearance = currentWord.appearances[i];
                runningTotal += currentAppearance.chance;

                if (runningTotal > appearanceRoll) {
                    break;
                }
            }
        }
        const wordToAdd = currentAppearance.text;

        // Add the word to the sentence
        sentence += wordToAdd;

        // Add a space after the word, with a chance to add an occasional comma
        if (Math.random() < 0.08) {
            sentence += ", ";
        }
        else {
            sentence += " ";
        }

        // Store the current word as the previous word, and repeat.
        previousWord = currentWord;

        wordsAdded++;
    }

    // Uppercase the start of the sentence, and trim the trailing spaces or comma
    sentence = sentence.substring(0, 1).toUpperCase() + sentence.substring(1);
    while (sentence.endsWith(",") || sentence.endsWith(" ")) {
        sentence = sentence.substring(0, sentence.length - 1);
    }

    // Pick a random end character
    const endRandomValue = Math.random();
    if (endRandomValue <= 0.6) {
        sentence += ".";
    }
    else if (endRandomValue <= 0.8) {
        sentence += "?";
    }
    else {
        sentence += "!";
    }

    // Return the sentence
    return sentence;
}

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
        // Read handlebars file and convert into template
        const source = readFile(path.resolve(__dirname, "./../site/pages/index.hbs"));
        const template = Handlebars.compile(source);

        // Determine online time
        const onlineMilliseconds = client.uptime;

        const onlineDays = Math.trunc(onlineMilliseconds / 86400000);
        const onlineHours = Math.trunc(onlineMilliseconds / 3600000) % 24;
        const onlineMinutes = Math.trunc(onlineMilliseconds / 60000) % 60;
        const onlineSeconds = Math.trunc(onlineMilliseconds / 1000) % 60;

        let onlineTime = "";
        if (onlineDays > 0) {
            onlineTime += `${onlineDays} day(s), `;
        }
        if (onlineHours > 0) {
            onlineTime += `${onlineHours} hour(s), `;
        }
        if (onlineMinutes > 0) {
            onlineTime += `${onlineMinutes} minute(s), `;
        }
        if (onlineSeconds > 0) {
            onlineTime += `${onlineSeconds} second(s)`;
        }

        if (!onlineTime) {
            onlineTime = "0 seconds";
        }
        else if (onlineTime.endsWith(", ")) {
            onlineTime = onlineTime.substring(0, onlineTime.length - 2);
        }

        // Generate the page from the template and repsond
        res.send(template({
            githubRepo: config.bot.githubRepo,
            onlineTime,
            serverCount: client.guilds.cache.size || 0
        }));
    });
    app.use(express.static(path.resolve(__dirname, "./../site/static")));
    app.listen(config.webserver.port);

    log("Boot", "Web server spun up.");
}
catch (e) {
    error(e);
    client.destroy();
    process.exit(1);
}