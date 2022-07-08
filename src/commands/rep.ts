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
    name: 'rep',
    description: 'add a reputation',
    options: [
      {
        name: 'member',
        description: 'ping a member',
        type: 6,
      },
      {
        name: 'id',
        description: 'use a member id',
        type: 3,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    const users_db = db.collection('users');
    try {
      class Rep extends Response {
        private readonly users_db = db.collection('users');
        readonly rep: 1 = 1;
        readonly cooldown: 86000000 = 86000000;
        constructor() {
          super(interaction);

          this.start();
        }

        async start() {
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'member')[0]?.member
          );

          let member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          let time = new Date().getTime();

          let cooldown = time + this.cooldown;

          let _get_data = await this._get_author_data();

          const new_cooldown = (_get_data!.rep_cooldown || 0) + cooldown;

          if (_get_data!.rep_cooldown && _get_data!.rep_cooldown > time)
            return this.reply_false('Your cooldown has not expired!', {}, true);

          await this._overwrite_member_data(member_id);

          await this._overwrite_author_data(new_cooldown);

          this.reply_true('Success!');
        }

        private async _get_author_data() {
          const _get_author_data = await this.users_db.findOne<UserType>({
            login: interaction.user.id,
          });

          return _get_author_data;
        }

        private async _overwrite_author_data(cooldown: number) {
          const _get_author_data = await this._get_author_data();

          if (!_get_author_data?.login) {
            this.users_db.insertOne({
              login: interaction.user.id,
              rep_cooldown: cooldown,
            });
          } else {
            this.users_db.updateOne(
              {
                login: interaction.user.id,
              },
              {
                $set: {
                  rep_cooldown: cooldown,
                },
              }
            );
          }
        }

        async _overwrite_member_data(member_id: string) {
          const _get_member_data = await this.users_db.findOne<UserType>({
            login: member_id,
          });

          const user_rep = <number>_get_member_data?.reputation || 0;

          const rep_to_add = user_rep + this.rep;

          if (!_get_member_data?.login) {
            this.users_db.insertOne({
              login: member_id,
              reputation: rep_to_add,
            });
          } else {
            this.users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  reputation: rep_to_add,
                },
              }
            );
          }
        }
      }

      new Rep();
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
