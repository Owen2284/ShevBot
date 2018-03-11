const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;

module.exports = {
	aliases: ["YOUTUBE"],
	params: "[\"search\", \"channel\"] <search term/channel ID>",
	description: "Runs a YouTube search for a provided search term or channel ID.",
	examples: ["YOUTUBE search \"Fidget Spinners\"","YOUTUBE channel UC9CuvdOVfMPvKCiwdGKL3cQ"],
	order: -1,
	active: true,
	complete: false,
	visible: true,
	guild: true,
	pm: true,
	deleteCall: false,
	minArgs: 2,
	botPermissions: [],
	userPermissions: [],
	packages: ["youtube-node"],
	process: function(bot, manifest, data, settings, details, commands) {
		const YouTube = require("youtube-node");
		const MAX_RESULTS = 3;
		const message = manifest.message.message;
		const input = manifest.command.full;
		var yt = new YouTube();
		yt.setKey("AIzaSyAyPKgiV79FI_VnMGwGLQtHjBWMy7c6Ots");
		if (input[1].toLowerCase() === "search") {
			yt.addParam("order", "relevance");
			yt.addParam("maxResults", MAX_RESULTS);
			yt.search(input[1], MAX_RESULTS, function(error, result) {
				if (error) {
					cmd("youtube", "Error occured:");
					console.log(error);
					say("send", message, "Could not find the channel \"" + input[2] + "\".");
				} else {
					var videos = result["items"];
					var response = "Top " + MAX_RESULTS + " search results for \"" + input[2] + "\":\n```Markdown\n";
					for (var i in videos) {
						var v = videos[i]["snippet"];
						response += (parseInt(i)+1) + " " + v["title"] + " (" + v["channelTitle"] + ")\n";
					}
					response += "```";
					say("send", message, response);
				}
			});
		} else if (input[1].toLowerCase() === "channel") {
			yt.addParam("channelId", input[2]);		// TODO: Get channel ID from channel name.
			yt.addParam("order", "date");
			yt.addParam("maxResults", MAX_RESULTS);
			yt.search("", MAX_RESULTS, function(error, result) {
				if (error) {
					cmd("youtube", "Error occured:");
					console.log(error);
					say("send", message, "Could not find the channel with the ID \"" + input[2] + "\".");
				} else {
					var videos = result["items"];
					var response = "Newest " + MAX_RESULTS + " videos from \"" + videos[0]["snippet"]["channelTitle"] + "\":\n```Markdown\n";
					for (var i in videos) {
						var v = videos[i]["snippet"];
						response += (parseInt(i)+1) + " " + v["title"] + "\n";
					}
					response += "```";
					say("send", message, response);
				}
			});
		} else {
			say("send", message, "Please specify whether you want a Youtube search or channel operation.")
		}
	}
}