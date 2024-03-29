const { randomBetween } = require("./../utilities/random");
const { readBlobFile, writeBlobFile, getListOfFiles, getFileUrl } = require("./../utilities/blob");

const path = require('path');
const axios = require('axios');

// Example empty dictionary
// {
//     version: "1.0",
//     entries: {},
//     totalWordsProcessed: 0,
//     channels: {}
// }

async function getShitpostWordDictionary() {
    // Get dictionary from blob
    wordDictionary = JSON.parse(await readBlobFile("dictionary.json"));

    return wordDictionary;
}

async function saveShitpostWordDictionary(wordDictionary) {
    // Save the dictionary to a file
    try {
        const success = await writeBlobFile("dictionary.json", JSON.stringify(wordDictionary));
        if (!success) throw "writeBlobFile returned useuccessful status";
    }
    catch (e) {
        error(e);
    }
}

function processWord(word) {
    // If word is a link, ignore it
    if (word.includes("://")) {
        return [];
    }

    // Check if word is a special Discord string
    const isDiscordEmoji = !!word.match(/<:[A-z0-9_-]+:[0-9]+>/);
    const isDiscordUserTag = !!word.match(/<@![0-9]+>/);
    const isDiscordChannelTag = !!word.match(/<#[0-9]+>/);

    // If word is a channel tag, ignore it
    if (isDiscordChannelTag) {
        return [];
    }

    // Remove select characters from the word (unless it's an emoji or user tag)
    let sentenceEnder = false;
    if (!isDiscordEmoji && !isDiscordUserTag) {
        word = word.replace(/[^a-zA-Z0-9_\-\'.?!]/g, " ").trim();

        // Determine if this word is the end of a sentence
        if (word.endsWith(".") || word.endsWith("!") || word.endsWith("?")) {
            sentenceEnder = true;
        }

        word = word.replace(/[.?!]/g, " ").trim();

        // If the word is empty/null/undefined, ignore it
        if (!word) {
            return [];
        }

        // Else, word is good, but check if replacement caused word to need further splitting
        const wordChain = [];
        const splitWord = word.split(" ");
        if (splitWord.length == 1) {
            // Only one word, all is good, add to list
            wordChain.push(word);
        }
        else if (splitWord.length > 1) {
            // More than one word, reprocess and then add to list
            for (let splitWordWord of splitWord) {
                const reprocessedWords = processWord(splitWordWord);
                for (reprocessedWord of reprocessedWords) {
                    wordChain.push(reprocessedWord);
                }
            }
        }

        // If word was at the end of a sentence, add a break after it in the chain
        if (sentenceEnder) {
            wordChain.push(null);
        }

        return wordChain;
    }
    else {
        // Trim any attached punctuation
        const trailingPunctuationStart = /^[,]+/;
        const trailingPunctuationEnd = /[,]+$/;

        word = word.replace(trailingPunctuationStart, "").replace(trailingPunctuationEnd, "");

        return [word];
    }
}

function breakDownString(string) {
    let messageWordChain = [];

    // Return early if empty string passed in
    if (!string) {
        return messageWordChain;
    }

    // Split the word by spaces for processing
    for (let word of string.split(" ")) {
        const processedWords = processWord(word);

        for (let processedWord of processedWords) {
            messageWordChain.push(processedWord);
        }
    }

    return messageWordChain;
}

function addMessageToShitpostWordDictionary(wordDictionary, messageWordChain) {
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

    return wordDictionary;
}

async function updateShitpostDictionary(channelId, messageBatch) {
    // Read word dictionary from file
    let wordDictionary = await getShitpostWordDictionary();

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
        const messageWordChain = breakDownString(message.content);

        wordDictionary = addMessageToShitpostWordDictionary(wordDictionary, messageWordChain);
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

    // Save word dictionary
    await saveShitpostWordDictionary(wordDictionary);

    return wordDictionary;
}

async function createWeightedShitpostDictionary(wordDictionary) {
    // Read word dictionary from blob if missing
    if (!wordDictionary) {
        wordDictionary = await getShitpostWordDictionary();
    }

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

function generateShitpostSentence(client, weightedDictionary) {
    // Begin constructing the sentence
    let sentence = "";
    let wordsAdded = 0;

    // Determine a random length for the sentence
    const sentenceLength = (Math.random() * client.config.shitpost.maxSentenceLength) + 1;

    // Loop until sentence length has been met
    let previousWord = null;
    while (wordsAdded < sentenceLength) {
        // Run a random check to see if the previous words followups will be ignored
        const ignoreFollowups = Math.random() < client.config.shitpost.atypicalFollowUpChance;

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
        if (Math.random() < 0.04) {
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

async function generateShitpostTextMessage(client, channel) {
    // Fetch the most recent 100 messages from the channel
    const previousMessages = await channel.messages.fetch({ limit: 100 });

    // Update the dictionary with this batch of messages
    const wordDictionary = await updateShitpostDictionary(channel.id, previousMessages);

    // Get a version of the dictionary with correctly weighted chances
    const weightedDictionary = await createWeightedShitpostDictionary(wordDictionary);

    // Determine the number of sentences to write
    const sentenceCount = (Math.random() * client.config.shitpost.maxSentenceCount) + 1;
    const sentenceList = [];

    for (let sentenceNumber = 1; sentenceNumber <= sentenceCount; sentenceNumber++) {
        const sentence = generateShitpostSentence(client, weightedDictionary);

        // Add the sentence to the list
        sentenceList.push(sentence);
    }

    // Construct the message from the sentence list
    const joinedSentences = sentenceList.join(" ");

    return joinedSentences;
}

async function updateReactionImageLibrary(client, messageBatch) {
    // Run through the message batch
    for (let [_, message] of messageBatch) {
        // Ignore message if written by a bot
        if (message.author.bot) {
            continue;
        }

        // If random chance failed, ignore
        if (Math.random() >= client.config.shitpost.savePostedImageChance) {
            continue;
        }

        // Handle attachments if they are present
        if (message.attachments && message.attachments.size) {
            // Get first image file from message
            const attachmentToSave = message.attachments.values().next().value

            // If image is spoilered, ignore it
            if (attachmentToSave.spoiler) {
                continue;
            }

            const { name, url } = attachmentToSave;
            const extension = path.extname(name).replace(".", "");

            // Check it's an allowed image
            if (client.config.shitpost.allowedImageFileTypes.indexOf(extension) === -1) {
                continue;
            }

            // Get file from Discord URL
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            });
            const { status, data } = response;

            if (status !== 200) {
                continue;
            }

            // Upload to blob storage
            const root = client.config.shitpost.reactionImagePath;
            const success = await writeBlobFile(`${root.endsWith("/") ? root : `${root}/`}saved/${message.id}_${name}`, data);
            if (!success) throw "writeBlobFile returned useuccessful status";

            // TODO: Logs
        }
        // Handle embeds if they are present
        else if (message.embeds && message.embeds.length) {
            // Get first image file from message
            const embedToSave = message.embeds[0];

            // TODO: Check if Tenor, and if so, scrape gif off of page
        }
    }
}

async function selectRandomReactionImageUrl(client) {
    const blobs = await getListOfFiles(client.config.shitpost.reactionImagePath);
    const index = randomBetween(0, blobs.length);
    const selectedBlob = blobs[index];

    var url = getFileUrl(selectedBlob.name);
    return url;
}

async function generateShitpostImageMessage(client, channel) {
    // Loop through recently posted images, and update library
    const previousMessages = await channel.messages.fetch({ limit: 100 });
    await updateReactionImageLibrary(client, previousMessages);

    // Select a random image from blob storage
    const url = await selectRandomReactionImageUrl(client);

    return url;
}

module.exports = {
    getShitpostWordDictionary,
    updateShitpostDictionary,
    breakDownString,
    addMessageToShitpostWordDictionary,
    createWeightedShitpostDictionary,
    generateShitpostSentence,
    generateShitpostTextMessage,
    generateShitpostImageMessage
};