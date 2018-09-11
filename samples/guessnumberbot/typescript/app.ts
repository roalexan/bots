import { BotFrameworkAdapter, MemoryStorage, BotContext, ConversationState } from 'botbuilder';
import * as restify from 'restify';

// Create HTTP server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const MIN = 0;
const MAX = 10;

interface State {
  sessionState: string;
  low: number;
  high: number;
  guess: number;
}

const conversationState = new ConversationState<State>(new MemoryStorage());

// middleware code that writes back the conversation state at the end of the "turn"
adapter.use(conversationState);

async function init(context: BotContext) {
  const state = await conversationState.read(context);
  state.low = MIN;
  state.high = MAX;
  await showInstructions(context);
  await askReady(context);
  state.sessionState = 'askReady';
}

async function showInstructions(context: BotContext) {
  const state = await conversationState.read(context);
  await context.sendActivity('Please think of a number between ' + (state.low + 1) + ' and ' + state.high + ' and I will try to guess it.');
}

async function askReady(context: BotContext) {
 await context.sendActivity('Type "ready" when you are ready to start.');
}

async function askPlayAgain(context: BotContext) {
  await context.sendActivity('Would you like to play again?');
}

// Listen for incoming requests
server.post('/api/messages', (req, res) => {
  // Route received request to adapter for processing
  adapter.processRequest(req, res, async (context) => {
    if (context.request.type === 'conversationUpdate') {
      for (let member of context.request.membersAdded!) {
        if (member.id !== context.request.recipient.id) { // check if member id equals the bot's id
          await context.sendActivity('Welcomeeeee to the guess number bot!');
          await init(context);
        }
      }
    }
    if (context.request.type === 'message') {
      let message = (context.request.text || '').trim().toLowerCase();
      const state = await conversationState.read(context);
      if (state.sessionState === 'askReady') {
        if (message.startsWith('ready')) {
          state.sessionState = 'playing';
        } else {
          await askReady(context);
        }
      }
      if (state.sessionState === 'playing') {
        if (message.startsWith('yes')) {
          state.low = state.guess;
        } else if (message.startsWith('no')) {
          state.high = state.guess;
        }
        state.guess = Math.floor(((state.high + state.low) / 2));
        if ((state.high - state.low) === 1) {
          await context.sendActivity('The number is ' + state.high);
          await askPlayAgain(context);
          message = '';
          state.sessionState = 'askplayagain';
        } else {
          await context.sendActivity('Is it greater than ' + state.guess + '?');
        }
      }
      if (state.sessionState === 'askplayagain') {
        if (message.startsWith('yes')) {
          await init(context);
        } else if (message.startsWith('no')) {
          await context.sendActivity('Thanks for playing. Goodbye!');
        } else if (message !== '') {
          await askPlayAgain(context);
        }
      }
    }
  });
});
