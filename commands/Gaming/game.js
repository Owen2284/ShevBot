module.exports = {
	name: "GAME",
	description: "Stores a list of games that can be randomly selected for users to play.",
	args: [
		{ 
			name: "action",
			description: "The action to take",
			required: true,
			values: ["select", "view", "add", "remove", "clear"]
		},
		{
			name: "game",
			description: "The game to add/remove",
			required: false
		}
	],
	examples: ["GAME view","GAME select","GAME add \"Overwatch\""],
	order: 1,
	active: false,
	channelTypes: ["dm", "text"],
	permissions: [],
	process: function(args, client, message) {
		// TODO
	}
}