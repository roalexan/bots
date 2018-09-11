import { ActivityTypes, BotFrameworkAdapter, TranscriptLoggerMiddleware } from 'botbuilder';
import { CosmosDbTranscriptStore} from 'botbuilder-transcript-cosmosdb';
import { DocumentClient } from 'documentdb';
import { config } from 'dotenv';
import * as express from 'express';
import { GREETING, HELP, UNKNOWN, USAGE } from "./text";

config({ path: `${__dirname}/../.env` });

let command: string;
let state: string;

let listChannelId: string;

let getChannelId: string;
let getConversationId: string;

let deleteChannelId: string;
let deleteConversationId: string;

const serviceEndpoint = process.env.SERVICE_ENDPOINT;
const masterKey = process.env.MASTER_KEY;
if (serviceEndpoint === '<YOUR-SERVICE-ENDPOINT>') {
    throw new Error('SERVICE_ENDPOINT not set. Please set in the .env file.');
}
if (masterKey === '<YOUR-MASTER-KEY>') {
    throw new Error('MASTER_KEY not set. Please set in the .env file.');
}

// Create server
const server = express();
const port = process.env.PORT || 3978;
server.listen(port, () => console.log(`${server.name} listening on ${port}`));

// Create adapter
const client = new DocumentClient(serviceEndpoint, {masterKey});
const store = new CosmosDbTranscriptStore(client);
const logger = new TranscriptLoggerMiddleware(store);
const adapter = new BotFrameworkAdapter({
   appId: process.env.MICROSOFT_APP_ID,
   appPassword: process.env.MICROSOFT_APP_PASSWORD,
 })
.use(logger);

// Handler for every conversation turn
const botLogic = async (context: any) => {
    if (context.activity.type === ActivityTypes.ConversationUpdate && context.activity.membersAdded[0].name === 'Bot') {
        // Welcome message here, bot will message you first
        await context.sendActivity(GREETING);
        await context.sendActivity(USAGE);
    } else if (context.activity.type === 'message') {
        const input = (context.activity.text || '').trim().toLowerCase();
        console.log(`input: ${input}`);
        const words = input.split(" ");

        if (state === 'listChannelId') {
            listChannelId = words[0];
        } else if (state === 'getChannelId') {
            getChannelId = words[0];
        } else if (state === 'getConversationId') {
            getConversationId = words[0];
        } else if (state === 'deleteChannelId') {
            deleteChannelId = words[0];
        } else if (state === 'deleteConversationId') {
            deleteConversationId = words[0];
        } else {
            command = words[0];
        }

        if (command === 'log') {
            console.log('log');
        } else if (command === 'list') {
            if (!listChannelId) {
                listChannelId = words[1];
            }
            if (!listChannelId) {
                state = 'listChannelId';
                await context.sendActivity("Please enter the **Channel ID**.");
            } else {
                store.listTranscripts(listChannelId)
                .then((resp) => {
                    console.dir(resp.items, {depth: null, colors: true});
                })
                .catch ((e) => {
                    console.log(e);
                });
                command = '';
                state = '';
                listChannelId = '';
            }
      } else if (command === 'get') {
            if (!getChannelId) {
                getChannelId = words[1];
            }
            if (!getChannelId) {
                state = 'getChannelId';
                await context.sendActivity("Please enter the **Channel ID**.");
            }
            if (!getConversationId) {
                getConversationId = words[2];
            }
            if (!getConversationId) {
                state = 'getConversationId';
                await context.sendActivity("Please enter the **Conversation ID**.");
            } else {
                store.getTranscriptActivities(getChannelId, getConversationId)
                .then((resp) => {
                    console.dir(resp.items, {depth: null, colors: true});
                })
                .catch ((e) => {
                    console.log(e);
                });
                command = '';
                state = '';
                getChannelId = '';
                getConversationId = '';
            }
      } else if (command === 'delete') {
        if (!deleteChannelId) {
            deleteChannelId = words[1];
        }
        if (!deleteChannelId) {
            state = 'deleteChannelId';
            await context.sendActivity("Please enter the **Channel ID**.");
        }
        if (!deleteConversationId) {
            deleteConversationId = words[2];
        }
        if (!deleteConversationId) {
            state = 'deleteConversationId';
            await context.sendActivity("Please enter the **Conversation ID**.");
        } else {
            store.deleteTranscript(deleteChannelId, deleteConversationId)
            .then((resp) => {
                console.log("deleted");
            })
            .catch ((e) => {
                console.log(e);
            });
            command = '';
            state = '';
            deleteChannelId = '';
            deleteConversationId = '';
        }
      } else if (command === 'help') {
        await context.sendActivity(HELP);
      } else {
        await context.sendActivity(UNKNOWN);
      }
  }
};

// Listen for incoming requests
server.post('/api/messages', (req, res, next) => {
  adapter.processActivity(req, res, botLogic).catch((err) => {
      console.error("Sorry, something unexpected happened", err);
      next(err);
  });
});
