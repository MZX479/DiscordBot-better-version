import { Client, Message } from 'discord.js';
import { MongoClient } from 'mongodb';
import { Command_type } from '../types';
import { modulesType } from '../types';

const event = async (
  bot: Client,
  f: modulesType | any,
  mongo: MongoClient,
  message: Message
) => {
  if (message.author.bot || message.channel.type != 'GUILD_TEXT') return;
  if (!message.content.startsWith(f.config.prefix)) return;

  let args = message.content.split(' ');
  let command_name = args[0].replace(f.config.prefix, '');
  args.splice(0, 1);
  console.log(f.commands);
  let command = f.commands.filter((command: any) =>
    command.slash.name.split(' ').includes(command_name)
  );

  let command_func = command.first();

  if (!command_func) return;

  await message.delete();
  command_func.execute(bot, f, mongo, args, message);
};

export default event;
