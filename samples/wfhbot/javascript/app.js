// TODO Prompt user at the beginning ... https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-prompts?view=azure-bot-service-4.0&tabs=javascript
// TODO If I type "wfh on <DAY_OF_WEEK>", LUIS understands <DAY_OF_WEEK> as last week's (e.g. if type 'wed', it recognizes as last wed). Should fix that
require('dotenv').config();     // use local .env
const DEBUG = process.env.NODE_ENV == 'DEBUG';

var restify = require('restify');
var builder = require('botbuilder');

var graphHelper = require('./helpers/graph');

const {GREETING, GREETING_REPLY, GREETING_LOGIN, HELP, ERROR} = require('./scripts');

var connectionName; // OAuth Connection name
var botStorage;
if (DEBUG) {
    connectionName = 'isab-debug';  // use debug bot
    botStorage = new builder.MemoryBotStorage();
}
else {
    let botbuilder_azure = require("botbuilder-azure");
    connectionName = 'isab';
    let tableName = 'botdata';
    let azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env.AzureWebJobsStorage);
    botStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);
}

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector,
    (session) => {
        if (session.message.text == 'signout' || session.message.text == 'logout') {
            // User wants to sign out
            
            connector.getUserToken(session.message.address, connectionName, undefined, (err, result) => {
                if (result) {
                    session.send("Will sign you out...");
                    connector.signOutUser(session.message.address, connectionName, (err, result) => {
                        if (!err) {
                            session.send('You are signed out.');
                        }
                        else {
                            session.send('There was a problem signing you out.');                
                        }
                    });
                }
                else {
                    session.send("You are already signed out :-)");
                }
                graphHelper.updateSessionUserData(null, session, null);
                session.endDialog();                        
            });
        }
        else {
            session.send("I don't understand.");
            session.endDialog(HELP);
        }
    }
)
.set('storage', botStorage)
.on("event", (event) => {         // Handle 'event' activities
    if (event.name == 'tokens/response') {
        // received a TokenResponse, which is how the Azure Bot Service responds with the user token after an OAuthCard
        bot.loadSession(event.address, (err, session) => {
            let tokenResponse = event.value; //TODO
            session.send('You are now signed in');  // + tokenResponse.token);
            session.userData.activeSignIn = false;
        });
    }
});

bot.use({
    botbuilder: function(session, next) {
        next();
    },
    send: function(event, next) {
        if (event.source === "msteams" && event.attachments[0].contentType === "application/vnd.microsoft.card.signin") {
            event.attachments[0].content.buttons[0].type = "openUrl";
        }
        next();
    }
});

connector.onInvoke((event, cb) => {
    if (event.name == 'signin/verifyState') {
        // received a MS Team's code verification Invoke Activity
        bot.loadSession(event.address, (err, session) => {
            let verificationCode = event.value.state;
            // Get the user token using the verification code sent by MS Teams
            connector.getUserToken(session.message.address, connectionName, verificationCode, (err, result) => {
                session.userData.activeSignIn = false;
                graphHelper.updateSessionUserData(result.token, session, (getUserInfo) => {
                    if (getUserInfo) session.endDialog(session.userData.givenName + ", you are now signed in!");
                    else session.endDialog("You are now signed in!");
                });
                cb(undefined, {}, 200);
            });
        });
    } else {
        cb(undefined, {}, 200);
    }
});

// LUIS setup
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

/**
 * Parse entities recognized by LUIS
 * TODO handle multiple entities. e.g. "OOO in the morning and WFH for the rest of the day". use 'findAllEntities()'
 * see https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.entityrecognizer.html
 * TODO LUIS' datetimeV2 returns different types of data based on utterance, including: date, time, datetime, daterange, timerange, datetimerange, duration, and set.
 * https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-prebuilt-datetimev2
 * @param {*} entities
 * "entities":[
 *      {"entity":"wfh","type":"Calendar.Event","startIndex":0,"endIndex":2,"resolution":{"values":["WFH"]}},
 *      {"entity":"today","type":"builtin.datetimeV2.date","startIndex":4,"endIndex":8,"resolution":{"values":[{"timex":"2018-09-16","type":"date","value":"2018-09-16"}]}}
 *  ],
 */
function parseEntities(entities) {
    if (!entities) return {datetime: (new Date()).toISOString()};
    
    var entity = {};
    
    var event = builder.EntityRecognizer.findEntity(entities, "Calendar.Event");
    if (event) entity.event = event.resolution.values[0];
    
    var datetime = builder.EntityRecognizer.findEntity(entities, "builtin.datetimeV2.datetime");
    var date = builder.EntityRecognizer.findEntity(entities, "builtin.datetimeV2.date");
    var time = builder.EntityRecognizer.findEntity(entities, "builtin.datetimeV2.time");
    if (datetime) entity.datetime = datetime.resolution.values[0].value;
    else {
        var d;
        if (date) d = new Date(date.resolution.values[0].value);
        else d = new Date();
        // TODO if (time) datetime = d.setHours(hh,mm,ss).toISOString();    // time.resolution.values[0].value 
        // TODO else
        entity.datetime = d.toISOString();
    }
    return entity;
}

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
bot.dialog('GreetingDialog',
    (session) => {
        session.send(GREETING_REPLY);
        session.endDialog();
    }
).triggerAction({
    matches: 'Greeting'
});

