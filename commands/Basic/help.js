module.exports = {
	name: "HELP",
	description: "Displays all comands and their usage. If a specific command is provided, then more details will be provided for that command",
	args: [
		{ 
			name: "command",
			description: "The command to give more detail on",
			required: false
		}
	],
	examples: ["HELP", "HELP GAME TOPIC"],
	order: 1,
	active: true,
	channelTypes: ["dm", "text"],
	permissions: [],
	process: function(args, client, message) {
		
		// Get the string from the Tools function
		if (manifest.command.numArgs > 0) {
			for (var i in manifest.command.args) {
				// Get the string
				var commandHelpString = Tools.commands.getSpecificHelpString(commands, manifest.command.args[i], details.commandCharacter, false);

				// Send the string
				if (commandHelpString < 2000) {
					say("say", manifest.message.message, commandHelpString);
				} else {
					say("say", manifest.message.message, commandHelpString.substring(0,2000));
				}
			}
		} else {
			// Get the string
			var fullHelpString = Tools.commands.getFullHelpString(commands, manifest.author.author, details.commandCharacter);

			// Send the string
			if (fullHelpString < 2000) {
				say("pm", manifest.message.message, fullHelpString);
			} else {
				say("pm", manifest.message.message, fullHelpString.substring(0,2000));
			}
		}
	}
}