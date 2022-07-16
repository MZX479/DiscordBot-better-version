import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
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
    description: 'daily command to get some money',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Set_daily extends Response {
        private readonly amount: 3000 = 3000;
        private readonly cooldown: 86000000 = 86000000;
        constructor() {
          super(interaction);
          this.main();
        }

        async main() {
          const connect_db = new DB();

          const _get_data = await connect_db._get_data();

          const time = new Date().getTime();

          const new_cooldown = time + this.cooldown;

          if (
            _get_data._get_member_data!.daily_cooldown &&
            _get_data._get_member_data!.daily_cooldown > time
          )
            return this.reply_false('Sorry. Your cooldown did not expired', {
              title: 'Error',
              timestamp: new Date(),
            });

          await connect_db._overwrite_data(this.amount, new_cooldown);

          await this.reply_true(
            `Sucessfully added \`${this.amount}💸\` \n Comeback tommorow!`,
            {
              title: 'Success',
              timestamp: new Date(),
              thumbnail: {
                url: 'https://cdn.discordapp.com/emojis/879423640125460500.gif?size=128&quality=lossless',
              },
            }
          );
        }
      }

      class DB {
        async _get_data() {
          const _users_db = db.collection('users');
          const _get_member_data = await _users_db.findOne<UserType>({
            login: interaction.user.id,
          });

          const return_info = {
            _users_db,
            _get_member_data,
          };

          return return_info;
        }

        async _overwrite_data(amount: number, cooldown: number) {
          if (!amount || !cooldown)
            throw new Error(`${amount} or ${cooldown} was not provided!`);

          const _get_data = await this._get_data();

          const user_ballance = _get_data._get_member_data!.coins || 0;

          const old_user_cooldown =
            _get_data._get_member_data!.daily_cooldown || 0;

          const new_ballance = user_ballance + amount;

          const new_cooldown = old_user_cooldown + cooldown;

          if (!_get_data._get_member_data!.login) {
            _get_data._users_db.insertOne({
              login: interaction.user.id,
              coins: new_ballance,
              daily_cooldown: new_cooldown,
            });
          } else {
            _get_data._users_db.updateOne(
              {
                login: interaction.user.id,
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

      new Set_daily();
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
