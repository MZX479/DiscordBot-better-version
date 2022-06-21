import {
  Client,
  CommandInteraction,
  CommandInteractionOption,
  Message,
} from 'discord.js';
import { MongoClient, ObjectId } from 'mongodb';

export type configType = {
  prefix: string;
  owner: string;
};

export type Command_type = (
  bot: Client,
  f: modulesType,
  mongo: MongoClient
) => Promise<any>;

export type modulesType = {
  config: configType;
  commands: Command[];
};

export type argsType = Readonly<CommandInteractionOption[]>;

export type UserType = {
  login?: string;
  coins?: number;
  daily_cooldown?: number;
  reputation?: number;
  isMuted?: {};
  mutes?: Array<{}>;
  rep_cooldown?: number;
};

export type slashType = {
  name: string;
  description: string;
  options?: Array<{
    name: string;
    description: string;
    required?: boolean;
    type: number;
  }>;
};

export type Command = {
  slash: slashType;
  ephemeral?: boolean;
  execute: (
    bot: Client,
    f: modulesType,
    mongo: MongoClient,
    args: argsType,
    interaction: CommandInteraction,
    message?: Message
  ) => Promise<any | void>;
};
