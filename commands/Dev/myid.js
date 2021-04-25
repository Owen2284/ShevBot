module.exports = {
	name: "MYID",
	description: "Displays your personal Discord ID.",
	args: null,
	examples: ["MYID"],
	order: 1,
	active: true,
	channelTypes: ["dm"],
	permissions: [],
	process: async function(args, client, message) {
		if (!message.author.dmChannel) {
			dmchannel = await message.author.createDM();
		}
		message.author.dmChannel.send("Your ID is \"" + message.author.id + "\".");
	}
}
