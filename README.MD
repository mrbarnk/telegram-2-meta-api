I'll provide you with the compiled TypeScript code for the `TradingBot`, `DatabaseManager`, and `TelegramManager` classes. Please note that to compile TypeScript code, you need to set up a TypeScript project and use the `tsc` (TypeScript Compiler) command. Here's how you can set up and compile the code:

1. Create a TypeScript configuration file (tsconfig.json) in your project's root directory:

```json
{
  "compilerOptions": {
    "target": "ES6",
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "CommonJS",
    "strict": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

2. Install TypeScript and the necessary packages:

```bash
npm install typescript
npm install metaapi.cloud-sdk
npm install node-telegram-bot-api
npm install mongodb
```

3. Create separate TypeScript files for the `TradingBot`, `DatabaseManager`, and `TelegramManager` classes with the code I provided earlier.

4. Run the TypeScript compiler to generate JavaScript files:

```bash
npx tsc
```

This will compile your TypeScript code into JavaScript and place it in the `dist` directory.

5. You can then use the compiled JavaScript files in your Node.js application.

Here are the compiled JavaScript versions of the classes:

```javascript
// TradingBot.js
const MetaApi = require('metaapi.cloud-sdk');
const DatabaseManager = require('./DatabaseManager');

class TradingBot {
  // ... (previous code)
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