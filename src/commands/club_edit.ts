import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import {type Command} from '../types';
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
    name: 'club-edit',
    description: 'editing club',
    options: [{
      name: 'description',
      description: 'editing a club description',
      type: 3,
    },
      {
        name: 'name',
        description: 'change a name',
        type: 3,
      }]
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      const users_db = db.collection('clubs')
      const money = db.collection('users')
      const money_request = await money.findOne({login: interaction.user.id})
      const payment = 300

      let description = <string>args.filter((arg) => arg.name === 'description')[0]?.value
      let name = <string>args.filter((arg) => arg.name === 'name')[0]?.value

      const user_coins = money_request!.coins

      if(!name && description) await description_call()
      if(!description && name) await name_call()

      async function description_call() {

       await users_db.updateOne({
          owner: interaction.user.id
        }, {
          $set: {
            description,
          }
        })

        await money.updateOne({
          login: interaction.user.id
        }, {
          $set: {
            coins: user_coins - payment
          }
        })

        await interaction.followUp({
          embeds: [{
            color: '#00ff00',
            description: 'Success. Description changed..'
          }]
        })
      }

      async function name_call () {
        await users_db.updateOne({
          owner: interaction.user.id
        }, {
          $set: {
            name,
        }
        })

        await money.updateOne({
          login: interaction.user.id
        }, {
          $set: {
            coins: user_coins - payment
          }
        })

        await interaction.followUp({
          embeds: [{
            color: '#00ff00',
            description: 'Success. Name changed..'
          }]
        })
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
