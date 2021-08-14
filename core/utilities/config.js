function buildConfig() {
    return Object.freeze({
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
}

module.exports = {
    buildConfig
};