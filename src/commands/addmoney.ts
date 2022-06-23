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
    name: '',
    description: '',
    options: [
      {
        name: 'amount',
        description: 'amount of money',
        type: 4,
        required: true,
      },
      {
        name: 'member',
        description: 'ping a member',
        type: 6,
        required: false,
      },
      {
        name: 'id',
        description: 'provide a member by his(er) id',
        type: 3,
        required: false,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Add_money {
        member_id!: string;
        constructor() {
          this.member_id;

          this.main();
        }

        async main() {
          let amount = <number>(
            args.filter((arg) => arg.name === 'amount')[0].value
          );
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'member')[0].member
          );
          let member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0].value
          );

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
            member_id = member.id;
          }

          this.member_id = member_id;

          const _get_member_data = await this._get_member_data();
        }

        async _get_member_data() {
          const users_db = db.collection('users');

          const _get_members_data = await users_db.findOne<UserType>({
            login: this.member_id,
          });

          const user_ball = <number>_get_members_data!.coins;

          const return_info = {
            users_db,
            user_ball,
            _get_members_data,
          };

          return return_info;
        }

        async _overwrite_member_data(amount: number) {
          if (!amount) throw new Error(`${amount} was not provided!`);

          const _get_data = await this._get_member_data();

          const coins = _get_data.user_ball + amount;

          if (!_get_data._get_members_data!.login) {
            _get_data.users_db.insertOne({
              login: this.member_id,
              coins,
            });
          } else {
            _get_data.users_db.updateOne(
              {
                login: this.member_id,
              },
              {
                $set: {
                  coins,
                },
              }
            );
          }
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
