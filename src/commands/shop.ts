import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

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
    name: 'shop',
    description: 'just a shop',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Shop {
        time!: Date;
        constructor() {
          this.time = new Date();

          this.start();
        }

        async start() {
          const items_db = db.collection('Items');

          let number = 1;

          const require_items = await items_db
            .find()
            .sort({
              cost: -1,
            })
            .toArray();

          let embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setAuthor({
              name: interaction.user.tag,
              iconURL: interaction.user.avatarURL({ dynamic: true })!,
            })
            .setTimestamp(new Date());

          for (let item of require_items) {
            embed.addField(`${number++})  ${item.name}`, `${item.cost}`);
          }

          interaction.channel!.send({ embeds: [embed] });
        }
      }
      new Shop();
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
