var Discord = require("discord.io");
var request = require("request");
var logger = require("winston");

var conf = require("./conf.json");
var auth = require("./auth.json");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});
logger.level = "debug";


// Initialize Discord Bot
var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});


bot.on("ready", function (evt) {
	this.setPresence({ game: { name: "with itself" } });
	logger.info("Connected");
	logger.info("Logged in as: ");
	logger.info(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function (user, userID, channelID, message, evt) {
	// Our bot needs to know if it needs to execute a command
	// for this script it will listen for messages that will start with `!`
	if (message.substring(0, 1) == "!") {
		var args = message.substring(1).split(" ");
		var cmd = args[0];

		args = args.splice(1);

		switch(cmd) {
			// !ping
			case "strider":
				var victim = conf["victim"];
				var msg = makeInsult(victim);
				bot.sendMessage({ to: channelID, message: msg });
			break;
			case "mfoxdogg":
				bot.sendMessage({ to: channelID, message: "M :fox: :dog:" });
			break;
			case "lutris":
				if(args.length > 0)
					searchLutris(args);
				else
					bot.sendMessage({ to: channelID, message: "wat" });
			break;
// 			default:
// 				bot.sendMessage({ to: channelID, message: "Unknown command." });
		}
	}

	function searchLutris(args) {
		var qs = args.join("+");
		request.get({
			url: "https://lutris.net/api/games?search=" + qs,
			json: true
		},
		function(e, r, data) {
// 			logger.info("search data: " + JSON.stringify(data));
			var results = data["results"];
			var loops = (results.length > 10) ? 10 : results.length;
			var msg = "";
			if(loops == 0)
				msg = "Search returned 0 results";
			else {
				msg = "First " + loops + " on Lutris:\n```"
				for(var i = 0; i < loops; i++) {
					var row = results[i];
	// 				if(!row)
	// 					logger.info("i: " + i + " loops: " + loops);
	// 				logger.info("row: " + JSON.stringify(row));
					msg += (i + 1) + " - " + row["name"] + "\n";
				}
				msg += "```";
			}
			setTimeout(function() {
				bot.sendMessage({ to: channelID, message: msg });
			}, 0);
		});
	}

	function makeInsult(name) {
		var insults = [
			"@s eats too much cheese.",
			"what's that smell?!? oh, it's just @s...",
			"@s sucks!!1!",
			"@s farts!!1!",
			"@s rocks!!1! NOT",
			"@s is alright, i guess.",
			"hey @s, python sucks!",
			"@s has been snorting baby powder again.",
			"no one cares if you're gay, straight, non-binary, or whatever... but little kids, @s, really? little kids?",
			"@s loves LAMP!",
			"@s @s @s",
			"stop with the dickpics already @s"
		];

		var ins = insults.length;
		logger.info("ins: " + ins);
		var ind = Math.floor(Math.random() * ins);
		logger.info("ind: " + ind);
		var insult = insults[ind];
		var i = insult.replace(/@s/g, name);
		return i;
	}
});

bot.on("disconnect", function(errmsg, code) {
	logger.info("Disconnected: (" + code + ") " + errmsg);
});