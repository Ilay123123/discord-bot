import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import fetch from 'node-fetch';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

// In-memory list to store jokes
const jokesList = [];

// Create a new Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Function to fetch a random quote
async function fetchQuote() {
  const response = await fetch('https://dummyjson.com/quotes/random');
  const data = await response.json();
  return data.quote;
}

// Function to fetch a list of jokes
async function fetchJokes() {
  const response = await fetch('https://v2.jokeapi.dev/joke/Any?amount=5'); // Fetch 5 jokes
  const data = await response.json();
  return data;
}

// Log when the bot is online
client.once('ready', () => {
  console.log('Bot is online!');
});

// Respond to messages with a greeting, quote, or jokes
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Respond to "hello"
  if (message.content.toLowerCase() === 'hello') {
    message.reply(`Hello, ${message.author.username}!`);
  }

  // Respond to "!quote" with a random quote
  if (message.content.toLowerCase() === '!quote') {
    const quote = await fetchQuote();
    message.reply(quote);
  }

  // Add a joke with "!add <joke>"
  if (message.content.startsWith('!add ')) {
      const joke = message.content.slice(5).trim(); // Extract the joke from the message
      if (joke) {
         jokesList.push(joke);
         message.reply('Joke added!');
      } else {
            message.reply('Please provide a joke after the !add command.');
      }
    }

// List all jokes with "!list"
  if (message.content.toLowerCase() === '!list') {
      if (jokesList.length > 0) {
          message.reply(`Here are the jokes:\n\n${jokesList.join('\n')}`);
       } else {
            message.reply('No jokes have been added yet.');
        }
    }

  // Respond to "!jokes" with a list of jokes
  if (message.content.toLowerCase() === '!jokes') {
    const jokesData = await fetchJokes();
    if (jokesData.error) {
      message.reply('Sorry, I could’t fetch jokes at the moment.');
    } else {
      // Create a response with the jokes
      const jokes = jokesData.jokes.map((joke) => {
        if (joke.type === 'single') {
          return joke.joke;
        } else {
          return `${joke.setup}\n${joke.delivery}`;
        }
      }).join('\n\n');

      message.reply(`Here are some jokes for you:\n\n${jokes}`);
    }
  }
});

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // Handle the "/quotes" command
    if (name === 'quotes') {
      const quote = await fetchQuote();
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Here's a random quote: "${quote}"`,
        },
      });
    }

    // Handle the "/jokes" command
    if (name === 'jokes') {
      const jokesData = await fetchJokes();
      if (jokesData.error) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Sorry, I could’t fetch jokes at the moment.',
          },
        });
      } else {
        // Create a response with the jokes
        const jokes = jokesData.jokes.map((joke) => {
          if (joke.type === 'single') {
            return joke.joke;
          } else {
            return `${joke.setup}\n${joke.delivery}`;
          }
        }).join('\n\n');

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Here are some jokes for you:\n\n${jokes}`,
          },
        });
      }
    }

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `hello world`,
        },
      });
    }

    // "challenge" command
if (name === 'challenge' && id) {
    // Interaction context
    const context = req.body.context;
    // User ID is in user field for (G)DMs, and member for servers
    const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
    // User's object choice
    const objectName = req.body.data.options[0].value;

    // Create active game using message ID as the game ID
    activeGames[id] = {
        id: userId,
        objectName,
    };

    return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
        content: `Rock papers scissors challenge from <@${userId}>`,
        components: [
        {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
            {
                type: MessageComponentTypes.BUTTON,
                // Append the game ID to use later on
                custom_id: `accept_button_${req.body.id}`,
                label: 'Accept',
                style: ButtonStyleTypes.PRIMARY,
            },
            ],
        },
        ],
    },
    });
}

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

// Start the express server
app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

// Log in to Discord with your bot token
client.login(process.env.TOKEN);
