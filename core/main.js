require('dotenv').config();

const fs = require("fs");

const Discord = require("discord.js");
const EmojiList = require("emojis-list");

// Creating bot.
const client = new Discord.Client();

// Set up bot event handlers
client.on("message", message => {
    const sender = message.author;
	const channel = message.channel;
	const raw = message.content;
	const input = raw.toUpperCase();

	const isCommand = input.substring(0, 1) === process.env.BOT_COMMAND_CHARACTER;	
	const isBot = sender.bot;

    if (isCommand && !isBot) {
        // Process command
        const command = commandSplit(raw); 
        command[0] = command[0].replace(process.env.BOT_COMMAND_CHARACTER, "");
        Operations.evaluateCommand(message, sender, channel, command, bot, commands, data, details, settings);
    }
    else if (!isCommand) {
        // Operations.evaluateKeysponses(message, sender, channel, raw, data, details);
        // Operations.evaluateSwears(message, sender, channel, raw, data, details);
        
        // Reactions
        try {
            const reactChance = 0.10;
            const multiReactChance = 0.50;
            const guildReactChance = 0.20; 
            let reactCount = 0;

            // Run the first random chance for whether there will be any reactions or not
            if (Math.random() < reactChance) {
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
});

// General command for console logging.
function log(type, text, toConsole = true, toFile = true) {
	// Constant determining how long the type should be.
	const BUFFER_LENGTH = 7;

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
		message += cType.substring(0, 7);
	} 

	// Close off string and log the message.
	message += "] " + text;

    // Log to console
	if (toConsole) {
        console.log(message);
    }

    // Log to file
	if (process.env.FILE_SYSTEM_LOGGING_ENABLED === "1" && toFile) {
        const fileName = process.env.FILE_SYSTEM_LOGGING_LOG_DIR + "/" + getDateString("-", true) + ".txt";
        writeFile(fileName, message + "\n", true);
    }
}

// Writes a given error to an error text file.
function error(error) {
    // Log to console
    console.error("Error", "Reaction failed: " + error.message);

    // Log to file
    if (process.env.FILE_SYSTEM_LOGGING_ENABLED) {
        const filename = process.env.FILE_SYSTEM_LOGGING_ERROR_DIR + "/" + getDateString("-", true) + "-" + getTimeString("-") + ".txt";
        const content = error.stack;
        writeFile(filename, content, false);
        log("Error", "Stack trace saved to \"" + filename + "\".");
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

// Activate the bot.
try {
	client.login(process.env.BOT_TOKEN);
} catch (e) {
	error(e);
	client.destroy();
	process.exit(1);
}