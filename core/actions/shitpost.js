const fs = require("fs");
const { readFile } = require("./../utilities/file");

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

module.exports = {
    getShitpostWordDictionary
};