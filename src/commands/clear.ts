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
    name: 'clear',
    description: 'clear command',
    options: [
      {
        name: 'amount',
        description: 'amoont of messages to delete',
        type: 4,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Clear extends Response {
        constructor() {
          super(interaction);
          this.main();
        }

        async main() {
          const messages = <number>(
            args.filter((arg) => arg.name === 'amount')[0].value
          );

          const fetch_messages = await interaction.channel!.messages.fetch({
            limit: messages,
          });

          if (!messages || messages >= 32) return this.reply_false('You can not provide a number more than 32 or you did not provided any number')

          let deleted_messages = (
            interaction.channel! as Discord.TextChannel
          ).bulkDelete(fetch_messages);
        }
      }

      new Clear();
    } catch (err) {
      let e = <{ message: string; name: string }>err;
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  }
};

export { command };
