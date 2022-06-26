Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
const event = async function(bot, f, mongo, interaction) {
    if (!interaction.isCommand()) return;
    const command1 = f.commands.filter((command)=>interaction.commandName === command.slash.name
    )[0];
    if (!command1) return;
    const args = interaction.options.data;
    const { ephemeral  } = command1;
    //   await interaction.deferReply({
    //     ephemeral,
    //   });
    await interaction.reply({
        content: 'Загружаю вашу команду!'
    });
    command1.execute(bot, f, mongo, args, interaction);
};
var _default = event;
exports.default = _default;
