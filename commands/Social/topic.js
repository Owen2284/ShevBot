module.exports = {
	name: "TOPIC",
	description: "Sets a random topic for the current channel.",
	args: null,
	examples: ["TOPIC"],
	order: 1,
	active: false,
	channelTypes: ["text"],
	permissions: [],
	process: function(args, client, message) {
		// const Casual = require("casual");
		// const Moniker = require("moniker");
		
		// const message = manifest.message.message;
		// var topicString = "";
		// var randVal = Math.random() * 4;
		// if (randVal < 1) {
		// 	topicString = Casual.catch_phrase;
		// } else if (randVal < 2) {
		// 	topicString = Casual.full_name;
		// } else if (randVal < 3) {
		// 	var user = Tools.arrays.getRandomElement(Tools.discord.getAllGuildMembers(channel));;
		// 	var gen = Moniker.generator([Moniker.adjective, Moniker.noun]);
		// 	if (user.nickname != null) {
		// 		topicString = user.nickname;
		// 	} else {
		// 		topicString = user.user.username;
		// 	}
		// 	topicString += "'s " + gen.choose().replace(/-/g, " ");
		// } else {
		// 	var gen = Moniker.generator([Moniker.adjective, Moniker.adjective, Moniker.noun]);
		// 	topicString = gen.choose().replace(/-/g, " ");
		// 	topicString = topicString.substring(0,1).toUpperCase() + topicString.substring(1);
		// }
		// var endings = [" discussion.", ", agree or disagree?", " observations.", " fan club.", ", and how it effects you.", " debating.", " circlejerk.", " 101."]
		// var messageString = topicString + endings[Math.floor(Math.random() * endings.length)];
		// channel.setTopic(messageString);
	}
}