const express = require('express');
const { GREETING, REPLY, USAGE } = require('./text');
const { CosmosDbTranscriptStore} = require('botbuilder-transcript-cosmosdb');
const { ActivityTypes, BotFrameworkAdapter, TranscriptLoggerMiddleware } = require('botbuilder');
//const { DocumentClient } = require('documentdb');
//import { DocumentClient } from 'documentdb';
import DocumentClient = require('documentdb');

// Create server
const server = express();
const port = process.env.PORT || 3978;
server.listen(port, () => console.log(`${server.name} listening on ${port}`));

const serviceEndpoint = 'https://rbacosmosdb.documents.azure.com:443/';
const masterKey = 'lYVOFTeEwSp7CxCjHWc4gywbvx2qebp6N2snZQtbMXSQfbXGeTeDEIS02V74O2olVK6s1QvSeDEJsvqDinWpgg==';
const client = new DocumentClient(serviceEndpoint, {masterKey});
const store = new CosmosDbTranscriptStore(client);

// Create adapter
const logger = new TranscriptLoggerMiddleware(store);
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
})
.use(logger);

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