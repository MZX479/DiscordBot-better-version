import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { UserType } from '../types';
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
    description: 'Accept member to your club',
    options: [
      {
        name: 'member',
        description: 'ping a member',
        type: 6,
        required: false,
      },
      {
        name: 'id',
        description: 'provide a member by his(er) id',
        type: 3,
        required: false,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Club_accept extends Response {
        constructor() {
          super(interaction);

          this.main();
        }

        async main() {
          let member = <Discord.GuildMember | undefined>(
            args.filter((arg) => arg.name === 'member')[0]?.member
          );

          let member_id = <string | undefined>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );

          if (!member && !member_id) {
            this.reply_false("You didn't specify a member");
            return;
          }

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          if (!member) {
            this.reply_false('You specified a wrong member');
            return;
          }

          const clubs_collection = db.collection('clubs');
          const club = await clubs_collection.findOne<Club>({
            owner: interaction.user.id,
          });

          if (!club) {
            this.reply_false("You don't have a club");
            return;
          }

          let { members = [], requests = [] } = club;

          if (!requests.includes(member.id)) {
            this.reply_false("This member didn't send request to your club");
            return;
          }

          if (members.includes(member.id)) {
            this.reply_false('This member is already in your club');
            return;
          }

          requests.splice(requests.indexOf(member.id), 1);
          members.push(member.id);

          clubs_collection.updateOne(
            {
              owner: club.owner,
            },
            {
              $set: {
                members,
                requests,
              },
            }
          );

          this.reply_true(
            `You successfuly added \`${member.user.tag}\` to your club`
          );
        }
      }
      new Club_accept();
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
