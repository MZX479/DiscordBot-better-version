import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { UserType, type Command } from '../types';
import { Response } from '../exports';

interface Content {
  amount: number;
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
    name: 'givemoney',
    description: 'transfer amount of money',
    options: [
      {
        name: 'amount',
        description: 'amount of money',
        type: 4,
        required: true,
      },
      {
        name: 'ping',
        description: 'ping a member',
        type: 6,
      },
      {
        name: 'id',
        description: 'use a member_id',
        type: 3,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class GiveMoney extends Response {
        constructor() {
          super(interaction);
          this.main();
        }

        async main() {
          const amount = <number>(
            args.filter((arg) => arg.name === 'amount')[0].value
          );

          if (amount >= 10000000) {
            this.reply_false('Please provide an amount lower than 10kk!');
            return;
          }

          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'ping')[0]?.member
          );

          const member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );

          if (!member && !member_id) {
            this.reply_false('Please provide a member!');
            return;
          }

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          let db = new DB(member.id);

          let _get_data = await db._get_data();

          if (
            !_get_data._get_author_data?.coins ||
            _get_data._get_author_data.coins < amount
          ) {
            this.reply_false('You do not have enough coins!');
            return;
          }

          const buttons = await this.check_buttons();

          switch (buttons.customId) {
            case 'yes':
              await db._overwrite_data(amount);
              await this.log({
                author: interaction.user.id,
                amount,
                member: member.user.tag,
              });
              await this.reply_true(
                `\`${interaction.user.tag}\` succesfully transfered \`${amount}\`💸 to \`${member.user.tag}\` account!`
              );
              break;

            case 'no':
              this.reply_true('See you!');
              break;
            default:
              break;
          }
        }

        async check_buttons() {
          const buttons = [
            new Discord.MessageButton()
              .setLabel('Yes')
              .setStyle('SUCCESS')
              .setCustomId('yes'),
            new Discord.MessageButton()
              .setLabel('No')
              .setStyle('DANGER')
              .setCustomId('no'),
          ];

          let ask_answer = <Discord.Message>await interaction.followUp({
            embeds: [
              {
                author: {
                  name: interaction.user.tag,
                  icon_url: interaction.user.avatarURL({ dynamic: true })!,
                },
                color: '#000000',
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
            time: 180000,
          });

          return await_answer;
        }

        async log(content: Content) {
          interaction.followUp({
            embeds: [
              {
                author: {
                  name: interaction.user.id,
                  icon_url: interaction.user.avatarURL({ dynamic: true })!,
                },
                color: '#000000',
                description: `${content.author} transfered ${content.amount}💸 to ${content.member}`,
                timestamp: new Date(),
              },
            ],
          });
        }
      }

      class DB {
        member_id: string;
        readonly author_message: string = interaction.user.id;
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

        async _overwrite_data(amount: number) {
          if (!amount) throw new Error(`${amount} were not given!`);

          const _get_data = await this._get_data();

          const author_ballance =
            <number>_get_data._get_author_data?.coins - amount;

          const member_ballance =
            <number>(_get_data._get_member_data?.coins || 0) + amount;

          if (!_get_data._get_member_data?.login) {
            _get_data.users_db.insertOne({
              login: this.member_id,
              coins: member_ballance,
            });
          } else {
            _get_data.users_db.updateOne(
              {
                login: this.member_id,
              },
              {
                $set: {
                  coins: member_ballance,
                },
              }
            );
          }

          _get_data.users_db.updateOne(
            {
              login: this.author_message,
            },
            {
              $set: {
                coins: author_ballance,
              },
            }
          );
        }
      }

      new GiveMoney();
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
