Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
const event = async (bot, f, mongo, message)=>{
    if (message.author.bot || message.channel.type != 'GUILD_TEXT') return;
    if (!message.content.startsWith(f.config.prefix)) return;
    let args = message.content.split(' ');
    let command_name = args[0].replace(f.config.prefix, '');
    args.splice(0, 1);
    console.log(f.commands);
    let command1 = f.commands.filter((command)=>command.slash.name.split(' ').includes(command_name)
    );
    let command_func = command1.first();
    if (!command_func) return;
    await message.delete();
    command_func.execute(bot, f, mongo, args, message);
};
var _default = event;
exports.default = _default;
