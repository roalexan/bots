import { AutoSaveStateMiddleware, ActionTypes, ActivityTypes, BotFrameworkAdapter, CardAction, ConversationState, MemoryStorage, MessageFactory } from 'botbuilder';
// import { ActionTypes, CardAction, CardFactory, MessageFactory, TurnContext } from 'botbuilder';
import { Feedback, FeedbackAction, Message } from 'botbuilder-feedback';
// import { CardAction } from 'botframework-connector/lib/generated/models/mappers';
// import * as doh from 'botbuilder-feedback';
import * as express from 'express';
import { GREETING, REPLY, USAGE } from "./text";

// Create HTTP server
const server = express();
const port = process.env.PORT || 3978;
server.listen(port, () => console.log(`${server.name} listening on ${port}`));

const conversationState = new ConversationState(new MemoryStorage()); // all defaults
const autoSaveState = new AutoSaveStateMiddleware(conversationState);
// const feedback = new Feedback({ conversationState }); // customization available here

// const feedbackActions: FeedbackAction[] = ['👍 good', '👎 bad', '👌 ok', '✌ victory'];
// const feedbackActions: FeedbackAction[] = ['Poor', '👍 Fair', '👎 Good', '👌 Very Good', '✌ Excellent'];
// const feedbackActions: FeedbackAction[] = ['✔ Correct', '✖ Incorrect'];
// const feedbackActions: FeedbackAction[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const feedbackActions: FeedbackAction[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
// const feedbackActions: FeedbackAction[] = ['Not at all helpful', 'Slightly helpful', 'Somewhat helpful', 'Very helpful', 'Extremely helpful'];
// ✔✖❌️
// const feedbackActions: FeedbackAction[] = ['Strongly disagree', 'Somewhat disagree', 'Somewhat agree', 'Strongly agree'];
/*
const feedbackActions: FeedbackAction[] = [
    { title: "😩 Poor", type: ActionTypes.ImBack, value: "😩 Poor" },
    { title: "😟 Fair", type: ActionTypes.ImBack, value: "😟 Fair" },
    { title: "😐 Good", type: ActionTypes.ImBack, value: "😐 Good" },
    { title: "😊 Very Good", type: ActionTypes.ImBack, value: "😊 Very Good" },
    { title: "😄 Excellent", type: ActionTypes.ImBack, value: "😄 Excellent" },
];
*/

// const feedbackResponse: Message = "you done good";
const feedbackResponse: Message = {text: "you done goooood", speak: "you done goooood" };

const dismissAction: FeedbackAction = "ignore!!!";

// const promptFreeForm: boolean = true;
// const promptFreeForm: string[] = ['✖ Incorrect'];
const promptFreeForm: string[] = ['3'];

const freeFormPrompt: Message = "ok, what else you got?";

// const feedback = new Feedback({ conversationState, feedbackActions, feedbackResponse, dismissAction, promptFreeForm, freeFormPrompt });

const feedback = new Feedback(conversationState, { promptFreeForm: true });

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
  }).use(autoSaveState, feedback);

// Handler for every conversation turn
const botLogic = async (context: any) => {
    if (context.activity.type === ActivityTypes.ConversationUpdate && context.activity.membersAdded[0].name === 'Bot') {
        // Welcome message here, bot will message you first
        await context.sendActivity(GREETING);
        await context.sendActivity(USAGE);
    } else if (context.activity.type === 'message') {
        // bot will show text with 2 suggested action buttons (good answer / bad answer)
        // if user clicks a button, the response is captured as a trace activity, along with original question and original bot response.
        // if user does not click a button, normal bot processing occurs
        // const reply = REPLY + context.activity.text;
        const reply = 'Mostly cloudy. A slight chance of showers this morning. Much cooler with highs in the mid 70s. East winds 5 to 10 mph. Gusts up to 20 mph this morning. Chance of rain 20 percent.';
        const message = Feedback.createFeedbackMessage(context, reply);
        await context.sendActivity(message);
    }
  };

// Listen for incoming requests
server.post('/api/messages', (req, res, next) => {
  adapter.processActivity(req, res, botLogic).catch((err) => {
      console.error("Sorry, something unexpected happened", err);
      next(err);
  });
});
