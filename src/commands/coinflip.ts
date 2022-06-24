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
    name: 'coinflip',
    description: 'сoinflip game',
    options: [
      {
        name: 'choice',
        description: 'user choice side of medal',
        type: 3,
        required: true,
      },
      {
        name: 'bet',
        description: 'your bet',
        type: 4,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Coinflip extends Response {
        time!: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start() {
          let info = await this.info();
          const users_db = db.collection('users');
          const _get_member_data = await users_db.findOne<UserType>({
            login: interaction.user.id,
          });

          if (
            info.choice !== info.heads.name &&
            info.choice !== info.tails.name
          )
            return this.reply_false('your side does not exist!', {
              timestamp: this.time,
            });

          let game = this.game();

          let winner;
          let loser;
          const user_ballance = _get_member_data?.coins;

          let win_bet = _get_member_data?.coins! - info.bet + info.bet * 2;
          let lose_bet = _get_member_data?.coins! - info.bet;

          if (!user_ballance || user_ballance <= 0 || info.bet! > user_ballance)
            return this.reply_false('Your ballance is too low!', {
              timestamp: this.time,
            });

          let result_game = await this.game();

          switch (result_game) {
            case 0:
              winner = info.heads;
              loser = info.tails;
              break;

            case 1:
              winner = info.tails;
              loser = info.heads;
              break;
            default:
              break;
          }

          let user = <string>interaction.user.id;

          if (info.choice === winner?.name) {
            users_db.updateOne(
              {
                login: user,
              },
              {
                $set: {
                  coins: win_bet,
                },
              }
            );

            this.reply_true('Congratz. You win!');
          } else {
            users_db.updateOne(
              {
                login: user,
              },
              {
                $set: {
                  coins: lose_bet,
                },
              }
            );

            this.reply_false('Sorry. You lose, try again!');
          }
        }

        async info() {
          let choice = <string>(
            args.filter((arg) => arg.name === 'choice')[0].value
          );
          let bet = <number>args.filter((arg) => arg.name === 'bet')[0].value;
          let tails = {
            name: 'tails',
            picture:
              'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/solution_photos/000/134/599/datas/original.png',
          };

          let heads = {
            name: 'heads',
            picture:
              'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/solution_photos/000/134/598/datas/original.png',
          };

          const return_info = {
            choice,
            bet,
            tails,
            heads,
          };

          return return_info;
        }

        async game() {
          return Math.floor(Math.random() * 2);
        }
      }

      new Coinflip();
    } catch (err) {
      let e = <{ message: string; name: string }>err;
      console.error(e);
    }
  },
};

export { command };
