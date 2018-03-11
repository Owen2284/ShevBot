const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["SEARCH"],
	params: "<term>",
	description: "Searches the web for the search term provided.",
	examples: ["SEARCH \"twitter\"", "SEARCH \"amazon prime\""],
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
		var searchTerm = manifest.message.raw.substring(8).replace(/ /g, "+");
		say("send", manifest.message.message, "Here's what I found for \"" + searchTerm + "\" via Google : https://www.google.co.uk/#q=" + searchTerm);
	}
}