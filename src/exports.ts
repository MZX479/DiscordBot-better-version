import * as Discord from 'discord.js';
import { ObjectId } from 'mongodb';

export class Response {
  interaction: Discord.CommandInteraction;
  time: Date;
  constructor(interaction: Discord.CommandInteraction) {
    this.interaction = interaction;
    this.time = new Date();
  }

  async get_embed(embed_options: {}) {
    if (!embed_options) throw new Error('Embed was not given');

    let interaction = this.interaction;

    let result_embed = new Discord.MessageEmbed({
      author: {
        name: interaction.user.tag,
        iconURL: interaction.user.avatarURL({ dynamic: true })!,
      },
      timestamp: this.time,

      ...embed_options,
    });

    return result_embed;
  }

  async reply_true(description: string, options: {} = {}) {
    if (!description)
      throw new Error('description was not provided (true_response)');

    let reply_true = this.get_embed({
      color: 'GREEN',
      description: description,
      ...options,
    });

    return this.send_embed(await reply_true);
  }

  async reply_false(
    description: string,
    options: {} = {},
    epheremal?: boolean
  ) {
    if (!description)
      throw new Error('description was not provided (false_response)');

    let reply_false = this.get_embed({
      color: 'RED',
      description: description,
      ...options,
    });

    return this.send_embed(await reply_false, epheremal);
  }

  async send_embed(
    completted_embed: Discord.MessageEmbed,
    epheremal?: boolean
  ) {
    if (!completted_embed) throw new Error('Embed was not given!');

    <Promise<Discord.Message>>this.interaction.followUp({
      embeds: [completted_embed],
      ephemeral: epheremal,
    });
  }
}

export interface Note {
  time: number;
  note: string;
  id: number;
}

export type User_note = Partial<{
  _id: ObjectId;
  login: string;
  notes: Note[];
  cooldown: number;
}>;

export interface Warn {
  time: number;
  moderator: string;
  reason: string;
}

export type User_warn = Partial<{
  _id: ObjectId;
  login: string;
  warns: Warn[];
}>;
