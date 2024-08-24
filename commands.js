import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Define the "quotes" command
const QUOTES_COMMAND = {
  name: 'quotes',
  description: 'Get a random quote',
  type: 1,
};

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: [
        { name: 'Rock', value: 'rock' },
        { name: 'Paper', value: 'paper' },
        { name: 'Scissors', value: 'scissors' },
      ],
    },
  ],
  type: 1,
};

// Define the "jokes" command
const JOKES_COMMAND = {
  name: 'jokes',
  description: 'Get a list of random jokes',
  type: 1,
};

// Register all commands
const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, QUOTES_COMMAND, JOKES_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
