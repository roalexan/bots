const { TestAdapter } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { HttpTestPlayback } = require('botbuilder-http-test-recorder');
const { expect } = require('chai');

describe('My bot', () => {
  it('should provide the zipcode and get the weather', async () => {
    const testDataDirectory = './test/data';
    // const playback = new HttpTestPlayback({testDataDirectory});
    // const playback = new HttpTestPlayback(testDataDirectory = './test/data');
    const playback = new HttpTestPlayback({testDataDirectory: './test/data'});
    // const playback = new HttpTestPlayback();

    // parameters should match the settings used in `textRecorder.captureLuis()`
    const luisRecognizer = new LuisRecognizer({
      applicationId: 'testAppId',
      endpointKey: 'testKey',
    });

    const adapter = new TestAdapter(async (context) => {
      // logic under test goes here
      const results = await luisRecognizer.recognize(context);
      const intent = LuisRecognizer.topIntent(results);
      await context.sendActivity(intent);
    });

    // see naming above at rec:stop[:name]
    // console.log(playback.load('luis3.json'));
    playback.load('luis3.json');
    // playback.load('C:/microsoft/repos/bots/samples/testplayback/javascript/test/data/luis1.json');

    // execute the test logic
    await adapter
      .send('Show me all docs for Oracle')
      // .assertReply((resp) => console.log(resp));
      .assertReply((resp) => expect(resp.text).to.equal('FindDocForProject'));
  });
});
