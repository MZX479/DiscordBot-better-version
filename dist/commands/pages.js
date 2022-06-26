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
        name: 'lb',
        description: 'lb board'
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            class Pages {
                async main() {}
                constructor(){
                    this.main();
                }
            }
            new Pages();
        } catch (err) {
            var ref;
            let e = err;
            (ref = bot.users.cache.get(f.config.owner)) === null || ref === void 0 ? void 0 : ref.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
