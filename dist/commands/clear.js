Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = void 0;
var _exports = require("../exports");
/*
SUB_COMMAND	1	
SUB_COMMAND_GROUP	2	
STRING	3	
INTEGER	4	Any integer between -2^53 and 2^53
BOOLEAN	5	
USER	6	
CHANNEL	7	Includes all channel types + categories
ROLE	8	
MENTIONABLE	9	Includes users and roles
NUMBER	10	Any double between -2^53 and 2^53
ATTACHMENT	11 
*/ const command = {
    slash: {
        name: 'clear',
        description: 'clear command',
        options: [
            {
                name: 'amount',
                description: 'amoont of messages to delete',
                type: 4,
                required: true
            }, 
        ]
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            class Clear extends _exports.Response {
                async main() {
                    const messages = args.filter((arg)=>arg.name === 'amount'
                    )[0].value;
                    const fetch_messages = await interaction.channel.messages.fetch({
                        limit: messages
                    });
                    if (!messages || messages >= 32) return this.reply_false('You can not provide a number more than 32 or you did not provided any number');
                    let deleted_messages = interaction.channel.bulkDelete(fetch_messages);
                }
                constructor(){
                    super(interaction);
                    this.main();
                }
            }
            new Clear();
        } catch (err) {
            var ref;
            let e = err;
            (ref = bot.users.cache.get(f.config.owner)) === null || ref === void 0 ? void 0 : ref.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
