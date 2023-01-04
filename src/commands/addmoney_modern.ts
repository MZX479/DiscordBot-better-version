import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { UserType } from '../types';
import { Response } from '../exports';

interface Content {
  author: string;
  amount: number;
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
    name: 'addmoney',
    description: 'adding money',
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
      },
      {
        name: 'id',
        description: 'provide a member by his(er) id',
        type: 3,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class AddMoney extends Response {
        member_id!: string;
        readonly channel = <Discord.TextChannel>(
          bot.channels.cache.get('1015511147480371232')
        );
        readonly permission: string = 'ADMINISTRATOR';
        constructor() {
          super(interaction);
          this.member_id;
          this.main();
        }

        async main() {
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'member')[0]?.member
          );

          let member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );

          let amount = <number>(
            args.filter((arg) => arg.name === 'amount')[0].value
          );

          if (!member && !member_id) {
            this.reply_false('Please provide a member!');
            return;
          }

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
          }

          this.member_id = member.id;

          if (!member && member_id === undefined) {
            this.reply_false('This member does not exist!');
            return;
          }

          const db = new DB(member.id);

          const buttons = await this.check_buttons();

          switch (buttons.customId) {
            case 'yes':
              await db._overwrite_data(amount);
              await this.log({
                author: interaction.user.tag,
                amount,
                member: member.user.tag,
              });
              await this.reply_true(
                `\`${interaction.user.tag}\` added \`${amount}\` to \`${member.user.tag}\` ballance`
              );
              break;

            case 'no':
              await this.reply_true('See you!');
              return;
            default:
              break;
          }
        }

        async log(content: Content) {
          this.channel!.send(
            `\`${content.author}\` added \`${content.amount}\` to \`${content.member}\` ballance`
          );
        }

        async check_buttons() {
          const buttons = [
            new Discord.MessageButton()
              .setStyle('SUCCESS')
              .setCustomId('yes')
              .setLabel('Yes'),
            new Discord.MessageButton()
              .setStyle('DANGER')
              .setCustomId('no')
              .setLabel('No'),
          ];

          const ask_answer = <Discord.Message>await interaction.followUp({
            embeds: [
              {
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

          const await_answer = await ask_answer.awaitMessageComponent({
            filter: (button) => interaction.user.id === button.user.id,
            time: 180000,
          });

          return await_answer;
        }
      }

      class DB extends AddMoney {
        member_id: string;
        constructor(member_id: string) {
          super();
          this.member_id = member_id;
        }
        async _get_data() {
          const users_db = db.collection('users');

          const _get_data = await users_db.findOne<UserType>({
            login: this.member_id,
          });

          const user_ballance = <number | undefined>_get_data?.coins;

          const info_object = {
            users_db,
            _get_data,
            user_ballance,
          };

          return info_object;
        }

        async _overwrite_data(amount: number) {
          if (!amount) throw new Error(`${amount} was not provided!`);
          let _get_data = await this._get_data();

          const new_ballance = (_get_data.user_ballance || 0) + amount;

          if (!_get_data._get_data?.login) {
            _get_data.users_db.insertOne({
              login: this.member_id,
              coins: new_ballance,
            });
          }

          if (_get_data._get_data!.login) {
            _get_data.users_db.updateOne(
              {
                login: this.member_id,
              },
              {
                $set: {
                  coins: new_ballance,
                },
              }
            );
          }
        }
      }

      new AddMoney();
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
