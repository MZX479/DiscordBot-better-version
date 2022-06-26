Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = void 0;
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
        name: 'clean',
        description: 'clear around 32 messages'
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            var ref;
            const amount = 32;
            let fetch_messages = await ((ref = interaction.channel) === null || ref === void 0 ? void 0 : ref.messages.fetch({
                limit: amount
            }));
            let deleted_messages = interaction.channel.bulkDelete(amount);
        } catch (err) {
            var ref1;
            let e = err;
            (ref1 = bot.users.cache.get(f.config.owner)) === null || ref1 === void 0 ? void 0 : ref1.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
