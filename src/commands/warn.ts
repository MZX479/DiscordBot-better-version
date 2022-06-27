import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response, Warn, User_warn } from '../exports';

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
    name: 'warn',
    description: 'gives to user a warning',
    options: [
      {
        name: 'reason',
        description: 'reason of warn',
        type: 3,
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
        description: 'id of user',
        type: 3,
        required: false,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Warns extends Response {
        private users_db = db.collection('warns');
        time!: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.main();
        }

        async main() {
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'member')[0]?.member
          );
          let member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );

          let reason = <string>(
            args.filter((arg) => arg.name === 'reason')[0].value
          );

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          let warn: Warn = {
            moderator: interaction.user.tag,
            reason: reason,
            victim: member.id,
            time: this.time.getTime(),
          };

          await this.db_call(member.id, warn);

          this.reply_true('success', { timestamp: this.time });
        }

        async db_call(member_id: string, warn: Warn) {
          if (!member_id || !warn)
            throw new Error(`${member_id} or ${warn} were not provided!`);

          const _get_member_data =
            (await this.users_db.findOne<User_warn>({
              login: member_id,
            })) || ({} as User_warn);

          const warns = _get_member_data!.warns || [];

          warns.push(warn);

          if (!_get_member_data.login) {
            this.users_db.insertOne({
              login: member_id,
              warns,
            });
          } else {
            this.users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  warns,
                },
              }
            );
          }
        }
      }
      new Warns();
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
