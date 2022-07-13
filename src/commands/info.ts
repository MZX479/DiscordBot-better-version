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
    name: 'info',
    description: 'info about item',
    options: [
      {
        name: 'name',
        description: 'name of item',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      const item = <string>args.filter((arg) => arg.name === 'name')[0].value;
      const items_db = db.collection('Items');
      const items_collection = await items_db.find().toArray();

      const filt_item = items_collection.filter((arg) => arg.name === item)[0];

      let embed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setTitle(filt_item.name)
        .addField('ID', `${filt_item.id}`)
        .addField('Description', `${filt_item.description}`)
        .setTimestamp();

      interaction.channel!.send({ embeds: [embed] });
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
