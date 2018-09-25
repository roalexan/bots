import { TestAdapter } from 'botbuilder';
import { LuisRecognizer } from 'botbuilder-ai';
import { HttpTestPlayback } from 'botbuilder-http-test-recorder';

describe('My bot', () => {
  it('should ask a question', () => {
    const playback = new HttpTestPlayback();

    // parameters should match the settings used in `textRecorder.captureLuis()`
    const luisRecognizer = new LuisRecognizer({
      applicationId: 'testAppId',
      endpointKey: 'testKey',
    });

    const adapter = new TestAdapter(async (context) => {
      // logic under test goes here
      const results = luisRecognizer.recognize(context);
      const intent = LuisRecognizer.topIntent(results);
      if (intent === 'None') {
        await context.sendActivity('I do not understand');
      } else {
        await context.sendActivity('OK!');
      }
    });

    // see naming above at rec:stop[:name]
    playback.load('my-stored-http-session');

    // execute the test logic
    await adapter
      .send('hello world')
      .assertReply((resp) => expect(resp.text).to.equal('OK!'));
  });
});