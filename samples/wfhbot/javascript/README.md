# Introduction 
WFH bot or ISAB (Intelligent Scheduling Assistant Bot)

# Getting Started

OAuth2 scopes (Graph permissions)
- `openid`: Perform sign-in by using OpenID Connect
- `profile`: Access user info
- `offline_access`: Refresh auth token
- `User.Read`: Enable logon and read user profile
- `Calendars.ReadWrite`: Read and write user's calendars
- `Calendars.ReadWrite.Shared`: Read and write shared calendars
- `Group.ReadWrite.All`: Read and write group calendars. This requires Admin permission

## Prerequisites
* Install [Node.js](https://nodejs.org/)


## Installation Process
### Create a bot service at Azure Portal
1. Create a resource group and add **Bot Channel Registration**
2. Go to https://apps.dev.microsoft.com, select the bot just created and do followings:
    1. Copy Application id to *.env* `MicrosoftAppId`
    2. Generate new password and copy to *.env* `MicrosoftAppPassword`
    3. Add platform and select Web. To redirect URLs, add:
    `https://token.botframework.com/.auth/web/redirect`
    4. Add necessary Graph permissions to **Delegated Permissions**
    5. Save
3. Go back to the Bot Channels Registration resource you created and change **Settings** as follows:
    1. Add **OAuth Connection Settings** at the bottom
    2. Enter your bot name
    3. Select **Azure Active Directory v2** from **Service Provider** and enter your bot's `MicrosoftAppId` and `MicrosoftAppPassword` to **Client id** and **Client secret**, respectively
    4. Enter **common** to Tenant ID
    5. Add `openid profile offline_access User.Read Calendars.ReadWrite Calendars.ReadWrite.Shared` to **Scopes**
    6. Save
    7. You can test OAuth Connection from the OAuth Connection setting you just created. Browser will show Token if the test succeeded
    
    

1. Download this repo
2. To install all the necessary node packages for this repo, open a command prompt or terminal at the folder you downloaded and run:
    ```
    npm install
    ```

## Debug and Run
Use [Bot Framework Emulator](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-3.0) to debug and run your bot locally
1. To read local environment file, install `dotenv` node package if you don't have yet
    ```
    npm install dotenv
    ```
2. Create ***.env*** file to the repo root folder and add following variables to the file:
    ```
    MicrosoftAppId=
    MicrosoftAppPassword=
    LuisAppId=YOUR_LuisAppId_VALUE
    LuisAPIKey=YOUR_LuisAPIKey_VALUE
    LuisAPIHostName=YOUR_LuisAPIHostName_VALUE
    AzureWebJobsStorage=YOUR_AzureWebJobsStorage_VALUE
    ```
    You can leave Microsoft App ID and Microsoft App Password blank for the local testing. Luis and Azure Web Jobs Storage setting values can be found on Application Settings at your bot resource from [Azure portal](https://portal.azure.com)
3. To start your bot with `dotenv` package preloaded, navigate to the repo folder from a command prompt or terminal and run:
    ```
    node -r dotenv/config app.js
    ```
4. Download and run [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator)
5. To connect to a bot running locally,
    1. Click create a new bot configuration link in the emulator window
    2. Type `http://localhost:3978/api/messages` into the address bar
    3. Click Save and connect. You won't need to specify Microsoft App ID and Microsoft App Password at this point

## Publish
- If you have setup continuous integration from Web App Bot resource at Azure Portal, your bot will automatically deployed when new changes are pushed to the source repository.
- Otherwise, run following command to push your changes back to your bot
    ```
    npm run azure-publish
    ```
At Kudu, from site\wwwroot, install packages 

## Future work
- VM manager bot: resizing storage of a VM, etc.
    - TODO: check ARM(Azure Resource Manager) template ([link](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates))

# Links
**Bots**
- A tutorial for building web app bot w/ LUIS and Node.js ([link](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-nodejs-tutorial-build-bot-framework-sample))
- Debug with the Bot Framework Emulator ([link](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-3.0))

**LUIS**
- An AI project planning chatbot ([link](https://github.com/Azure/prebuilt-ai-for-conversational-bot/))

**Authentication and Connection**
- Outlook REST API & Azure AD v2 authentication endpoint ([link](https://docs.microsoft.com/en-us/previous-versions/office/office-365-api/api/version-2.0/use-outlook-rest-api#ShortRegAuthWorkflow))
- Microsoft Graph Javascript Client Lib ([link](https://github.com/microsoftgraph/msgraph-sdk-javascript))
- Write a Node.js app to get Outlook mail, calendar, and contacts ([link](https://docs.microsoft.com/en-us/outlook/rest/node-tutorial), [example](https://github.com/jasonjoh/node-tutorial))
- Add authentication to your Bot ([link](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-tutorial-authentication?view=azure-bot-service-3.0))
- Testing authentication to your bot using the Bot Framework Emulator ([link](https://blog.botframework.com/2018/08/28/testing-authentication-to-your-bot-using-the-bot-framework-emulator/))
- AuthBot for Node.js ([link](https://github.com/CatalystCode/node-authbot))
