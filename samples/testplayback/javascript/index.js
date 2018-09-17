const { TestAdapter } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { HttpTestPlayback } = require('botbuilder-http-test-recorder');
const { expect } = require('chai');

describe('My bot', () => {
  it('should ask a question', async () => {
    const testDataDirectory = './test/data';
    const playback = new HttpTestPlayback({testDataDirectory});

    // parameters should match the settings used in `textRecorder.captureLuis()`
    const luisRecognizer = new LuisRecognizer({
      applicationId: 'testAppId',
      endpointKey: 'testKey',
    });

    const adapter = new TestAdapter(async (context) => {
      // logic under test goes here
      const results = await luisRecognizer.recognize(context);
      const intent = LuisRecognizer.topIntent(results);
      if (intent === 'None') {
        await context.sendActivity('I do not understand');
      } else {
        await context.sendActivity('OK!');
      }
    });

    // see naming above at rec:stop[:name]
    // playback.load('C:\microsoft\repos\bots\samples\testplayback\javascript\luis1.json');
    playback.load('luis1.json');

    // execute the test logic
    await adapter
      .send('Show me all docs for Oracle')
      // .assertReply((resp) => expect(resp.text).to.equal('OK!'));
      .assertReply((resp) => expect(resp.topScoringIntent).to.equal('FindDocForProject'));
  });
});
