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
    name: 'clubaccept',
    description: 'clubaccept',
    options: [
      {
        name: 'member',
        description: 'ping a member',
        type: 6,
      },
      {
        name: 'member_id',
        description: 'use a member id',
        type: 3,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class ClubAccept extends Response {
        constructor() {
          super(interaction);
          this.main();
        }

        async main() {
          const _get_data = await this._get_data();

          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'member')[0]?.member
          );
          let member_id = <string>(
            args.filter((arg) => arg.name === 'member_id')[0]?.value
          );

          if (!member && !member_id) {
            this.reply_false('You did not provide any arguments!');
          }

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          if (!_get_data.club)
            return this.reply_false('You do not have a club!');

          const { requests = [], members = [] } = _get_data.club;

          if (!requests.includes(member.id))
            return this.reply_false('Member did not send a request!');

          if (members.includes(member.id))
            return this.reply_false('Member already in the club');

          requests.splice(requests.indexOf(member.id), 1);
          members.push(member.id);

          _get_data.clubs_db.updateOne(
            {
              owner: _get_data.club.owner,
            },
            {
              $set: {
                requests,
                members,
              },
            }
          );

          await this.reply_true(
            `You successfully added \`${member.user.tag}\` to your club`
          );
        }

        async _get_data() {
          const clubs_db = db.collection('clubs');
          const club = await clubs_db.findOne<Club>({
            owner: interaction.user.id,
          });

          const return_info = {
            clubs_db,
            club,
          };

          return return_info;
        }
      }

      new ClubAccept();
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
