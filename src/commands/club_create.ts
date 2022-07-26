import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { Club } from '../exports';
import { User } from 'discord.js';

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
    name: 'clubcreate',
    description: 'create a club',
    options: [
      {
        name: 'clubname',
        description: 'create a club name',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Club_create extends Response {
        private readonly users_db = db.collection('clubs');
        time!: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.main();
        }

        async main() {
          const club_name = <string>(
            args.filter((arg) => arg.name === 'clubname')[0].value
          );

          const club: Club = {
            name: club_name,
            description: 'club_description',
            members: [],
            requests: [],
            owner: interaction.user.id,
          };

          const _get_data = await this._get_data();

          if (_get_data.owner)
            return this.reply_false('Club already exists!', {
              timestamp: this.time,
            });

          await this.db_work(club);

          await this.reply_true('success', { timestamp: this.time });
        }

        async _get_data() {
          const _get_members_data =
            (await this.users_db.findOne<Club>({
              owner: interaction.user.id,
            })) || ({} as Club);

          return _get_members_data;
        }

        async db_work(club_options: {}) {
          const _get_data = await this._get_data();

          if (!_get_data.owner) {
            await this.users_db.insertOne(club_options);
          }
        }
      }

      new Club_create();
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
