import { ActivityTypes, BotFrameworkAdapter } from 'botbuilder';
import * as express from 'express';
import { GREETING, REPLY, USAGE } from "./text";

// Create server
const server = express();
const port = process.env.PORT || 3978;
server.listen(port, () => console.log(`${server.name} listening on ${port}`));

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

// Handler for every conversation turn
const botLogic = async (context: any) => {
  if (context.activity.type === ActivityTypes.ConversationUpdate && context.activity.membersAdded[0].name === 'Bot') {
      // Welcome message here, bot will message you first
      await context.sendActivity(GREETING);
      await context.sendActivity(USAGE);
  } else if (context.activity.type === 'message') {
      const utterance = (context.activity.text || '').trim().toLowerCase();
      console.log(`utterance: ${utterance}`);
      const response = REPLY + utterance;
      await context.sendActivity(response);
  }
};

// Listen for incoming requests
server.post('/api/messages', (req, res, next) => {
  adapter.processActivity(req, res, botLogic).catch((err) => {
      console.error("Sorry, something unexpected happened", err);
      next(err);
  });
});
