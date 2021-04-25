module.exports = {
	name: "YOUTUBEDL",
	description: "Downloads a given YouTube video",
	args: [
		{
			name: "video",
			description: "Either the ID or the link to the video you want to download.",
			required: true
		}
	],
	examples: ["YOUTUBEDL"],
	order: 1,
	active: false,
	channelTypes: ["dm", "text"],
	permissions: [],
	process: function(args, client, message) {
		// TODO: Rework to be a youtube download command
	}
}