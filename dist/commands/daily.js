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
*/ //const new_ballance = (_get_data._get_users_data!.coins || 0) + amount
//const new_cooldown = (_get_data._get_users_data?.daily_cooldown || 0) + cooldown
const command = {
    slash: {
        name: 'daily',
        description: 'just a daily command'
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            class Daily extends _exports.Response {
                async start() {
                    var ref, ref1, ref2;
                    const time = this.time.getTime();
                    const cooldown = time + 86000000;
                    const db_require = new DB();
                    const _get_member_data = await db_require._get_member_data();
                    if (((ref = _get_member_data._get_users_data) === null || ref === void 0 ? void 0 : ref.daily_cooldown) && _get_member_data._get_users_data.daily_cooldown > time) {
                        return this.reply_false('Your cooldown did not expired', {
                            timestamp: this.time
                        }, true);
                    }
                    const new_ballance = (((ref1 = _get_member_data._get_users_data) === null || ref1 === void 0 ? void 0 : ref1.coins) || 0) + this.amount;
                    const new_cooldown = (((ref2 = _get_member_data._get_users_data) === null || ref2 === void 0 ? void 0 : ref2.daily_cooldown) || 0) + cooldown;
                    await db_require._overwrite_member_data(new_ballance, new_cooldown);
                    await this.reply_true('Success', {
                        timestamp: this.time
                    });
                }
                constructor(){
                    super(interaction);
                    this.amount = 500;
                    this.time = new Date();
                    this.start();
                }
            }
            class DB {
                async _get_member_data() {
                    const users_db = db.collection('users');
                    const _get_users_data = await users_db.findOne({
                        login: interaction.user.id
                    });
                    const info_return = {
                        users_db,
                        _get_users_data
                    };
                    return info_return;
                }
                async _overwrite_member_data(amount, cooldown) {
                    var ref;
                    if (!amount || !cooldown) throw new Error(`${amount} or ${cooldown} were not provided!`);
                    const _get_data = await this._get_member_data();
                    if (!((ref = _get_data._get_users_data) === null || ref === void 0 ? void 0 : ref.login)) {
                        _get_data.users_db.insertOne({
                            login: interaction.user.id,
                            coins: amount,
                            daily_cooldown: cooldown
                        });
                    } else {
                        _get_data.users_db.updateOne({
                            login: interaction.user.id
                        }, {
                            $set: {
                                coins: amount,
                                daily_cooldown: cooldown
                            }
                        });
                    }
                }
            }
            new Daily();
        } catch (err) {
            var ref3;
            let e = err;
            (ref3 = bot.users.cache.get(f.config.owner)) === null || ref3 === void 0 ? void 0 : ref3.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
