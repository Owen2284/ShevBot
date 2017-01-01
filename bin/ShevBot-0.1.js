/* 

ShevBot.js
Created on 3rd August 2016

Current Version: v0.1

Backend for my Discord bot, ShevBot.

https://discordapp.com/oauth2/authorize?client_id=210522625556873216&scope=bot

*/

var Discord = require("discord.js");

var bot = new Discord.Client();

var DEBUG = false;
var allowLooping = false;

var swears = [
	"FUCK", 
	"SHIT",
	"CUNT", 
	"DICK", 
	"TWAT", 
	"ARSE"
];
var swearCounter = 0;

bot.on("message", function(message) {

	var sender = message.author;
	var raw = message.content;
	var input = raw.toUpperCase();
	var isCommand = input.substring(0, 1) === "!";	
	var command = input.split(" "); command[0] = command[0].replace("!", "");
	
	if(!sender.bot || allowLooping) {

		// Chat evaluations.
		if (!isCommand) {

			// Matching evaluations.
			if(input === "HELLO") {
				bot.reply(message, "Hello!");
			}

			// Detection evaluations.
			if(input.includes("PING")) {
				bot.sendMessage(message, "Pong!");
			}
			if(input.includes("PONG")) {
				bot.sendMessage(message, "Ping!");
			}
			if(input.includes("ENCHILADA")) {
				bot.sendMessage(message, "ENCHILADA");
			}
			if(input.includes("WATERMELON")) {
				bot.sendMessage(message, "Praise be to the Watermelon.");
			}
			if(input.includes("HANZO")) {
				var randNum = Math.floor((Math.random() * 2) + 1);
				if(randNum == 1) {bot.sendMessage(message, "Oh Hanzo is a class.");}
				else if(randNum == 2) {bot.sendMessage(message, "RYUU GA WAGA TEKI GO FUCK YOURSELF");}
			}
			if(input.includes("BASTION")) {
				bot.sendMessage(message, "NO FUN ALLOWED.");
			}
			if(input.includes("JUNKRAT")) {
				var randNum = Math.floor((Math.random() * 5) + 1);
				if(randNum == 1) {bot.sendMessage(message, "He can be your waifu!");}
				else if(randNum == 2) {bot.sendMessage(message, "This motherfucker can jump like MJ.");}
				else if(randNum == 3) {bot.sendMessage(message, "5 grenades? No no no no no, make that 6.");}
				else if(randNum == 4) {bot.sendMessage(message, "Give into the madness. Become a junk person.");}
				else if(randNum == 5) {bot.sendMessage(message, "Just pick Junkrat! Just pick him, he's the best hero IN THE GAME.");}
			}
			if(input.includes("REINHARDT")) {
				var randNum = Math.floor((Math.random() * 4) + 1);
				if(randNum == 1) {bot.sendMessage(message, "Rein<3");}
				else if(randNum == 2) {bot.sendMessage(message, "I AM ON THE OBJECTIVE, JOIN ME IN GLORY!");}
				else if(randNum == 3) {bot.sendMessage(message, "UNACCEPTABLE. HAMMER DOWN!");}
				else if(randNum == 4) {bot.sendMessage(message, "HELLO THERE! REINHARDT, AT YOUR SERVICE.");}
			}
			if(input.includes("MEI")) {
				var randNum = Math.floor((Math.random() * 3) + 1);
				if(randNum == 1) {bot.sendMessage(message, "Mei is bae.");}
				else if(randNum == 2) {bot.sendMessage(message, "Mei is not bae.");}
				else if(randNum == 3) {bot.sendMessage(message, "Did you mean: 'Satan'?");}
			}
			if(input.includes("MCCREE")) {
				var randNum = Math.floor((Math.random() * 4) + 1);
				if(randNum == 1) {bot.sendMessage(message, "It's high noon.");}
				else if(randNum == 2) {bot.sendMessage(message, "HIGH NOON.");}
				else if(randNum == 3) {bot.sendMessage(message, "Well, it's high noon somewhere.");}
				else if(randNum == 4) {bot.sendMessage(message, "DRAW!");}
			}
			if(input.includes("PHARAH")) {
				var randNum = Math.floor((Math.random() * 4) + 1);
				if(randNum == 1) {bot.sendMessage(message, "Justice rains from above!");}
				else if(randNum == 2) {bot.sendMessage(message, "Justice rai-AH.");}
				else if(randNum == 3) {bot.sendMessage(message, "Justice r-HEUUUGH.");}
				else if(randNum == 4) {bot.sendMessage(message, "Rocket barrage incoming!");}
			}
			if(input.includes("MERCY")) {
				var randNum = Math.floor((Math.random() * 4) + 1);
				if(randNum == 1) {bot.sendMessage(message, "Mercy on call!");}
				else if(randNum == 2) {bot.sendMessage(message, "Heroes never die!");}
				else if(randNum == 3) {bot.sendMessage(message, "Heroes never die... for a price.");}
				else if(randNum == 4) {bot.sendMessage(message, "HELP ME.");}
			}
			if(input.includes("LUCIO")) {
				var randNum = Math.floor((Math.random() * 5) + 1);
				if(randNum == 1) {bot.sendMessage(message, "Oh let's break it down!");}
				else if(randNum == 2) {bot.sendMessage(message, "Let's drop the beat!");}
				else if(randNum == 3) {bot.sendMessage(message, "Yeah, amp it up!");}
				else if(randNum == 4) {bot.sendMessage(message, "Oh, look at this team");}
				else if(randNum == 5) {bot.sendMessage(message, "Just pick Junkrat! Just pick him, he's the best hero IN THE GAME.");}
			}
			if(input.includes("WIDOWMAKER")) {
				var randNum = Math.floor((Math.random() * 5) + 1);
				if(randNum == 1) {bot.sendMessage(message, "He can be your waifu!");}
				else if(randNum == 2) {bot.sendMessage(message, "This motherfucker can jump like MJ.");}
				else if(randNum == 3) {bot.sendMessage(message, "5 grenades? No no no no no, make that 6.");}
				else if(randNum == 4) {bot.sendMessage(message, "Give into the madness. Become a junk person.");}
				else if(randNum == 5) {bot.sendMessage(message, "Just pick Junkrat! Just pick him, he's the best hero IN THE GAME.");}
			}
			if(input.includes("MARCUS")) {
				bot.sendMessage(message, "B-b-b-b-b-b-b-b-b-b-b-b-but Marcus!");
			}
			if(input.includes("DAT BOI")) {
				bot.sendMessage(message, "Oh shit whaddup!");
			}
			if(input.includes("ROY")) {
				bot.sendMessage(message, "Roy's my Boy!");
			}
			if(input.includes("JOHN CENA")) {
				bot.sendMessage(message, "DOOT DOOT-DOOT DOOT");
			}
			if(input.includes("SONIC") || input.includes("SANIC")) {
				var randNum = Math.floor((Math.random() * 4) + 1);
				if(randNum == 1) {bot.sendMessage(message, "I must proceed at a fast velocity.");}
				else if(randNum == 2) {bot.sendMessage(message, "My velocity is determined by acceleration over time.");}
				else if(randNum == 3) {bot.sendMessage(message, "GOTTAM GOED FSAT.");}
				else if(randNum == 4) {bot.sendMessage(message, "https://www.youtube.com/watch?v=hU7EHKFNMQg");}
			}
			if(input.includes("9/11")) {
				var randNum = Math.floor((Math.random() * 2) + 1);
				if(randNum == 1) {bot.sendMessage(message, "9/11 was an inside job!");}
				else if(randNum == 2) {bot.sendMessage(message, "7/11 was a part time job!");}
			}
			if(input.includes("JET FUEL") || input.includes("STEEL BEAM")) {
				var randNum = Math.floor((Math.random() * 4) + 1);
				if(randNum == 1) {bot.sendMessage(message, "JET FUEL CAN'T MELT STEEL BEAMS.");}
				else if(randNum == 2) {bot.sendMessage(message, "JET FUEL CAN'T MELT DANK MEMES.");}
				else if(randNum == 3) {bot.sendMessage(message, "https://www.youtube.com/watch?v=xsTyjVnZBww");}
				else if(randNum == 4) {bot.sendMessage(message, "ICEBERGS CAN'T CUT STEEL HULLS.");}
			}
			if(input.includes("NERO")) {
				bot.sendMessage(message, "Oh Brother NEEEEROOOOOO.");
			}
			if(input.includes("BOAT")) {
				bot.sendMessage(message, "IT'S A DILAPIDATED BOAT.");
			}
			if(input.includes("BENJAMIN")) {
				bot.sendMessage(message, "Senor Benjamin!");
			}
			if(input.includes("TRUMP")) {
				bot.sendMessage(message, "CAN'T STUMP THE TRUMP.");
			}
			if(input.includes("MARK")) {
				bot.reply(message, "Oh hi, Mark.");
			}

			// Swearing evaluator.
			var swearDetected = false;
			for(i = 0; i < swears.length; i++) {
				if(input.includes(swears[i])){
					swearDetected = true;
				}
			}
			if(swearDetected) {
				for(i = 0; i < swears.length; i++) {
					swearCounter = swearCounter + (input.match("/swears[i]/g") || []).length;
				}
				bot.sendMessage(message, "Current swear counter: " + swearCounter);
			}
		}		

		// Command evaluations.
		else{
			switch(command[0]) {
				case "HELP":
					bot.sendMessage(message, "!date \t\t\t\t- Display the date.\n!time - \t\t\t\tDisplay the time.\n!search <arg> \t- Search the web for the argument provided.\n!meme <arg> \t- Find the freshest memes for the argument provided.\n!toggle <arg> \t- Change values inside ShevBot.");
					break;
				case "TOGGLE":
					if(command[1] === "LOOP") {
						if(!allowLooping) {bot.sendMessage(message, "You know not what you have done.");}
						allowLooping = !allowLooping;
					}
					break;
				case "TEST":
					bot.sendMessage(message, "Test successful!");
					break;
				case "TIME":
					var d = new Date();
					bot.sendMessage(message, "The time is " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ".");
					break;
				case "DATE":
					var d = new Date();
					bot.sendMessage(message, "The date is " + d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear() + ".");
					break;
				case "MEME":
					if(command.length > 1) {
						var searchTerm = raw.substring(6).replace(/ /g, "+");
						bot.sendMessage(message, "Here's what I found for the meme '" + searchTerm + "', fam : https://www.google.co.uk/#q=" + searchTerm + "+meme");
					} else {
						bot.sendMessage(message, "Please specify a search term.");
					}
					break;
				case "SEARCH":
					if(command.length > 1) {
						var searchTerm = raw.substring(8).replace(/ /g, "+");
						bot.sendMessage(message, "https://www.google.co.uk/#q=" + searchTerm);
					} else {
						bot.sendMessage(message, "Please specify a search term.");
					}
					break;
				default:
					bot.sendMessage(message, "Unrecognised command.");
					break;
			}

		}

	}else if(sender != bot.user) {bot.reply(message, "Hello fellow bot!");}

});

bot.on("ready", () => {
	for (i = 0; i < bot.channels.length; i++) {
		bot.sendMessage(bot.channels[i], "Hi everyone, ShevBot at your service!");
	}
});

bot.on("error", () => {
	for (i = 0; i < bot.channels.length; i++) {
		bot.sendMessage(bot.channels[i], "ShevBot has encountered an error.");
	}
});

bot.loginWithToken("MjEwNTIyNjI1NTU2ODczMjE2.CoQAAQ.i_cUZdvpeSiM5AYGgSEaFIqYkgQ");