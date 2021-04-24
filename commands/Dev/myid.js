module.exports = {
	name: "MYID",
	description: "Displays your personal Discord ID.",
	args: null,
	examples: ["MYID"],
	order: 1,
	active: true,
	channelTypes: ["dm"],
	permissions: [],
	process: function(args, client, message) {
		say("reply", manifest.message.message, "your ID is \"" + manifest.author.author.id + "\".");
	}
}
