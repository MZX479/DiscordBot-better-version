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
  let ban_words = ['хуй', 'очко', 'моча'];

  let message1 = message.content.split(' ');
};

export default event;
