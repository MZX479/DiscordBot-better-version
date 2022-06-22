import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { UserType } from '../types';

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
    name: 'daily',
    description: '100 money"s every day',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Daily {
        readonly amount: number = 100;
        constructor() {
          this.start();
        }

        async start() {
          const cooldown: number = 86000000;
          const new_cooldown = <number>new Date().getTime() + cooldown;

          const db = new DB();

          const _get_member_data = await db._get_member_data(
            interaction.user.id
          );

          if (
            _get_member_data._get_member_data?.daily_cooldown &&
            _get_member_data._get_member_data.daily_cooldown >
              new Date().getTime()
          )
            return interaction.followUp({
              embeds: [
                {
                  author: {
                    name: interaction.user.tag,
                    icon_url: interaction.user.avatarURL({ dynamic: true })!,
                  },
                  description: 'Your cooldown was not expired!',
                },
              ],
              ephemeral: true,
            });

          await db._overwrite_member_data(
            interaction.user.id,
            this.amount,
            new_cooldown
          );

          interaction.followUp({
            embeds: [
              {
                author: {
                  name: interaction.user.tag,
                  icon_url: interaction.user.avatarURL({ dynamic: true })!,
                },
                description: 'Success!',
              },
            ],
            ephemeral: false,
          });
        }
      }

      class DB {
        async _get_member_data(member_id: string) {
          const users_db = db.collection('users');

          const _get_member_data = await users_db.findOne<UserType>({
            login: member_id,
          });

          const return_info = {
            users_db,
            _get_member_data,
          };

          return return_info;
        }

        async _overwrite_member_data(
          member_id: string,
          amount: number,
          cooldown: number
        ) {
          if (!member_id || !amount)
            throw new Error(
              `${member_id} or ${amount}, ${cooldown} were not provided!`
            );

          const _get_member_data = await this._get_member_data(
            interaction.user.id
          );

          const new_ballance =
            <number>(_get_member_data._get_member_data?.coins || 0) + amount;

          const new_cooldown =
            <number>(_get_member_data._get_member_data?.daily_cooldown || 0) +
            cooldown;

          if (!_get_member_data._get_member_data?.login) {
            _get_member_data.users_db.insertOne({
              login: member_id,
              coins: new_ballance,
              daily_cooldown: new_cooldown,
            });
          } else {
            _get_member_data.users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  coins: new_ballance,
                  daily_cooldown: new_cooldown,
                },
              }
            );
          }
        }
      }

      new Daily();
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
