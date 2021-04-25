const fs = require("fs");
const path = require("path");

module.exports = {
	name: "VOICE",
	description: "Operates ShevBot's voice capabilities.",
	args: [
		{
			name: "action",
			description: "The action to take",
			required: true,
			values: ["join", "speak", "switch", "leave"]
		}
	],
	examples: ["VOICE join \"Voice Channel Name\"","VOICE speak","VOICE leave"],
	order: 1,
	active: false,
	channelTypes: ["text"],
	permissions: [],
	process: function(args, client, message) {
		// const message = manifest.message.message;
		// const input = manifest.command.full;
		// switch(input[1].toUpperCase()) {
		// 	case "JOIN":
		// 		if (bot.voice.connections.array().length == 0) {
		// 			if (input.length > 2) {
		// 				var targetChannelRaw = manifest.message.raw.substring(1 + input[0].length + 1 + input[1].length + 1);
		// 				var targetChannelUpp = targetChannelRaw.toUpperCase();
		// 				var channelsChannels = manifest.channel.guild.channels.cache.array();
		// 				var joined = false;
		// 				var joinedName = "general";
		// 				for (chch = 0; chch < channelsChannels.length; chch++) {
		// 					checkChannel = channelsChannels[chch];
		// 					var theNameOfThis = checkChannel.name.toUpperCase();
		// 					if (theNameOfThis === targetChannelUpp && checkChannel.constructor.name === "VoiceChannel") {
		// 						joinedName = checkChannel.name;
		// 						checkChannel.join();
		// 						joined = true;
		// 						break;
		// 					}
		// 				}
		// 				if (joined) {
		// 					cmd("voice", "Joined voice channel \"" + joinedName + "\".");
		// 					say("send", message, "Okay, I'll speak on the voice channel \"" + joinedName + "\"!");
		// 				} else {
		// 					say("send", message, "Sorry, I couldn't find a voice channel called \"" + targetChannelRaw + "\" on this server...");
		// 				}
		// 			} else {
		// 				say("send", message, "Please enter a voice channel on this server after \"" + details.commandCharacter + "VOICE JOIN\".");
		// 			} 
		// 		} else if (bot.voice.connections.array().length == 1) {
		// 			say("send", message, "Sorry, I'm already speaking on \"" + bot.voice.connections.array()[0].channel.name + "\".");
		// 		} else {
		// 			cmd("voice", "ShevBot is currently on > 1 voice channel. This is bad.");
		// 		} break;
		// 	case "SWITCH":
		// 		say("send", message, "Sorry, I haven't had that command programmed in yet!");
		// 	case "LEAVE":
		// 		if (bot.voice.connections.array().length == 1) {
		// 			if (settings.currentStreamDispatcher != null) {settings.currentStreamDispatcher.end(); settings.currentStreamDispatcher == null;}
		// 			var currentChannel = bot.voice.connections.array()[0].channel;
		// 			currentChannel.leave();
		// 			cmd("voice", "Left voice channel \"" + currentChannel.name + "\".");
		// 			say("send", message, "I have stopped taking on the voice channel \"" + currentChannel.name + "\".");
		// 		} else if(bot.voice.connections.array().length == 0) {
		// 			say("send", message, "Sorry, I'm not speaking on a voice channel at the moment.");
		// 		} else {
		// 			cmd("whoops", "ShevBot is currently on > 1 voice channel. This is bad.");
		// 		} break;
		// 	case "SPEAK":
		// 		if (bot.voice.connections.array().length == 1) {
		// 			var currentConnection = bot.voice.connections.array()[0];
		// 			var soundFileNames = fs.readdirSync(details.soundDir);
		// 			var soundToPlay = soundFileNames[Math.floor((Math.random() * soundFileNames.length))];
		// 			var soundToPlayAbsolutePath = path.join(__dirname, details.soundDir + soundToPlay);
		// 			if (settings.currentStreamDispatcher != null) {settings.currentStreamDispatcher.end(); settings.currentStreamDispatcher == null;}
		// 			settings.currentStreamDispatcher = currentConnection.play(soundToPlayAbsolutePath, {volume: "0.25" });
		// 			cmd("voice", "Playing \"" + soundToPlay + "\"");
		// 		} else if(bot.voice.connections.array().length == 0) {
		// 			say("send", message, "Sorry, I'm not speaking on a voice channel at the moment.");
		// 		} else {
		// 			cmd("whoops", "ShevBot is attempting to speak on more than one channel. Stopping speak request.");
		// 		} break;
		// 	default:
		// 		say("send", message, "The " + details.commandCharacter + "voice command needs another argument after it, such as \"join\"  or \"leave\".");
		// 		break;
		// }
	}
}
