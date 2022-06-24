import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

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
    name: 'avatar',
    description: 'display member"s avatar',
    options: [{
      name: 'member',
      description: 'choose a member',
      type: 6,
      required: false
    }, {
      name: 'id',
      description: 'use id of current member',
      type: 3,
      required: false
    }]
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {

      async function start() {
        main()

        avatar_response()
      }
      async function main () {
        let member = <Discord.GuildMember>args.filter((arg) => arg.name === 'member')[0]?.member
        let member_id = <string>args.filter((arg) => arg.name === 'id')[0]?.value

        if(!member && member_id) {
          member = await interaction.guild!.members.fetch(member_id)
        }

        if(!member_id && !member) {
            return interaction.followUp({
              embeds: [{
                color: 'DARK_RED',
                description: 'provide a member please!'
              }]
            })
        }

        let return_info = {member}

        return return_info
      }

    async function avatar_response() {
        let info = await main()

        interaction.followUp({
          embeds:[{
            author: {
              name: interaction.user.tag,
              icon_url: interaction.user.avatarURL({dynamic: true})!
            },
            color: 'GREEN',
            image: {
              url: info.member?.user!.avatarURL({dynamic: true})
            },
            timestamp: new Date()
          }]
        })
    }

    start()
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