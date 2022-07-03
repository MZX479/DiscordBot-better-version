import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';

interface Ban_interface {
  moderator: string,
  time: Date,
  reason: string
}

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
*/

const command: Command = {
  slash: {
    name: 'ban',
    description: 'ban a member',
    options: [ {
      name: 'reason',
      description: 'provide a reason',
      type: 3,
      required: true
    },{
      name: 'mention',
      description: 'ping a member',
      type: 6,
    }, {
      name: 'id',
      description: 'use a member id',
      type: 3
    }]
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {

      class Ban extends Response {

        readonly time = new Date()
          constructor() {
            super(interaction);

            this.main()
          }

          async main() {}

          async info () {}


      }

      class DB {
        readonly users_db = db.collection('bans')
        async _get_member_data() {

        }

        async _overwrite_member_data () {}
      }
    } catch (err) {
      let e = <{ message: string; name: string }>err;
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
