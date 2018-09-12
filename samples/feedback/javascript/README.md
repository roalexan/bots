# TypeScript Feedback Sample

## Prerequisites

- [Bot Framework emulator](https://github.com/Microsoft/BotFramework-Emulator)
- NodeJS

## Install

- create `repo-dir` (local repo directory)
- cd `repo-dir`
- git clone https://github.com/roalexan/bots.git
- cd `repo-dir`\bots\samples\feedback\typescript

> This project uses a private npm repo. For access, please contact chstone.
>
> Create a file called **.npmrc** in your project root directory and add the following to it:
>
> ```
> registry=https://msdata.pkgs.visualstudio.com/_packaging/botbuilder-utils/npm/registry/
> always-auth=true
> ```
>
> Run the following in your project root directory: `vsts-npm-auth -config .npmrc`.
>
> If you do not have `vsts-npm-auth`, you can install it with: `npm install -g vsts-npm-auth --registry https://registry.npmjs.com --always-auth false`

- npm install botbuilder-feedback@preview (the Feedback Collection Middleware node module)
- npm install

## Usage

- npm start (shows `app listening on 3978`)
- from emulator, select `http://localhost:3978/api/messages`
- click `CONNECT`
- type anything, bot will provide feedback options on the response