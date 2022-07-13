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
    name: 'create_item',
    description: 'creating an item',
    options: [
      {
        name: 'name',
        description: 'item name',
        type: 3,
        required: true,
      },
      {
        name: 'cost',
        description: 'price of your item',
        type: 4,
        required: true,
      },
      {
        name: 'description',
        description: 'description of your item',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Item extends Response {
        private readonly users_db = db.collection('users');
        private readonly items_db = db.collection('Items');
        private readonly price: 1000 = 1000;
        constructor() {
          super(interaction);
          this.main();
        }

        async main() {
          let name = <string>args.filter((arg) => arg.name === 'name')[0].value;
          let cost = <number>args.filter((arg) => arg.name === 'cost')[0].value;
          let description = <string>(
            args.filter((arg) => arg.name === 'description')[0].value
          );

          let _get_data = await this._get_data();

          if (!_get_data || _get_data.coins! < this.price)
            return this.reply_false('You do not have enough money');

          await this.overwrite_member_data(name, cost, description);

          this.reply_true('success!');
        }

        async _get_data() {
          let users_data = await this.users_db.findOne<UserType>({
            login: interaction.user.id,
          });

          return users_data;
        }

        async overwrite_member_data(
          name: string,
          cost: number,
          description: string
        ) {
          let _get_data = await this._get_data();

          let new_ballance = _get_data!.coins! - this.price;

          this.users_db.updateOne(
            {
              login: interaction.user.id,
            },
            {
              $set: {
                coins: new_ballance,
              },
            }
          );

          this.items_db.insertOne({
            name,
            description,
            cost,
          });
        }
      }
      new Item();
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
