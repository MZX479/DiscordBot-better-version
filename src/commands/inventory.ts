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
    name: 'inventory',
    description: 'shows an inventory',
    options: [
      {
        name: 'member',
        description: 'choose a member',
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
      class Inventory {
        constructor() {
          this.main();
        }

        async main() {
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'member')[0]?.member
          );
        }
      }

      class Response {
        async reply_true(title: string, description: string) {
          await interaction.followUp({
            embeds: [
              {
                title,
                color: '#00ff00',
                author: {
                  name: interaction.user.tag,
                  icon_url: interaction.user.avatarURL({ dynamic: true })!,
                },
                description,
                timestamp: new Date(),
                footer: { text: `requested by ${interaction.user.tag}` },
              },
            ],
          });
        }

        async reply_false(description: string) {
          await interaction.followUp({
            embeds: [
              {
                title: 'Error!',
                color: '#ff0000',
                author: {
                  name: interaction.user.tag,
                  icon_url: interaction.user.avatarURL({ dynamic: true })!,
                },
                description,
                timestamp: new Date(),
                footer: { text: 'Retry!' },
              },
            ],
          });
        }
      }

      class DB {
        member_id: string;
        private readonly users_db = db.collection('users');

        constructor(member_id: string) {
          this.member_id = member_id;
        }

        async _get_member_data() {
          const _get_member_data = await this.users_db.findOne({
            login: this.member_id,
          });

          return _get_member_data;
        }
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
