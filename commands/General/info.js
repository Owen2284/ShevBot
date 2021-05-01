module.exports = {
	name: "INFO",
	description: "Find out detailed info about ShevBot.",
	args: null,
	examples: ["INFO"],
	order: 2,
	active: true,
	channelTypes: ["dm", "text"],
	permissions: [],
	process: function(args, client, message) {
		var info = "Hi, I'm ShevBot!\n";
		info += "I'm a bot capable of running helpful commands, parsing and responding to messages, and more!\n\n";
		
		info += "To see a full list of the commands I understand, simply type \"" + client.config.bot.commandCharacter + "HELP\".\n";
		info += "More details about me available at: " + client.config.bot.websiteUrl + ".\n\n";

		info += "Looking forward to getting to know you!";

		message.channel.send(info);
	}
}