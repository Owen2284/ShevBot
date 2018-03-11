const Tools = require("./../../tools.js");

const say = Tools.comms.say;

module.exports = {
	aliases: ["REDDIT"],
	params: "<subreddit name> [\"hot\", \"new\", \"top\"]",
	description: "Fetches the top 5 posts of the specified subreddit, based on the given category.",
	examples: ["REDDIT RimWorld top","REDDIT anime new","REDDIT me_irl hot"],
	order: -1,
	active: true,
	complete: true,
	visible: true,
	guild: true,
	pm: true,
	deleteCall: false,
	minArgs: 2,
	botPermissions: [],
	userPermissions: [],
	packages: ["request"],
	process: function(bot, manifest, data, settings, details, commands) {
		const message = manifest.message.message;
		var subreddit = input[1].toLowerCase();
		var category = input[2].toLowerCase();
		var range = "all";
		var limit = 5;
		if (["hot", "top", "new"].indexOf(category) > -1) {
			var response = Tools.commands.sayRedditData(subreddit, category, range, limit, message);
		} else {
			say("send", message, "Sorry, \"" + category + "\" is not a valid category.");
		}
	}
}