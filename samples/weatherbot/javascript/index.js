const { ActivityTypes, BotFrameworkAdapter, BotStateSet, ConversationState, MemoryStorage, TurnContext, UserState } = require('botbuilder');
const { config } = require('dotenv');
const express = require('express')
const request = require('superagent')
const { GREETING, REPLY, USAGE } = require('./text');

const HOST = 'http://api.openweathermap.org';

// load local dev variables
config({path: `${__dirname}/.env`});

const openWeatherMapAPIKey = process.env.OPENWEATHERMAP_API_KEY;
if (openWeatherMapAPIKey === '<YOUR-API-KEY>') {
  throw new Error('OPENWEATHERMAP_API_KEY not set. Please set in the .env file.');
}

// Create HTTP server
const server = express();
const port = process.env.PORT || 3978;
server.listen(port, () => console.log(`${server.name} listening on ${port}`));

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

// Handler for every conversation turn
// const botLogic = async (context: any) => {
  const botLogic = async (context) => {
  if (context.activity.type === ActivityTypes.ConversationUpdate && context.activity.membersAdded[0].name === 'Bot') {
      // Welcome message here, bot will message you first
      await context.sendActivity(GREETING);
      await context.sendActivity(USAGE);
  } else if (context.activity.type === 'message') {
      // bot will show text with 2 suggested action buttons (good answer / bad answer)
      // if user clicks a button, the response is captured as a trace activity, along with original question and original bot response.
      // if user does not click a button, normal bot processing occurs
      // const reply = REPLY + context.activity.text;

      const zipcode = (context.activity.text || '').trim().toLowerCase();
      console.log(`zipcode: ${zipcode}`);
      const url = `${HOST}/data/2.5/weather`;
      console.log(url, zipcode, openWeatherMapAPIKey);
      const resp = await request.post(url)
        .query({zip: zipcode, APPID: openWeatherMapAPIKey});
      console.log(resp.body);
      await context.sendActivity(JSON.stringify(resp.body, null, '\t'));
      await context.sendActivity(USAGE);
  }
};

// Listen for incoming requests
server.post('/api/messages', (req, res, next) => {
  adapter.processActivity(req, res, botLogic).catch((err) => {
      console.error("Sorry, something unexpected happened", err);
      next(err);
  });
});
