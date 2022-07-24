const dotenv = require('dotenv');
const appInsights = require('applicationinsights');

const { buildConfig } = require("./utilities/config");
const { readFile, writeFile } = require("./utilities/file");
const { getDateString, getTimeString } = require("./utilities/datetime");
const {
    getShitpostWordDictionary,
    generateShitpostTextMessage,
    generateShitpostImageMessage
} = require("./actions/shitpost");

const fs = require("fs");
const path = require("path");

const Discord = require("discord.js");
const express = require('express');
const EmojiList = require("emojis-list");
const Handlebars = require("handlebars");
const { randomBetween } = require('./utilities/random');

const debugFileName = getDateString().replace("/", "-").replace("/", "-").replace("/", "-").replace("/", "-");

writeFile(`./errors/launch${debugFileName}Initial.txt`, "test");

async function main() {
    // Creating config object
    dotenv.config();
    const config = buildConfig();

    writeFile(`./errors/launch${debugFileName}Config.txt`, "test");

    // Set up app insights logging
    let telemetryClient = null;
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
        appInsights.setup()
        appInsights.start();
        telemetryClient = appInsights.defaultClient;

        log("Boot", "Telemetry client initialised.");
    }

    writeFile(`./errors/launch${debugFileName}AppInsights.txt`, "test");

    // Load in bot commands
    const commands = loadCommands();

    // Creating bot client.
    const client = new Discord.Client({
        intents: [
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildEmojisAndStickers,
            Discord.GatewayIntentBits.GuildMembers,
            Discord.GatewayIntentBits.GuildMessageReactions,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.DirectMessages,
            Discord.GatewayIntentBits.DirectMessageReactions,
            Discord.GatewayIntentBits.MessageContent
        ],
        partials: [
            Discord.Partials.Channel,
            Discord.Partials.Message,
            Discord.Partials.Reaction
        ]
    });

    writeFile(`./errors/launch${debugFileName}Client1.txt`, "test");

    // Mount additional details onto client
    client.config = config;
    client.commands = commands;

    // Set up bot event handlers
    client.on("messageCreate", async (message) => {
        const sender = message.author;
        const channel = message.channel;
        const content = message.content;

        const isCommand = content && content.substring(0, 1) === config.bot.commandCharacter;
        const isBot = sender.bot;
        const isSelf = sender.id === client.user.id;

        if (isCommand && !isBot) {
            // Command
            commandProtocol(channel, content, message);
        }
        else if (!isCommand) {
            // Reactions
            await reactionProtocol(message);

            if (!isSelf) {
                // Shitpost
                await shitpostProtocol(channel);
            }
        }
    });

    client.on("messageReactionAdd", async (messageReaction, user) => {
        // If already reacted with this emoji, then ignore
        if (messageReaction.me) {
            return;
        }

        // Check if it passed the reaction change check
        if (Math.random() >= client.config.reactions.joinInReactChance) {
            return;
        }

        const { message, emoji } = messageReaction;

        // React to message
        setTimeout(async () => {
            await message.react(emoji);
        }, randomBetween(500, 2000))

        // Log react
        log("React", "Reacted to message " + message.id + " with other reacted emoji");
    });

    // Shitpost interval
    setInterval(async () => {
        // Return early if no channels
        const channels = client.channels.cache.filter(() => true);
        if (!channels.size) {
            return;
        }

        // Find most recently checked channel
        const wordDictionary = await getShitpostWordDictionary();
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
        const targetChannel = client.channels.cache.filter((channel) => channel.id === targetChannelId).first();
        await shitpostProtocol(targetChannel, true, false);

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

    async function reactionProtocol(message) {
        try {
            const initialReactChance = config.reactions.initialReactChance;
            const multiReactChance = config.reactions.guildEmojiChance;
            const guildReactChance = config.reactions.multiReactChance;
            let reactCount = 0;

            // Run the first random chance for whether there will be any reactions or not
            if (Math.random() < initialReactChance) {
                const standardEmoji = EmojiList;
                const guildEmoji = Array.from(client.emojis.cache.filter(i => !i.animated).values());

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
                    await message.react(reactionEmoji);

                    ++reactCount;
                } while (Math.random() < multiReactChance && reactCount < 20);

                log("React", "Reacted to message " + message.id + " with " + reactCount + " emoji");
            }
        } catch (e) {
            error(e);
        }
    }

    async function shitpostProtocol(channel, allowText = true, allowImages = true) {
        if (!allowText && !allowImages) {
            return;
        }

        try {
            const initialShitpostChance = config.shitpost.initialShitpostChance;
            const textToImageRatio = config.shitpost.textToImageRatio;

            // Run the random check to see if there will be a shitpost
            if (Math.random() < initialShitpostChance) {
                const postText = async () => {
                    // Generate thet text message
                    const shitpostMessage = await generateShitpostTextMessage(client, channel);

                    // Send the message
                    channel.send(shitpostMessage);

                    // Log action
                    log("Shitpost", "Posted a message");
                }

                const postImage = async () => {
                    // Generate the image path
                    const shitpostImageUrl = await generateShitpostImageMessage(client, channel);

                    // Send the message
                    channel.send({
                        files: [
                            shitpostImageUrl
                        ]
                    });

                    // Log action
                    log("Shitpost", "Posted an image");
                }

                if (allowText && allowImages) {
                    if (Math.random() < textToImageRatio) {
                        await postText();
                    }
                    else {
                        await postImage();
                    }
                }
                else if (allowText) {
                    await postText();
                }
                else if (allowImages) {
                    await postImage();
                }
            }
        }
        catch (e) {
            error(e);
        }
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
        await client.login(process.env.BOT_TOKEN);
        writeFile(`./errors/launch${debugFileName}LogIn.txt`, "test");
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
}

writeFile(`./errors/launch${debugFileName}BeforeMain.txt`, "test");
main();
writeFile(`./errors/launch${debugFileName}AfterMain.txt`, "test");