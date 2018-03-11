const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["MEME"],
	params: "<term>",
	description: "Find the zestiest memes for the search term provided.",
	examples: ["MEME \"Damn Daniel\""],
	order: -1,
	active: true,
	complete: true,
	visible: true,
	guild: true,
	pm: true,
	deleteCall: false,
	minArgs: 1,
	botPermissions: [],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		var searchTerm = manifest.message.raw.substring(6).replace(/ /g, "+");
		say("send", manifest.message.message, "Here's what I found for the meme \"" + searchTerm + "\", fam : https://www.google.co.uk/#q=" + searchTerm + "+meme");
	}
}