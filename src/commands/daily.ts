import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { UserType } from '../types';
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

//const new_ballance = (_get_data._get_users_data!.coins || 0) + amount
//const new_cooldown = (_get_data._get_users_data?.daily_cooldown || 0) + cooldown

const command: Command = {
  slash: {
    name: 'daily',
    description: 'just a daily command',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Daily extends Response {
        readonly amount: number = 500;
        time: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }
        async start() {
          const time = this.time.getTime();
          const cooldown = time + 86000000;

          const db_require = new DB();

          const _get_member_data = await db_require._get_member_data();

          if (
            _get_member_data._get_users_data?.daily_cooldown &&
            _get_member_data._get_users_data.daily_cooldown > time
          ) {
            return this.reply_false(
              'Your cooldown did not expired',
              { timestamp: this.time },
              true
            );
          }

          const new_ballance =
            (_get_member_data._get_users_data?.coins! || 0) + this.amount;
          const new_cooldown =
            (_get_member_data._get_users_data?.daily_cooldown || 0) + cooldown;

          await db_require._overwrite_member_data(new_ballance, new_cooldown);

          await this.reply_true('Success', { timestamp: this.time });
        }
      }

      class DB {
        async _get_member_data() {
          const users_db = db.collection('users');

          const _get_users_data = await users_db.findOne<UserType>({
            login: interaction.user.id,
          });

          const info_return = {
            users_db,
            _get_users_data,
          };

          return info_return;
        }

        async _overwrite_member_data(amount: number, cooldown: number) {
          if (!amount || !cooldown)
            throw new Error(`${amount} or ${cooldown} were not provided!`);

          const _get_data = await this._get_member_data();

          if (!_get_data._get_users_data?.login) {
            _get_data.users_db.insertOne({
              login: interaction.user.id,
              coins: amount,
              daily_cooldown: cooldown,
            });
          } else {
            _get_data.users_db.updateOne(
              {
                login: interaction.user.id,
              },
              {
                $set: {
                  coins: amount,
                  daily_cooldown: cooldown,
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
