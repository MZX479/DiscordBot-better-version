import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Ban_type, Response } from '../exports';
import { User_ban_type } from '../exports';

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
    name: 'ban',
    description: 'ban a member',
    options: [
      {
        name: 'reason',
        description: 'provide a reason',
        type: 3,
        required: true,
      },
      {
        name: 'mention',
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
    try {
      class Ban extends Response {
        readonly users_db = db.collection('bans');
        readonly time = new Date();
        constructor() {
          super(interaction);

          this.main();
        }

        async main() {
          let info = await this.info();

          if (interaction.user.id === info.member.id)
            return this.reply_false('You cannot ban yourself!', {
              timestamp: this.time,
            });

          if (!info.reason) info.reason = `\`Reason was not provided!\``;

          let ban: Ban_type = {
            moderator: interaction.user.tag,
            time: this.time,
            reason: info.reason,
          };

          await this._db_work(info.member.id, ban);

          await interaction.guild!.members.ban(info.member, {
            reason: info.reason,
          });

          this.reply_true('Success', { timestamp: this.time });
        }

        async info() {
          let reason = <string>(
            args.filter((arg) => arg.name === 'reason')[0].value
          );
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'mention')[0]?.member
          );
          let member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          let infoReturn = {
            reason,
            member,
            member_id,
          };

          return infoReturn;
        }

        private async _db_work(member_id: string, ban: Ban_type) {
          const _get_members_data =
            (await this.users_db.findOne<User_ban_type>({
              victim: member_id,
            })) || ({} as User_ban_type);

          let bans = _get_members_data.bans || [];

          bans.push(ban);

          if (!_get_members_data.victim) {
            await this.users_db.insertOne({
              victim: member_id,
              bans,
            });
          } else {
            await this.users_db.updateOne(
              {
                victim: member_id,
              },
              {
                $set: {
                  bans,
                },
              }
            );
          }
        }
      }

      new Ban();
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
