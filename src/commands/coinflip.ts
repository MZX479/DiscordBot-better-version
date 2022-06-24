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
    description: 'сcoinflip game',
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

        async start() {}

        async info() {
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
            tails,
            heads,
          };

          return return_info;
        }

        async game() {
          return Math.floor(Math.random() * 2);
        }

        async db_work(result: number) {
          if (!result) throw new Error(`${result} was not provided!`);

          let users_db = db.collection('users');

          let _get_members_data = await users_db.findOne<UserType>({
            login: interaction.user.id,
          });
        }
      }
    } catch (err) {
      let e = <{ message: string; name: string }>err;
      console.error(e);
    }
  },
};

export { command };
