const fs = require("fs");
const { readFile, writeFile } = require("./../utilities/file");

function getShitpostWordDictionary() {
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

    return wordDictionary;
}

function saveShitpostWordDictionary(wordDictionary) {
    // Save the dictionary to a file
    try {
        writeFile("data/dictionary.json", JSON.stringify(wordDictionary));
    }
    catch (e) {
        error(e);
    }
}

function updateShitpostDictionary(channelId, messageBatch) {
    // Read word dictionary from file
    const wordDictionary = getShitpostWordDictionary();

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

    // Save word dictionary
    saveShitpostWordDictionary(wordDictionary);
}

function createWeightedShitpostDictionary() {
    // Read word dictionary from file
    const wordDictionary = getShitpostWordDictionary();

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

async function generateShitpostMessage(client, channel) {
    // Fetch the most recent 100 messages from the channel
    const previousMessages = await channel.messages.fetch({ limit: 100 });

    // Update the dictionary with this batch of messages
    updateShitpostDictionary(channel.id, previousMessages);

    // Get a version of the dictionary with correctly weighted chances
    const weightedDictionary = createWeightedShitpostDictionary();

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

module.exports = {
    getShitpostWordDictionary,
    generateShitpostMessage
};