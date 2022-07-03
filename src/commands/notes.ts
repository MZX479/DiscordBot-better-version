import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';

interface FieldType {
  id: string,
  note: string
}

type buttons = 'prev' | 'next'

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
    name: 'notes',
    description: 'display notes',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      let response = new Response(interaction)
      let notes_db = db.collection('notes')
      let get_notes_data = await notes_db.findOne({login: interaction.user.id})

      let notes = get_notes_data!.notes

      let embed = new Discord.MessageEmbed()
          .setTitle('Notes')
          .setColor('RANDOM')

      for (let note of notes) {
        embed.addField(` \`id:\` ${note.id}`, `\`${note.note}\``)
      }

      interaction.channel!.send({embeds: [
        embed
        ]})

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
