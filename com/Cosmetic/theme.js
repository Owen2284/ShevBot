const Tools = require("./../../tools.js");

const say = Tools.comms.say;
const cmd = Tools.comms.cmd;
const pm = Tools.comms.pm;
const readJSON = Tools.fs.readJSON;
const writeJSON = Tools.fs.writeJSON;

module.exports = {
	aliases: ["THEME"],
	params: "<theme name>",
	description: "Lists ShevBot themes, or changes the theme when a theme's name is provided.",
	examples: ["THEME","THEME ShevBot","THEME DnDBot"],
	order: -1,
	active: true,
	complete: true,
	visible: true,
	guild: true,
	pm: false,
	deleteCall: false,
	minArgs: 0,
	botPermissions: ["CHANGE_NICKNAME"],
	userPermissions: [],
	packages: [],
	process: function(bot, manifest, data, settings, details, commands) {
		const message = manifest.message.message;
		// Change theme to specified theme.
		if (manifest.command.args.length >= 1) {
			var themeName = manifest.command.args[0];
			var found = false;
			for (var i in data.commands["THEME"]["availableThemes"]) {
				var themeObj = data.commands["THEME"]["availableThemes"][i];
				if (themeObj["name"].toUpperCase() === themeName.toUpperCase()) {
					if (data.commands["THEME"]["currentTheme"]["name"].toUpperCase() !== themeName.toUpperCase()) {
						data.commands["THEME"]["currentTheme"] = themeObj;
						Tools.commands.changeTheme(bot, data);
						writeJSON(details.dataDir + "commands.json", data.commands);
					}
					say("send", message, data.commands["THEME"]["currentTheme"]["change"]);
					found = true;
				}
			}
			if (!found) {say("send", message, "Sorry, but ShevBot has no \"" + themeName + "\" theme.");}
		} 
		// Displays a list of all themes.
		else {
			var themesString = "Available ShevBot themes: ";
			for (var i in data.commands["THEME"]["availableThemes"]) {
				if (i>0) {themesString += ", ";}
				var themeObj = data.commands["THEME"]["availableThemes"][i];
				themesString += themeObj.name;
			}
			themesString += ".";
			say("send", message, themesString);
		}
	}
}