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
    name: 'random',
    description: 'fdsfsdfsm',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      let result = Math.floor(Math.random() * 3);

      switch (result) {
        case 0:
          interaction.followUp({
            embeds: [
              {
                description: 'Scout',
              },
            ],
          });
          break;
        case 1:
          interaction.followUp({
            embeds: [
              {
                description: 'Gunner',
              },
            ],
          });
          break;
        case 2:
          interaction.followUp({
            embeds: [
              {
                description: 'Driller',
              },
            ],
          });
          break;
        case 3:
          interaction.followUp({
            embeds: [
              {
                description: 'Engineer',
              },
            ],
          });

        default:
          break;
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
