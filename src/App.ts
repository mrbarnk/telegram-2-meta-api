// App.ts
import DatabaseManager from './DatabaseManager';
import TradingBot from './TradingBot';
import TelegramManager from './TelegramManager';
import config from './config';
import TelegramChatbot from './TelegramChatbot';
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
// @ts-ignore
import input from "input";
import { NewMessage, NewMessageEvent } from 'telegram/events';

// * import { TelegramClient } from "telegram";
// * import { NewMessage } from "telegram/events";
// * import { NewMessageEvent } from "telegram/events";

// Replace with your actual MongoDB connection string and database name
const dbUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'telegram-2-mt5';

// Replace with your MetaApi token, MetaTrader account ID, and risk percentage
const metaApiToken = config.META_API_ACCESS_TOKEN || "";
const accountId = config.META_API_ACCOUNT_ID || "";
const riskPercentage = 1; // 1% risk

// Replace with your Telegram bot token and channel ID
const telegramToken = config.TELEGRAM_BOT_TOKEN || "";
const channelId = config.CHANNEL_ID || "";

// Create an instance of the DatabaseManager
const dbManager = new DatabaseManager(dbUrl, dbName);

// Create an instance of the TradingBot
export const tradingBot = new TradingBot(metaApiToken, accountId, dbManager, riskPercentage);
tradingBot.setRpc().then(console.log)

// Create an instance of the TelegramManager
const telegramManager = new TelegramManager(telegramToken, channelId);




// Connect to the MongoDB database
dbManager.connectToDb()
  .then(() => {
    // Start listening for signals from the Telegram channel
    telegramManager.setupSignal();

    console.log('App is running...');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
