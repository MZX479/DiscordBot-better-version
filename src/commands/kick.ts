import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';

interface Kick_record {
  moderator: string;
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
    name: 'kick',
    description: 'kick a user',
    options: [
      {
        name: 'reason',
        description: 'reason of kick',
        type: 3,
        required: true,
      },
      {
        name: 'ping',
        description: 'ping a user',
        type: 6,
      },
      {
        name: 'id',
        description: 'user id',
        type: 3,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Kick {
        constructor() {
          this.main();
        }

        async main() {
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'ping')[0]?.member
          );
          let member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );
          const reason = <string>(
            args.filter((arg) => arg.name === 'reason')[0].value
          );

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          await interaction.guild!.members.kick(member, reason);
        }
      }

      new Kick();
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
