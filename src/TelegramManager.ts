// TelegramManager.ts
import { NewMessage, NewMessageEvent } from 'telegram/events';
import TradingBot from './TradingBot';
import config from './config';
import { StringSession } from 'telegram/sessions';
import { TelegramClient } from 'telegram';
// @ts-ignore
import input from "input";
import { tradingBot } from './App';


class TelegramManager {
    // private bot: TelegramBot;
    private channelId: string;
    // private tradingBot: TradingBot;

    constructor(token: string, channelId: string) {
        // this.bot = new TelegramBot(token, { polling: true });
        this.channelId = channelId;
        // this.tradingBot = tradingBot;
    }

    async setupSignal() {

        const apiId = Number(config.TELEGRAM_APP_ID || 0);
        const apiHash = config.TELEGRAM_APP_HASH || "";
        const stringSession = new StringSession(config.TEGRAM_LOGIN_TOKEN); // fill this later with the value from session.save()

        // console.log("Loading interactive example...");
        const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });
        await client.start({
            phoneNumber: async () => await input.text("Please enter your number: "),
            password: async () => await input.text("Please enter your password: "),
            phoneCode: async () =>
                await input.text("Please enter the code you received: "),
            onError: (err) => console.log(err),
        });
        console.log("You should now be connected.");
        client.session.save()
        client.addEventHandler(this.startListeningForSignals, new NewMessage({}));

    }

    startListeningForSignals(event: NewMessageEvent) {

        // @ts-ignore
        if (event.message?._chat?.title?.toLowerCase()?.includes(config.CHANNEL_NAME) || event.message?._chat?.title?.toLowerCase()?.includes('GOLD SCALPER 1.0')) {
            // @ts-ignore
            // console.log(event.message.message, event.message._chat.title)
            const signalText = event.message.message;
            if (!signalText) return;

            // console.log(event.message)
            // Check if the signal text includes "close now" and call the close order method
            if (signalText.toLowerCase().includes('close') || signalText.toLowerCase().includes('delete')) {
                tradingBot.dbManager.getfromDb('signals', { messageId: event.message.replyTo?.replyToMsgId })
                    .then(foundSignal => {
                        if (!foundSignal) return;
                        // console.log({ messageId: event.message.replyTo?.replyToMsgId })
                        tradingBot.closeOrderFromSignal(foundSignal.text);
                    })
                    .catch(console.error)
            }
            // Check if the signal text includes "move SL to entry" or "move to entry" and call the move SL to entry method
            else if (signalText.toLowerCase().includes('move sl to entry') || signalText.toLowerCase().includes('move to entry') || signalText.toLowerCase().includes('set be')) {
                tradingBot.dbManager.getfromDb('signals', { messageId: event.message.replyTo?.replyToMsgId })
                    .then(foundSignal => {
                        if (!foundSignal) return;
                        // console.log({ messageId: event.message.replyTo?.replyToMsgId })
                        tradingBot.moveSLToEntryFromSignal(foundSignal.text);
                    })
                    .catch(console.error)
            } else {
                tradingBot.dbManager.writeTradeResponse('signals', { messageId: event.message.id, text: event.message.message }).then(console.log).catch(console.error);
                // Call the signalHandler function with the signal text
                tradingBot.executeTradeFromSignal(signalText);
            }
        }

        // this.bot.on('text', (msg: any) => {
        //     // Check if the message is from the specified channel
        //     if (msg.chat.id.toString() === this.channelId) {
        //         const signalText = msg.text;
        //         if (!signalText) return;
        //         // Check if the signal text includes "close now" and call the close order method
        //         if (signalText.toLowerCase().includes('close now')) {
        //             this.tradingBot.closeOrderFromSignal(signalText);
        //         }
        //         // Check if the signal text includes "move SL to entry" or "move to entry" and call the move SL to entry method
        //         else if (signalText.toLowerCase().includes('move sl to entry') || signalText.toLowerCase().includes('move to entry')) {
        //             this.tradingBot.moveSLToEntryFromSignal(signalText);
        //         } else {
        //             // Call the signalHandler function with the signal text
        //             this.tradingBot.executeTradeFromSignal(signalText);
        //         }
        //     }
        // });
    }
}

export default TelegramManager;
