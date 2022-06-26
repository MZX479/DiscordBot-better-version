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
        name: 'note',
        description: 'note to write',
        options: [
            {
                name: 'note',
                description: 'note to set',
                type: 3,
                required: true
            }, 
        ]
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            class Notes extends _exports.Response {
                async main() {
                    let note = args.filter((arg)=>arg.name === 'note'
                    )[0].value;
                    let random_id = Math.floor(Math.random() * 123456789);
                    const note_to_set = {
                        time: this.time.getTime(),
                        note: note,
                        id: random_id
                    };
                    let new_cooldown = this.time.getTime() + this.cooldown;
                    await this._overwite_member_data(this.interaction.user.id, note_to_set, new_cooldown);
                    this.reply_true('success!', {
                        timestamp: this.time
                    });
                }
                async _overwite_member_data(member_id, note, cooldown) {
                    if (!member_id || !note || !cooldown) throw new Error(`${member_id}, ${note}, ${cooldown} were not provided!`);
                    const _get_member_data = await this.users_db.findOne({
                        login: member_id
                    }) || {};
                    let new_cooldown = (_get_member_data.cooldown || 0) + cooldown;
                    let notes = _get_member_data.notes || [];
                    notes.push(note);
                    if (!_get_member_data.login) {
                        this.users_db.insertOne({
                            login: member_id,
                            notes,
                            cooldown: new_cooldown
                        });
                    } else {
                        this.users_db.updateOne({
                            login: member_id
                        }, {
                            $set: {
                                notes,
                                cooldown: new_cooldown
                            }
                        });
                    }
                }
                constructor(){
                    super(interaction);
                    this.users_db = db.collection('notes');
                    this.cooldown = 60000;
                    this.time = new Date();
                    this.main();
                }
            }
            new Notes();
        } catch (err) {
            var ref;
            let e = err;
            (ref = bot.users.cache.get(f.config.owner)) === null || ref === void 0 ? void 0 : ref.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
