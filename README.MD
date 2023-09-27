Please note that to compile TypeScript code, you need to set up a TypeScript project and use the `tsc` (TypeScript Compiler) command. Here's how you can set up and compile the code:

1. Create a Project folder and cd cd into it, then close this repository into the folder.
```bash
mkdir tg2meta && cd tg2meta && git clone https://github.com/mrbarnk/telegram-2-meta-api ./
```

2. Install TypeScript and the necessary packages:

```bash
npm install
```

3. Cope `.env.example` file into .env, then replace the content in the file to yours.
You will need to sign up here (https://my.telegram.org/) to copy your telegram app_id and app_hash.

4. Run the TypeScript compiler to generate JavaScript files:

```bash
npm run build
```

This will compile your TypeScript code into JavaScript and place it in the `dist` directory.

5. You can then use the compiled JavaScript files in your Node.js application or deploy on the spot..

Here are the compiled JavaScript versions of the classes:

```javascript
// TradingBot.js
const MetaApi = require('metaapi.cloud-sdk');
const DatabaseManager = require('./DatabaseManager');

class TradingBot {
}

module.exports = TradingBot;
```

```javascript
// DatabaseManager.js
const { MongoClient, ObjectId } = require('mongodb');

class DatabaseManager {
  // ... (previous code)
}

module.exports = DatabaseManager;
```

```javascript
// TelegramManager.js
const TelegramBot = require('node-telegram-bot-api');
const TradingBot = require('./TradingBot');

class TelegramManager {
  // ... (previous code)
}

module.exports = TelegramManager;
```

Please replace the `require` statements with appropriate import statements if you're using ES6 modules.

You can now use these compiled JavaScript files in your Node.js application. Make sure to set up your MongoDB database and provide the required environment variables (e.g., MetaApi token, Telegram token, channel ID) in your application.

To deploy, please use the `pm2 start ecosystem.config.js` command. Thank you!
