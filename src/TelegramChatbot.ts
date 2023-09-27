// TelegramChatbot.ts
const TelegramBot = require('node-telegram-bot-api');

import { RpcMetaApiConnectionInstance } from 'metaapi.cloud-sdk';
import DatabaseManager from './DatabaseManager';
import TradingBot from './TradingBot';

class TelegramChatbot {
    private bot: typeof TelegramBot;
    private dbManager: DatabaseManager;
    private rpc: RpcMetaApiConnectionInstance;

    constructor(token: string, dbManager: DatabaseManager, rpc: RpcMetaApiConnectionInstance) {
        this.bot = new TelegramBot(token, { polling: true });
        this.dbManager = dbManager;
        this.rpc = rpc;
        this.setupCallbacks();
    }

    async sendButtons(chatId: number) {
        const keyboard = {
            reply_markup: {
                keyboard: [
                    ['ACTIVE'],
                    ['PENDING'],
                    ['CANCELLED'],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        };

        await this.bot.sendMessage(chatId, 'Please choose an option orders:', keyboard);
    }

    private setupCallbacks() {
        // this.bot.on('')
        this.bot.on('message', async (msg: any) => {
            const text = msg.text;
            const chatId = msg.chat.id;
            // const data = callbackQuery.data;

            switch (text) {
                case 'ACTIVE':
                    await this.sendOrders(chatId, 'ACTIVE');
                    break;
                case 'PENDING':
                    await this.sendOrders(chatId, 'PENDING');
                    break;
                case 'CANCELLED':
                    await this.sendOrders(chatId, 'CANCELLED');
                    break;
                default:
                    await this.sendButtons(chatId)
                    // Handle other button actions or commands
                    // this.bot.sendMessage(chatId, `How are you? You've provided an invalid command.`, { parse_mode: 'Markdown' });
                    break;
            }

            this.bot.answerCallbackQuery(msg.id);
        });
    }

    private async formatAsTableWithTotal(data: string[], total: number) {
        if (data.length === 0) {
            return 'No data available.';
        }

        const header = 'Index | Data\n';
        const separator = '------|------------\n';
        const rows = data.map((item: any, index) => `Symbol     | ${item.symbol} | Profit: ${item.profit}`).join('\n');
        const totalRow = `\nTotal Profit/Loss: ${total}\n`;

        return header + separator + rows + '\n' + totalRow;
    }

    private async sendOrders(chatId: number, status: "ACTIVE" | "CANCELLED" | "PENDING") {
        try {

            let orders: any[] = []
            switch (status) {
                case "ACTIVE":
                    orders = await this.rpc.getPositions();
                    break;

                case "CANCELLED":
                    orders = (await this.rpc.getOrders()).filter(order => order.state == 'ORDER_STATE_CANCELED');
                    break;

                case "PENDING":
                    orders = (await this.rpc.getOrders()).filter(order => order.state == 'ORDER_STATE_STARTED');
                    break;

                default:
                    break;
            }//await this.dbManager.getOrdersByStatus(status);
            console.log(orders)
            const totalProfitLoss = orders.reduce((sum, order) => (order.profit || order.unrealizedProfit) + sum, 0);//await this.dbManager.getTotalProfitLossByStatus(status);

            const formattedData = await this.formatAsTableWithTotal(orders, totalProfitLoss);

            // console.log({ formattedData, totalProfitLoss })
            await this.bot.sendMessage(chatId, formattedData, { parse_mode: 'Markdown' });
        } catch (error: any) {
            console.error(error.stack)
        }
    }
}

export default TelegramChatbot;
