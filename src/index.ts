import { Intents, Client } from 'discord.js';
import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import { token } from './config/token.json';
import f from './config/modules';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Command } from './types';

const bot = new Client({
  intents: Object.values(Intents.FLAGS),
});

MongoClient.connect('mongodb://localhost:27017', (err, mongo) => {
  fs.readdir('./events', async (err, events_dir) => {
    for (let event_file of events_dir) {
      if (!event_file.endsWith('.js')) continue;

      let event_func = require('./events/' + event_file).default;
      let event_name = event_file.split(' ')[0].replace('.js', '');

      bot.on(event_name, event_func.bind(null, bot, f, mongo));
    }
  });
});

fs.readdir('./commands', async (err, commands_dir) => {
  for (let command_file of commands_dir) {
    if (!command_file.endsWith('.js')) continue;
    let { command } = await import('./commands/' + command_file);
    const Command = <Command>command;

    f.commands.push(Command);
  }

  let rest: REST = new REST({
    version: '9',
  }).setToken(token);

  try {
    console.log('Started loading /-commands');
    await rest.put(
      Routes.applicationGuildCommands(
        '827619223714398278',
        '827620881529307217'
      ),
      {
        body: f.commands.map((command) => command.slash),
      }
    );
    console.log('Succesfully loaded /-commands');
  } catch (error) {
    console.log('Error while loading commands');
    console.log(error);
  }
});

bot.login(token);
