import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { UserType } from '../types';

interface Content {
  author: string;
  member: string;
}

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
        name: 'ping',
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
      class Rep extends Response {
        private readonly channel = bot.channels.cache.get(
          '1015511147480371232'
        );
        private readonly cooldown: 10800000 = 10800000;
        constructor() {
          super(interaction);
          this.main();
        }

        async main() {
          const time = new Date().getTime();

          const set_cooldown = <number>time + this.cooldown;

          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'ping')[0]?.member
          );

          let member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );

          if (!member && !member_id) {
            this.reply_false('Please provide a member');
            return;
          }

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          const db = new DB(member.id);

          const _get_data = await db._get_data();

          if (
            _get_data._get_author_data?.rep_cooldown &&
            _get_data._get_author_data!.rep_cooldown > time
          ) {
            this.reply_false('Your cooldown has not expired!');
            return;
          }

          const check = await this.check_buttons();

          switch (check.customId) {
            case 'yes':
              await db._overwrite_data(set_cooldown);
              await this.log({
                author: interaction.user.tag,
                member: member.user.tag,
              });
              await this.reply_true(
                `\`${interaction.user.tag}\` added reputation to \`${member.user.tag}\``
              );
              break;
            case 'no':
              this.reply_true('See you!');
              return;
            default:
              break;
          }
        }

        async check_buttons() {
          const buttons = [
            new Discord.MessageButton()
              .setStyle('SUCCESS')
              .setLabel('Yes')
              .setCustomId('yes'),
            new Discord.MessageButton()
              .setStyle('DANGER')
              .setLabel('No')
              .setCustomId('no'),
          ];

          let ask_answer = <Discord.Message>await interaction.followUp({
            embeds: [
              {
                color: '#ff0000',
                author: {
                  name: interaction.user.tag,
                  icon_url: interaction.user.avatarURL({ dynamic: true })!,
                },
                description: 'Are you sure?',
                timestamp: new Date(),
              },
            ],
            components: [
              new Discord.MessageActionRow().addComponents(...buttons),
            ],
            fetchReply: true,
          });

          let await_answer = await ask_answer.awaitMessageComponent({
            filter: (button) => interaction.user.id === button.user.id,
            time: 1800000,
          });

          return await_answer;
        }

        async log(content: Content) {
          (this.channel! as Discord.TextChannel).send({
            embeds: [
              {
                author: {
                  name: interaction.user.tag,
                  icon_url: interaction.user.avatarURL({ dynamic: true })!,
                },
                color: '#000000',
                description: `\`${content.author}\` added reputation to \`${content.member}\``,
                timestamp: new Date(),
              },
            ],
          });
        }
      }

      class DB {
        private readonly reputation_point: 1 = 1;
        member_id!: string;
        author_message: string = interaction.user.id;
        constructor(member_id: string) {
          this.member_id = member_id;
        }
        async _get_data() {
          const users_db = db.collection('users');
          const _get_member_data = await users_db.findOne<UserType>({
            login: this.member_id,
          });

          const _get_author_data = await users_db.findOne<UserType>({
            login: this.author_message,
          });

          const info_return = {
            users_db,
            _get_member_data,
            _get_author_data,
          };

          return info_return;
        }

        async _overwrite_data(cooldown: number) {
          if (!cooldown) throw new Error(`${cooldown} was not provided!`);
          const _get_data = await this._get_data();

          const new_user_cooldown =
            <number>(_get_data._get_author_data?.rep_cooldown || 0) + cooldown;

          const new_user_reputation =
            <number>(_get_data._get_member_data?.reputation || 0) +
            this.reputation_point;

          if (!_get_data._get_member_data?.login) {
            _get_data.users_db.insertOne({
              login: this.member_id,
              reputation: new_user_reputation,
            });
          } else {
            _get_data.users_db.updateOne(
              {
                login: this.member_id,
              },
              {
                $set: {
                  reputation: new_user_reputation,
                },
              }
            );
          }

          if (!_get_data._get_author_data?.login) {
            _get_data.users_db.insertOne({
              login: this.author_message,
              rep_cooldown: new_user_cooldown,
            });
          } else {
            _get_data.users_db.updateOne(
              {
                login: this.author_message,
              },
              {
                $set: {
                  rep_cooldown: new_user_cooldown,
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
