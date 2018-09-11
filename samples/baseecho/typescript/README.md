# CosmosDB Logging Sample

> This project uses private builds available only on a private npm repo. Before continuing make sure you run the following in this repo: `vsts-npm-auth -config .npmrc`.
>
> If you do not have `vsts-npm-auth`, you can install it with: `npm install -g vsts-npm-auth --registry https://registry.npmjs.com --always-auth false`

To configure this sample, edit the file in the root of the repo called `.env` with contents:

```ini
SERVICE_ENDPOINT = <YOUR-SERVICE-ENDPOINT>
MASTER_KEY = <YOUR-MASTER-KEY>
```

Install dependencies by running `npm install` from this directory. This will also generate a build.

Finally, start the app by running `npm start`.

Use [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator) to connect and chat with the sample bot.
