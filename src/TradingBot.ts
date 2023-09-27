// TradingBot.ts
import MetaApi, { RpcMetaApiConnectionInstance } from 'metaapi.cloud-sdk';
import DatabaseManager from './DatabaseManager';
import symbols from './config/symbols';
import { calculateRiskLotSize } from './utils/risk.util';
import config from './config';
import TelegramChatbot from './TelegramChatbot';

class TradingBot {
  private token: string;
  private accountId: string;
  private metaApi: MetaApi;
  public dbManager: DatabaseManager;
  private riskPercentage: number;
  rpc: RpcMetaApiConnectionInstance | undefined;

  constructor(token: string, accountId: string, databaseManager: DatabaseManager, riskPercentage = 1) {
    this.token = token;
    this.accountId = accountId;
    this.metaApi = new MetaApi(token);
    this.dbManager = databaseManager;
    this.riskPercentage = riskPercentage; // Convert risk percentage to a decimal
    if (!this.rpc) this.setRpc().then(console.log)

  }
  async setRpc() {
    // this.createAccount();
    this.rpc = (await this.metaApi.metatraderAccountApi.getAccount(this.accountId)).getRPCConnection()
    await this.rpc.connect();
    await this.rpc.waitSynchronized();


    new TelegramChatbot(config.TELEGRAM_BOT_TOKEN || "", this.dbManager, this.rpc)
  }

  async createAccount() {

    // return await this.metaApi.metatraderAccountApi.createAccount({
    //   magic: 0,
    //   platform: "mt5",
    //   region: 'london',
    //   name: 'TELEGRAM 2 META COPIER',
    //   server: 'MetaQuotes-Demo',
    //   login: '74341640',
    //   password: '!2DydgOgVn',
    //   baseCurrency: 'USD'
    // })
  }

  calculatePipSize(entryPrice: number, stopLossPrice: number, precision: number) {
    // Calculate the price difference between entry and stop loss
    const priceDifference = Math.abs(entryPrice - stopLossPrice);

    // Calculate the pip size based on precision
    const pipSize = priceDifference * Math.pow(10, precision);

    return pipSize;
  }

  async executeTradeFromSignal(signalText: string) {
    // console.log(signalText)
    try {
      // Extract signal details from the provided signalText
      const { symbol, entryPrice, stopLossPrice, takeProfitPrices, orderType, action } = this.extractValuesFromSignal(signalText);
      if (!takeProfitPrices) throw new Error("There was no take profits in this trade!");

      // console.log({ symbol, entryPrice, stopLossPrice, takeProfitPrices, orderType, action })
      if (!symbol || isNaN(entryPrice) || isNaN(stopLossPrice) || takeProfitPrices?.length === 0) {
        console.error('Invalid signal format. Unable to execute trade.');
        return;
      }

      const account = await this.metaApi.metatraderAccountApi.getAccount(this.accountId);

      // Calculate the trade volume based on the risk percentage and account balance
      const accountInfo = await this.rpc?.getAccountInformation();
      const accountBalance = accountInfo?.balance || 100;
      // const tradeVolume  = (50/stopLossPrice)
      // orderType != 'PENDING'
      const askPrice = (await this.rpc?.getSymbolPrice(symbol, false))?.ask
      // console.log({ askPrice })
      const riskCalc = await calculateRiskLotSize({ symbol, direction: action?.toLowerCase()?.includes('buy') ? 'buy' : 'sell', platform: accountInfo?.platform || "mt5", riskAmount: (accountBalance / 100) * this.riskPercentage, openPrice: orderType != 'PENDING' ? askPrice || 0 : entryPrice, closePrice: stopLossPrice })
      // console.log(riskCalc.riskAmount)
      const tradeVolume = riskCalc.lotSize;// (accountBalance * this.riskPercentage) / (stopLossPrice - entryPrice);
      // console.log({ accountBalance, stopLossPrice, entryPrice }, this.calculatePipSize(entryPrice, stopLossPrice, 2))
      // Create and execute trades for each take profit level
      for (const takeProfitPrice of takeProfitPrices) {
        const tradeRequest = {
          symbol,
          action,
          volume: tradeVolume,
          type: orderType,
          stopLoss: stopLossPrice,
          takeProfit: takeProfitPrice,
          price: 0
        };

        console.log(tradeRequest)

        if (orderType === 'PENDING') {
          tradeRequest.price = entryPrice;
        }

        // console.log(tradeRequest)

        // Execute the trade
        const tradeResult = await this.createOrder(tradeRequest);

        // Save the trade response to the database
        const tradeResponse = {
          symbol,
          action,
          entryPrice,
          stopLossPrice,
          takeProfitPrice,
          orderType,
          // @ts-ignore
          result: tradeResult?.state,
          orderId: tradeResult?.orderId,
          positionId: tradeResult?.positionId,
          tradeVolume,
        };

        await this.dbManager.writeTradeResponse('tradeResponses', tradeResponse);

        console.log('Trade executed successfully:', tradeResult);
      }
    } catch (error) {
      console.error('Error executing trade:', error);
    }
  }
  async createOrder(tradeRequest: { symbol: string; action: string; volume: number; type: string; stopLoss: number; takeProfit: number; price: number; }) {
    const { symbol, action, volume, type, stopLoss, takeProfit, price } = tradeRequest
    let response;
    if (action.toUpperCase() == 'BUY') {
      if (type.toUpperCase() == 'PENDING') {
        return await this.rpc?.createLimitBuyOrder(symbol, volume, price, stopLoss, takeProfit)
      }
      if (type.toUpperCase() == 'MARKET') {
        return await this.rpc?.createMarketBuyOrder(symbol, volume, stopLoss, takeProfit)
      }
    }


    if (action.toUpperCase() == 'SELL') {
      if (type.toUpperCase() == 'PENDING') {
        return await this.rpc?.createLimitSellOrder(symbol, volume, stopLoss, takeProfit)
      }
      if (type.toUpperCase() == 'MARKET') {
        return await this.rpc?.createMarketSellOrder(symbol, volume, stopLoss, takeProfit)
      }
    }
  }

