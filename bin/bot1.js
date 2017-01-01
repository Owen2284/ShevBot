//https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot 

var Discord = require("discord.js");

var bot = new Discord.Client();

bot.on("message", function(message)
{
	if(message.content === "Hello") 
	{
		bot.reply(message, "HELLO WORLD");
	}
});

bot.loginWithToken("MjEwNTIyNjI1NTU2ODczMjE2.CoQAAQ.i_cUZdvpeSiM5AYGgSEaFIqYkgQ");