const express = require('express');
const { GREETING, REPLY, USAGE } = require('./text');
const { ActivityTypes, BotFrameworkAdapter, TranscriptLoggerMiddleware } = require('botbuilder');

const { CosmosDbTranscriptStore } = require('botbuilder-transcript-cosmosdb');
const { DocumentClient } = require('documentdb');

// Cosmos DB configuration
const serviceEndpoint = 'YOUR-COSMOSDB-ENDPOINT';
const masterKey = 'YOUR-MASTER-KEY';
const client = new DocumentClient(serviceEndpoint, { masterKey });

// Create server
const server = express();
const port = process.env.PORT || 3978;
server.listen(port, () => console.log(`${server.name} listening on ${port}`));

// Create adapter
const store = new CosmosDbTranscriptStore(client);
const logger = new TranscriptLoggerMiddleware(store);
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
// });
}).use(logger);

// Handler for every conversation turn
const botLogic = async (context) => {
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