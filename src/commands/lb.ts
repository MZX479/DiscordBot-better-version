import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command, UserType } from '../types';
import { Response } from '../exports';
interface FieldType {
  name: string;
  value: string;
}
/** пидор */

type button_labels = 'prev' | 'next';
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
    name: 'lb',
    description: 'leaderboard',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      const response = new Response(interaction);

      const users_db = db.collection('users');
      const users_data = await users_db
        .find<UserType>({
          coins: {
            $gt: 0,
          },
        })
        .sort({ coins: -1 })
        .toArray();

      const fields: FieldType[][] = [];
      const embeds: Discord.MessageEmbed[] = [];

      const members = await interaction.guild!.members.fetch({
        user: users_data.map((user) => user.login) as Discord.UserResolvable[],
      });

      let position = 1;
      let current_page = 0;
      let number = 1;
      for (const user of users_data) {
        if (!user.login) continue;
        const member = members.get(user.login);
        if (!member) continue;

        const field: FieldType = {
          name: `${position++}. ${member.user.tag}`,
          value: `${user.coins || 0}`,
        };

        if (!fields[current_page])
          fields[current_page] = [field]; // [ [field] ] ; curr_page = 0
        else fields[current_page].push(field); // [ [field, field], [field, field] ] ; curr_page = 0

        number++;
        if (number >= 2 /**0*/) {
          current_page++;
          number = 1;
        }
      }

      if (!fields[0]) return response.reply_false('Гавно');
      const prev_button = new Discord.MessageButton()
        .setCustomId('prev')
        .setLabel('Назад')
        .setStyle('PRIMARY')
        .setDisabled(true);
      const next_button = new Discord.MessageButton()
        .setCustomId('next')
        .setLabel('Вперед')
        .setStyle('PRIMARY');

      const manage_buttons = [prev_button, next_button];

      for (const field of fields) {
        const page_embed = new Discord.MessageEmbed({
          title: 'Доска лидеров',
          fields: field,
          timestamp: new Date(),
        });
        embeds.push(page_embed);
      }

      current_page = 0;

      const row = new Discord.MessageActionRow().addComponents(
        ...manage_buttons
      );
      const menu = (await interaction.followUp({
        embeds: [embeds[current_page]],
        components: embeds[1] ? [row] : undefined,
      })) as Discord.Message;

      const collector = menu.createMessageComponentCollector({
        filter: (button) => button.user.id === interaction.user.id,
        time: 180000,
      });

      collector.on('collect', async (button) => {
        switch (button.customId as button_labels) {
          case 'next':
            if (current_page + 1 > embeds.length - 1)
              return button.update({
                embeds: button.message.embeds!,
              });
            current_page++;
            prev_button.disabled = false;
            if (current_page + 1 > embeds.length - 1)
              next_button.disabled = true;

            await update_menu(button);
            break;

          case 'prev':
            if (current_page - 1 < 0)
              return button.update({
                embeds: button.message.embeds!,
              });
            current_page--;
            next_button.disabled = false;
            if (current_page - 1 < 0) prev_button.disabled = true;

            await update_menu(button);
            break;
        }
      });

      async function update_menu(button: Discord.MessageComponentInteraction) {
        const new_buttons = new Discord.MessageActionRow().addComponents(
          prev_button,
          next_button
        );

        button.update({
          embeds: [embeds[current_page]],
          components: [new_buttons],
        });
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
