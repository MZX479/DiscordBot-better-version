import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { UserType, type Command } from '../types';
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
    name: 'buy',
    description: 'purchase a role or item',
    options: [
      {
        name: 'item',
        description: 'choose an item',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Buy extends Response {
        constructor() {
          super(interaction);
          this.main();
        }

        async main() {
          const item = <string>(
            args.filter((arg) => arg.name === 'item')[0].value
          );

          const member = interaction.member;

          const db = new DB();
          const _get_users_data = await db._get_users_data();
          const _get_items_data = await db._get_items_data();

          let filtered_item = _get_items_data._get_items_data.filter(
            (arg) => arg.name === item
          )[0];

          if (
            !_get_users_data._get_users_data ||
            _get_users_data._get_users_data!.coins! < filtered_item.cost
          )
            return this.reply_false(
              'You don`t have enough money!',
              {
                thumbnail: {
                  url: 'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
                },
              },
              true
            );

          let check_buttons = await this.check_buttons();

          switch (check_buttons.customId) {
            case 'yes':
              await db._overwrite_member_data(filtered_item.cost);
              await (member?.roles as Discord.GuildMemberRoleManager).add(
                filtered_item.role
              );
              await this.reply_true(
                `You successfully bought a \`${filtered_item.name}\` \n **See You!**`,
                {
                  thumbnail: {
                    url: 'https://cdn.discordapp.com/emojis/966737934457905202.webp?size=64&quality=lossless',
                  },
                },
                true
              );
              break;

            case 'no':
              return this.reply_true(
                '**See you!**',
                {
                  thumbnail: {
                    url: 'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
                  },
                },
                true
              );

            default:
              break;
          }
        }

        async check_buttons() {
          const buttons = [
            new Discord.MessageButton()
              .setLabel('Yes')
              .setCustomId('yes')
              .setStyle('SUCCESS'),
            new Discord.MessageButton()
              .setLabel('No')
              .setCustomId('no')
              .setStyle('DANGER'),
          ];

          let ask_answer = <Discord.Message>await interaction.followUp({
            embeds: [
              {
                author: {
                  name: interaction.user.tag,
                  icon_url: interaction.user.displayAvatarURL({
                    dynamic: true,
                  }),
                },
                description: 'Are you sure?',
                timestamp: new Date(),
              },
            ],
            components: [
              new Discord.MessageActionRow().addComponents(...buttons),
            ],

            fetchReply: true,
          });

          let await_component = await ask_answer.awaitMessageComponent({
            filter: (button) => interaction.user.id === button.user.id,
            time: 180000,
          });

          ask_answer.delete();

          return await_component;
        }
      }

      class DB {
        async _get_items_data() {
          const items_db = db.collection('Items');

          const _get_items_data = await items_db.find().toArray();

          const return_info = {
            items_db,
            _get_items_data,
          };

          return return_info;
        }

        async _get_users_data() {
          const users_db = db.collection('users');

          const _get_users_data = await users_db.findOne<UserType>({
            login: interaction.user.id,
          });

          const return_info = {
            users_db,
            _get_users_data,
          };

          return return_info;
        }

        async _overwrite_member_data(choice: number) {
          if (!choice) throw new Error(`${choice} was not provided!`);

          const _get_users_data = await this._get_users_data();

          const user_ballance = _get_users_data._get_users_data!.coins!;

          const new_ballance = user_ballance - choice;

          _get_users_data.users_db.updateOne(
            {
              login: interaction.user.id,
            },
            {
              $set: {
                coins: new_ballance,
              },
            }
          );
        }
      }

      new Buy();
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
