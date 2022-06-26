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
        name: 'avatar',
        description: 'display member"s avatar',
        options: [
            {
                name: 'member',
                description: 'choose a member',
                type: 6,
                required: false
            },
            {
                name: 'id',
                description: 'use id of current member',
                type: 3,
                required: false
            }, 
        ]
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            async function start() {
                main();
                avatar_response();
            }
            async function main() {
                var ref, ref1;
                let member = (ref = args.filter((arg)=>arg.name === 'member'
                )[0]) === null || ref === void 0 ? void 0 : ref.member;
                let member_id = (ref1 = args.filter((arg)=>arg.name === 'id'
                )[0]) === null || ref1 === void 0 ? void 0 : ref1.value;
                if (!member && member_id) {
                    member = await interaction.guild.members.fetch(member_id);
                }
                if (!member_id && !member) {
                    return interaction.followUp({
                        embeds: [
                            {
                                color: 'DARK_RED',
                                description: 'provide a member please!'
                            }, 
                        ]
                    });
                }
                let return_info = {
                    member
                };
                return return_info;
            }
            async function avatar_response() {
                let info = await main();
                interaction.followUp({
                    embeds: [
                        {
                            author: {
                                name: interaction.user.tag,
                                icon_url: interaction.user.avatarURL({
                                    dynamic: true
                                })
                            },
                            color: 'GREEN',
                            image: {
                                url: info.member.displayAvatarURL({
                                    dynamic: true
                                })
                            },
                            timestamp: new Date()
                        }, 
                    ]
                });
            }
            start();
        } catch (err) {
            var ref2;
            let e = err;
            (ref2 = bot.users.cache.get(f.config.owner)) === null || ref2 === void 0 ? void 0 : ref2.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
