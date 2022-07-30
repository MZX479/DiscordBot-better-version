import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response, Club } from '../exports';

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
    name: 'clubapply',
    description: 'Sending a request to club',
    options: [
      {
        name: 'club_name',
        description: 'Name of club which you want to join',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Clubapply extends Response {
        constructor() {
          super(interaction);

          this.main();
        }

        async main() {
          let club_name = <string>(
            args.filter((arg) => arg.name === 'club_name')[0].value
          );

          if (!club_name)
            return this.reply_false('You did not provide a club name!');

          const _get_data = await this._get_member_data(club_name);

          if (!_get_data.get_club)
            return this.reply_false('You specified a wrong club');

          const { members = [], requests = [] } = _get_data.get_club;

          if (members.includes(interaction.user.id))
            return this.reply_false('You already in this club');

          if (requests.includes(interaction.user.id))
            return this.reply_false('You already sent a request!');

          requests.push(interaction.user.id);

          _get_data.clubs_db.updateOne(
            {
              owner: _get_data.get_club.owner,
            },
            {
              $set: {
                requests,
              },
            }
          );

          await this.reply_true(
            `You successfully sent a request to ${club_name}`
          );
        }

        async _get_member_data(club_name: string) {
          const clubs_db = db.collection('clubs');
          const get_club = await clubs_db.findOne<Club>({
            name: { $regex: club_name, $options: '-i' },
          });

          const return_info = {
            clubs_db,
            get_club,
          };

          return return_info;
        }
      }
      new Clubapply();
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
