module.exports = {
	name: "HELP",
	description: "Displays all comands and their usage. If a specific command is provided, then more details will be provided for that command",
	args: [
		{ 
			name: "commands",
			description: "The command(s) to give more detail on",
			required: false
		}
	],
	examples: ["HELP", "HELP GAME TOPIC"],
	order: 1,
	active: true,
	channelTypes: ["dm", "text"],
	permissions: [],
	process: async function(args, client, message) {
		let helpMessage = `Hi ${message.author.username}! `;

		if (args.length === 0) {
			helpMessage += "Here are all of my commands!\n\n";

			// Loop through all commands
			for (let command of client.commands) {
				let argString = "";
				if (command.args) {
					for (let arg of command.args) {
						argString += `<${arg.name.toUpperCase()}>`
					}
				}

				helpMessage += `**${client.config.bot.commandCharacter}${command.name}** ${argString}\n`;
				helpMessage += `${command.description}\n\n`;
			}
		}
		else {
			// Try and find the commands in the args
			const requestedCommands = [];
			for (let arg of args) {
				for (let command of client.commands) {
					if (arg.toUpperCase() === command.name.toUpperCase()) {
						// TODO: Prevent duplicates
						requestedCommands.push(command);
						break;
					}
				}
			}

			// Return here if no commands found
			if (requestedCommands.length === 0) {
				message.author.dmChannel.send("Sorry, but I couldn't find any of the commands you requested help about!");
				return;
			}

			helpMessage += "Here are the details of the command(s) you asked about!\n\n";

			// Create message with the found commands
			for (let command of requestedCommands) {
				let argString = "";
				if (command.args) {
					for (let arg of command.args) {
						argString += `<${arg.name.toUpperCase()}>`
					}
				}

				let exampleString = "";
				for (let example of command.examples) {
					exampleString += `\t${example}\n`
				}

				let channelTypesString = "";
				for (let channelType of command.channelTypes) {
					switch (channelType) {
						case "dm":
							channelTypesString += "Direct messages, ";
							break;
						case "text":
							channelTypesString += "Server text channels, ";
							break;
					}
				}
				if (channelTypesString.endsWith(", ")) {
					channelTypesString = channelTypesString.substring(0, channelTypesString.length - 2);
				}

				helpMessage += `**${client.config.bot.commandCharacter}${command.name}** ${argString}\n`;
				helpMessage += `${command.description}\n\n`;

				helpMessage += `Examples:\n${exampleString}\n`

				helpMessage += `Usable in: ${channelTypesString}\n\n`;
			}
		}

		if (helpMessage.endsWith("\n")) {
			helpMessage = helpMessage.substring(0, helpMessage.length - 2);
		}

		if (!message.author.dmChannel) {
			dmchannel = await message.author.createDM();
		}
		message.author.dmChannel.send(helpMessage);
	}
}