bot.dialog('HelpDialog',
    (session) => {
        session.send(HELP);
        session.endDialog();
    }
).triggerAction({
    matches: 'Utilities.Help'
});

bot.dialog('CalendarShowDialog', [
    (session, args, next) => {
        // Check if signed in
        connector.getUserToken(session.message.address, connectionName, undefined, (err, result) => {
            if (result) {
                graphHelper.updateSessionUserData(result.token, session, (getUserData) => {
                    if (getUserData) next(args);
                    else session.endDialog("Something went wrong...:-(");
                });
            }
            else session.beginDialog('SigninPrompt');
        });
    },
    (session, args) => {
        session.send(JSON.stringify(args.intent));
        let entities = parseEntities(args.intent.entities);
        graphHelper.getEvents(session.userData.accessToken, entities, (res) => {
            if (res) {
                // List of events
                // TODO use HTML table for better readability (or use card?)
                if (res.length == 0) session.endDialog("You have no events");
                else {
                    session.send("Here it is");
                    session.endDialog(res.join("<br />"));   
                }
            }
            else {
                session.endDialog("Cannot get event data");
            }
        });
    }
]).triggerAction({
    matches: 'Calendar.Show'
});

bot.dialog('CalendarAddAbsenceDialog', [
    (session, args, next) => {
        // Check if signed in
        connector.getUserToken(session.message.address, connectionName, undefined, (err, result) => {
            if (result) {
                graphHelper.updateSessionUserData(result.token, session, (getUserData) => {
                    if (getUserData) {
                        session.send(JSON.stringify(args.intent.entities));
                        let entities = parseEntities(args.intent.entities);
                        session.send(entities.event + " " + entities.datetime);
                        if (entities && entities.event) {
                            session.send("I can help you with that");
                
                            session.dialogData.event = entities.event;
                            if (!entities.datetime) {
                                builder.Prompts.time(session, "When do you want me to add \'" + session.dialogData.event + "\'?");
                            }
                            else {
                                // Already have datetime info
                                session.dialogData.datetime = entities.datetime;
                                next();
                            }
                        }
                        else {
                            // unknown event
                            session.send("Sorry, I can't help with that.");
                            session.endDialog(HELP);
                        }
                    }
                    else session.endDialog("Something went wrong...:-(");
                });
            }
            else session.beginDialog('SigninPrompt');
        });
    },
    (session, results, next) => {
        if (results.response) {
            session.dialogData.datetime = builder.EntityRecognizer.resolveTime([results.response]);
            if (!session.dialogData.datetime) {
                // unknown time
                session.send("Sorry, I can't help with that.");
                session.endDialog(HELP);
            }
        }
        next();
    },
    (session) => {
        graphHelper.postEvent(session, session.dialogData, (success) => {
            if (success) {
                session.endDialog("Just created an event to your calendar!");
            }
            else {
                session.endDialog("Something went wrong :-(");
            }
        });
    }
]).triggerAction({
    matches: 'Calendar.Add.Absence'
}).reloadAction('StartOver', 'Ok, starting over.', {
    matches: /^start over$/i,
    confirmPrompt: "Are you sure?"
}).cancelAction('CancelAddAbsence', "Ok, event canceled.", {
    matches: /^(cancel|nevermind|nvm)/i,
    confirmPrompt: "Are you sure?"
});

bot.dialog('SigninPrompt',
    (session) => {
        // If there not is already a token, the bot can send an OAuthCard to have the user log in
        if (!session.userData.activeSignIn) {
            session.send("Let's get you signed in!");
            builder.OAuthCard.create(connector, session, connectionName, "Please sign in", "Sign in", (createSignInErr, signInMessage) =>
            {
                if (signInMessage) {
                    session.send(signInMessage);
                    session.userData.activeSignIn = true;
                } else {
                    session.userData.activeSignIn = false;
                    session.endConversation("Something went wrong trying to sign you in.");
                }     
            });
        }
        else {
            // Some clients require a 6 digit code validation so we can check that here
            session.send("Let's see if that code works...");
            let code = session.message.text.replace(/\D/g,'');  // keep only numbers
            connector.getUserToken(session.message.address, connectionName, code, (err2, tokenResponse) => {
                if (tokenResponse) {
                    session.userData.activeSignIn = false;
                    graphHelper.updateSessionUserData(tokenResponse.token, session, (getUserData) => {
                        if (getUserData) {
                            session.endDialog('It worked! ' + session.userData.givenName + ', you are now signed in');
                        }
                        else {
                            session.endDialog("hmm... I could log you in, but cannot get your information.");
                        }
                    });
                } else {
                    session.send("Hmm, that code wasn't right");
                }
            });
        }
    }    
).customAction({
    matches: /^(cancel|nevermind|nvm)/i,
    onSelectAction: (session) => {
        session.userData.activeSignIn = false;
        session.endConversation("Ok, signin canceled.");
    }
});

if (DEBUG) {
    var utils = require('./helpers/utils');

    bot.dialog('TestDialog', [
    (session) => {
        builder.Prompts.text(session, "Enter your test text");
    },
    (session, results) => {
        if (results.response) {
            var m = utils.convertTimezone(new Date(results.response), 'UTC', "Eastern Standard Time");
            session.send(utils.formatDate(m) + " " + utils.formatTime(m));
        }
        session.endDialog();
    } 
    ]).triggerAction({
        matches: 'Test'
    });
}
