//https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot 

var Discord = require("discord.js");

var bot = new Discord.Client();

bot.on("message", function(message)
{

	var allowLooping = false;

	var sender = message.author;
	var input = message.content.toUpperCase();
	
	if(!sender.bot || allowLooping) {
		if(input === "HELLO") 
		{
			bot.reply(message, "Hello World!");
		}
		if(input === "!PING") 
		{
			bot.sendMessage(message, "Pong!");
		}
		if(input === "ENCHILADA") 
		{
			bot.sendMessage(message, "ENCHILADA");
		}
		if(input === "!HELP") 
		{
			bot.sendMessage(message, "www.downloadmoreram.com");
		}
	}else if(sender != bot.user) {
		bot.reply(message, "Hello fellow bot!");
	}

});

bot.loginWithToken("MjEwNTIyNjI1NTU2ODczMjE2.CoQAAQ.i_cUZdvpeSiM5AYGgSEaFIqYkgQ");