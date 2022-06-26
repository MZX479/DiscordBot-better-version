var swcHelpers = require("@swc/helpers");
var _discordJs = require("discord.js");
var _mongodb = require("mongodb");
var fs = swcHelpers.interopRequireWildcard(require("fs"));
var _tokenJson = require("./config/token.json");
var _modules = swcHelpers.interopRequireDefault(require("./config/modules"));
var _rest = require("@discordjs/rest");
var _v9 = require("discord-api-types/v9");
const bot = new _discordJs.Client({
    intents: Object.values(_discordJs.Intents.FLAGS)
});
_mongodb.MongoClient.connect('mongodb://localhost:27017', (err, mongo)=>{
    fs.readdir('./events', async (err, events_dir)=>{
        for (let event_file of events_dir){
            if (!event_file.endsWith('.js')) continue;
            let event_func = require('./events/' + event_file).default;
            let event_name = event_file.split(' ')[0].replace('.js', '');
            bot.on(event_name, event_func.bind(null, bot, _modules.default, mongo));
        }
    });
});
fs.readdir('./commands', async (err, commands_dir)=>{
    for (let command_file of commands_dir){
        if (!command_file.endsWith('.js')) continue;
        let { command  } = await Promise.resolve(`${'./commands/' + command_file}`).then(function(s) {
            return swcHelpers.interopRequireWildcard(require(s));
        });
        const Command = command;
        _modules.default.commands.push(Command);
    }
    let rest = new _rest.REST({
        version: '9'
    }).setToken(_tokenJson.token);
    try {
        console.log('Started loading /-commands');
        await rest.put(_v9.Routes.applicationGuildCommands('988734745393389590', '827620881529307217'), {
            body: _modules.default.commands.map((command)=>command.slash
            )
        });
        console.log('Succesfully loaded /-commands');
    } catch (error) {
        console.log('Error while loading commands');
        console.log(error);
    }
});
bot.login(_tokenJson.token);