  async closeOrderFromSignal(signalText: string) {
    try {
      // Extract order details from the provided signalText
      const { symbol, stopLossPrice } = this.extractValuesFromSignal(signalText);

      if (!symbol) {
        console.error('Invalid close order signal format. Unable to close order.');
        return;
      }

      const account = await this.metaApi.metatraderAccountApi.getAccount(this.accountId);

      // Get a list of open orders for the specified symbol
      const openOrders = await this.getOrders({ symbol, state: "LIMIT" })
      // console.log({ openOrders })
      // Close each open order for the specified symbol
      for (const order of openOrders) {
        if (order.state)
          if (order.type?.includes('LIMIT') || order.type.includes('STOP')) {
            await this.rpc?.cancelOrder(order.id.toString());
            console.log(`Closed order for ${symbol}: ${order.id}`);
          }
      }

      const positions = await this.getPositions({ symbol })
      for (const position of positions) {
        // if (position.)
        if (position.stopLoss == stopLossPrice) {
          await this.rpc?.closePosition(position.id.toString(), {});
          console.log(`Closed position for ${symbol}: ${position.id}`);
          break;
        }
      }

    } catch (error) {
      console.error('Error closing order:', error);
    }
  }
  async getOrders(arg: { symbol: string; state?: string; }) {
    return (await this.rpc?.getOrders())?.filter(order => order.symbol == arg.symbol) || [];
  }

  async moveSLToEntryFromSignal(signalText: string) {
    try {
      // Extract order details from the provided signalText
      const { symbol } = this.extractValuesFromSignal(signalText);

      if (!symbol) {
        console.error('Invalid move SL to entry signal format. Unable to update SL.');
        return;
      }
      // console.log({ symbol })

      const account = await this.metaApi.metatraderAccountApi.getAccount(this.accountId);

      // Get a list of open orders for the specified symbol
      const openOrders = await this.getPositions({ symbol, state: 'PENDING' });
      // console.log(openOrders)
      // Update the SL of each open order for the specified symbol to the entry price
      for (const order of openOrders) {
        // if (order.type === 'LIMIT' || order.type === 'STOP') {
        // const entryPrice = await this.getEntryPriceForOrderFromDatabase(order.id.toString());
        // if (entryPrice !== null) {
        await this.rpc?.modifyPosition(order.id.toString(), order.openPrice);
        console.log(`Moved SL to entry for order ${order.id} (${symbol})`);
        // } else {
        //   console.error(`Entry price not found in the database for order ${order.id} (${symbol}). Unable to update SL.`);
        // }
        // }
      }
    } catch (error) {
      console.error('Error moving SL to entry:', error);
    }
  }
  async getPositions(arg: { symbol: string; state?: string; }) {
    return (await this.rpc?.getPositions())?.filter(order => order.symbol == arg.symbol) || [];
  }

  private async getEntryPriceForOrderFromDatabase(positionId: string) {
    try {
      // Fetch the entry price from the database based on the positionId
      const entryPrice = await this.dbManager.getEntryPriceForOrder(positionId);
      return entryPrice;
    } catch (error) {
      console.error('Error fetching entry price from the database:', error);
      return null;
    }
  }

  private extractValuesFromSignal(signalText: string) {
    // Extract signal details from the provided signalText
    const actionMatch = signalText.match(/(buy|sell)( now)?/i);
    const orderTypeMatch = signalText.match(/(limit)/i);

    const action = actionMatch ? actionMatch[1].toUpperCase() : 'BUY';
    const orderType = orderTypeMatch ? 'PENDING' : 'MARKET';

    const entry = parseFloat(signalText.match(/@ ([\d.]+)/)?.pop()?.split('@').pop() || "");
    const stopLoss = parseFloat(signalText.match(/sl @ ([\d.]+)/ig)?.pop()?.split('@').pop() || "");
    const takeProfitMatches = signalText.match(/tp @ ([\d.]+)/ig);
    const takeProfitPrices = takeProfitMatches?.map(tp => parseFloat(tp.match(/tp @ ([\d.]+)/ig)?.pop()?.split('@').pop() || ""));

    // Extract the symbol from the signal text
    const symbolMatch = signalText.match(/([A-Z]+[0-9]+)/i);
    // const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : null;
    const symbol = signalText.split(' ').filter(symbs => symbols.includes(symbs))?.[0]

    return {
      symbol,
      entryPrice: entry,
      stopLossPrice: stopLoss,
      takeProfitPrices,
      orderType,
      action,
    };
  }
}

export default TradingBot;
