import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Note, Response } from '../exports';
import { User_note } from '../exports';

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
    name: 'note',
    description: 'note to write',
    options: [
      {
        name: 'note',
        description: 'note to set',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Notes extends Response {
        private users_db = db.collection('notes');
        private readonly cooldown: 60000 = 60000;
        time!: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.main();
        }

        async main() {
          let note = <string>args.filter((arg) => arg.name === 'note')[0].value;
          let random_id = Math.floor(Math.random() * 123456789);

          const note_to_set = {
            time: this.time.getTime(),
            note: note,
            id: random_id,
          };

          let new_cooldown = this.time.getTime() + this.cooldown;

          await this._overwite_member_data(
            this.interaction.user.id,
            note_to_set,
            new_cooldown
          );

          this.reply_true('success!', { timestamp: this.time });
        }

        private async _overwite_member_data(
          member_id: string,
          note: Note,
          cooldown: number
        ) {
          if (!member_id || !note || !cooldown)
            throw new Error(
              `${member_id}, ${note}, ${cooldown} were not provided!`
            );

          const _get_member_data =
            (await this.users_db.findOne<User_note>({
              login: member_id,
            })) || ({} as User_note);

          let new_cooldown = (_get_member_data!.cooldown || 0) + cooldown;

          let notes = _get_member_data!.notes || [];

          notes.push(note);

          if (!_get_member_data!.login) {
            this.users_db.insertOne({
              login: member_id,
              notes,
              cooldown: new_cooldown,
            });
          } else {
            this.users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  notes,
                  cooldown: new_cooldown,
                },
              }
            );
          }
        }
      }

      new Notes();
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
