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
        name: 'addmoney',
        description: 'adding money',
        options: [
            {
                name: 'amount',
                description: 'amount of money',
                type: 4,
                required: true
            },
            {
                name: 'member',
                description: 'ping a member',
                type: 6,
                required: false
            },
            {
                name: 'id',
                description: 'provide a member by his(er) id',
                type: 3,
                required: false
            }, 
        ]
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            class Add_money extends _exports.Response {
                async main() {
                    var ref, ref1;
                    let amount = args.filter((arg)=>arg.name === 'amount'
                    )[0].value;
                    let member = (ref = args.filter((arg)=>arg.name === 'member'
                    )[0]) === null || ref === void 0 ? void 0 : ref.member;
                    let member_id = (ref1 = args.filter((arg)=>arg.name === 'id'
                    )[0]) === null || ref1 === void 0 ? void 0 : ref1.value;
                    if (!member && member_id) {
                        member = await interaction.guild.members.fetch(member_id);
                    }
                    this.member_id = member.id;
                    const _get_member_data = await this._get_member_data();
                    await this._overwrite_member_data(member.id, amount);
                    this.reply_true('success!', {
                        timestamp: new Date()
                    });
                }
                async _get_member_data() {
                    const users_db = db.collection('users');
                    const _get_members_data = await users_db.findOne({
                        login: this.member_id
                    });
                    const user_ball = _get_members_data === null || _get_members_data === void 0 ? void 0 : _get_members_data.coins;
                    const return_info = {
                        users_db,
                        user_ball,
                        _get_members_data
                    };
                    return return_info;
                }
                async _overwrite_member_data(member_id, amount) {
                    var ref;
                    if (!amount) throw new Error(`${amount} was not provided!`);
                    const _get_data = await this._get_member_data();
                    const coins = (_get_data.user_ball || 0) + amount;
                    console.log(_get_data._get_members_data);
                    if (!((ref = _get_data._get_members_data) === null || ref === void 0 ? void 0 : ref.login)) {
                        _get_data.users_db.insertOne({
                            login: member_id,
                            coins
                        });
                    } else {
                        _get_data.users_db.updateOne({
                            login: member_id
                        }, {
                            $set: {
                                coins
                            }
                        });
                    }
                }
                constructor(){
                    super(interaction);
                    this.member_id;
                    this.main();
                }
            }
            new Add_money();
        } catch (err) {
            var ref2;
            let e = err;
            (ref2 = bot.users.cache.get(f.config.owner)) === null || ref2 === void 0 ? void 0 : ref2.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
