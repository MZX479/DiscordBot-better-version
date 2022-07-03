import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';

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
    name: 'unban',
    description: 'unban an user',
    options: [
      {
        name: 'reason',
        description: 'provide a reason',
        type: 3,
        required: true,
      },
      {
        name: 'id',
        description: 'use a member_id',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      const response = new Response(interaction);
      const member_id = <string>(
        args.filter((arg) => arg.name === 'id')[0].value
      );
      const reason = <string>(
        args.filter((arg) => arg.name === 'reason')[0].value
      );

      await interaction.guild!.members.unban(member_id, reason);

      response.reply_true('success!');
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
