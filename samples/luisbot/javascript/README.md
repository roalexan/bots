# Prerequisites

- Account on [luis.ai](https://www.luis.ai/) site
- [Node](https://nodejs.org/en/) 8+ (make sure you can type 'npm' at the command prompt)
- [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases/tag/v4.0.15-alpha) 4.x (use the *.exe for Windows; use the *-mac.zip for macOS)

# Setup Instructions

1. Download repo contents

   - Create a local working directory which we'll refer to as `<working-dir>`
   - Click the **Clone or download** button on the upper-right of this page, then click **Download ZIP**
   - Save and extract the zip into `<working-dir>`
   
   > If you have Git, you can clone the repo using the command `git clone https://github.com/Azure/prebuilt-aI-for-conversational-bot.git`

1. Set up LUIS

   - Navigate to **http://luis.ai/** and sign in
   - Click **Import new app**
   - Click **Browse** and select **`<working-dir>`\bots\samples\luisbot\javascript\projectplanner.json** for App JSON file
   - Type a name for your app
   - Click **Done** (Note that this takes about one minute)
   - Click **Train** on the upper-right
   - Click **Publish** on the upper-right, select the **Production** slot, and click **Publish**
   - Scroll down to view the endpoint and make a note of the **app id** and **subscription key**. You will need them in the next section. For example:

1. Build and start bot

   - Open a command prompt and change the directory to **`<working-dir>`\bots\samples\luisbot\javascript**
   - Edit **.env** using your favorite editor or IDE
      - Replace `<YOUR-APP-ID>` with your **app id** from above
      - Replace `<YOUR-SUBSCRIPTION-KEY>` with your **subscription key** from above
   - Type `npm install`
   - Type `npm start`

1. Start emulator

   - Start emulator and select the menu options **File** > **Open Bot**
   - Select the file **`<working-dir>`\prebuilt-aI-for-conversational-bot\luis-bot-es6.bot**

# Usage

Type the following sample sentences into the emulator to see the intents, confidence score, and entities for your published LUIS app.

- Type **Show me all docs for Oracle**. You should see a response like:
  > top intent: **FindDocForProject**<br>
  > confidence score: **0.778712034**<br>
  > entities: **project**=wipro
- Type **Show me all people with Java programming skills**. You should see a response like:
  > top intent: **FindPeopleForProject**<br>
  > confidence score: **0.9460903**<br>
  > entities: **skill**=java
- Type **Show me all people who are free from September 2018 to November 2018**. You should see a response like:
  > top intent: **FindPeopleForProjectWithTime**<br>
  > confidence score: **0.9321173**<br>
  > entities: **datetime**=(2018-09-01,2018-11-01,P2M); **number**=2018, 2018
- Type **How are you?** You should see a response like:
  > top intent: **Greeting**<br>
  > confidence score: **0.9368477**<br>
  > entities: n/a
- Type **Help**. You should see a response like:
  > top intent: **Help**<br>
  > confidence score: **0.9752869**<br>
  > entities: n/a
- Type **What is the weather like today?** You should see a response like:
  > top intent: **None**<br>
  > confidence score: **0.572350144**<br>
  > entities: **datetime**=2018-07-18