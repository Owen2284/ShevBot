//https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot 

var Discord = require("discord.js");

var bot = new Discord.Client();

bot.on("message", function(message)
{
	var input = message.content.toUpperCase();
	if(input === "HELLO") 
	{
		bot.reply(message, "Hello World!");
	}
	if(input === "!PING") 
	{
		bot.sendMessage(message, "Pong!");
	}
	if(input === "PING") 
	{
		bot.sendMessage(message, "Plurb");
	}
	if(input === "ENCHILADA") 
	{
		bot.sendMessage(message, "ENCHILADA");
	}
	if(input === "!HELP") 
	{
		bot.sendMessage(message, "www.downloadmoreram.com");
	}
});

bot.loginWithToken("MjEwNTIyNjI1NTU2ODczMjE2.CoQAAQ.i_cUZdvpeSiM5AYGgSEaFIqYkgQ");