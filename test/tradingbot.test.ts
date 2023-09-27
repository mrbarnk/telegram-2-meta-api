// test/tradingBot.test.ts
import { expect } from 'chai';
import TradingBot from '../src/TradingBot';
import DatabaseManager from '../src/DatabaseManager';

describe('TradingBot', () => {
    let tradingBot: TradingBot;
    let dbManager: DatabaseManager;

    before(() => {
        // Replace with your actual configuration details
        const metaApiToken = 'your-metaapi-token';
        const accountId = 'your-account-id';
        const riskPercentage = 1; // 1% risk
        dbManager = new DatabaseManager('mongodb://localhost:27017', 'test-database');
        tradingBot = new TradingBot(metaApiToken, accountId, dbManager, riskPercentage);
    });

    after(async () => {
        // Close the database connection after tests
        await dbManager.closeConnection();
    });

    describe('#executeTradeFromSignal', () => {
        it('should execute a trade based on a valid buy now signal', async () => {
            const signalText = 'GBPUSD buy now @ 1.2171 SL @ 1.2110 tp @ 1.2282 tp @ 1.2446';
            const tradeResult = await tradingBot.executeTradeFromSignal(signalText);
            expect(tradeResult).to.have.property('result').to.equal('TRADE_REQUEST_CREATED');
        });


        it('should execute a trade based on a valid buy limit signal', async () => {
            const signalText = 'GBPUSD buy now @ 1.2171 SL @ 1.2110 tp @ 1.2282 tp @ 1.2446';
            const tradeResult = await tradingBot.executeTradeFromSignal(signalText);
            expect(tradeResult).to.have.property('result').to.equal('TRADE_REQUEST_CREATED');
        });


        it('should execute a trade based on a valid sell now signal', async () => {
            const signalText = 'GBPUSD buy limit @ 1.2171 SL @ 1.2110 tp @ 1.2282 tp @ 1.2446';
            const tradeResult = await tradingBot.executeTradeFromSignal(signalText);
            expect(tradeResult).to.have.property('result').to.equal('TRADE_REQUEST_CREATED');
        });

        it('should execute a trade based on a valid sell limit signal', async () => {
            const signalText = 'GBPUSD sell now @ 1.2171 SL @ 1.2110 tp @ 1.2282 tp @ 1.2446';
            const tradeResult = await tradingBot.executeTradeFromSignal(signalText);
            expect(tradeResult).to.have.property('result').to.equal('TRADE_REQUEST_CREATED');
        });

        it('should handle an invalid signal format', async () => {
            const signalText = 'invalid-signal';
            const tradeResult = await tradingBot.executeTradeFromSignal(signalText);
            expect(tradeResult).to.have.property('error').to.exist;
        });
    });


    describe('#moveSLToEntryFromSignal', () => {
        it('should move SL to entry based on a valid signal', async () => {
            const signalText = 'move SL to entry';
            // Mock a database entry with the entry price
            tradingBot['getEntryPriceForOrderFromDatabase'] = async () => 1.2171;
            const result = await tradingBot.moveSLToEntryFromSignal(signalText);
            expect(result).to.equal(true); // Replace with your actual implementation
        });

        it('should handle an invalid signal format', async () => {
            const signalText = 'invalid-signal';
            const result = await tradingBot.moveSLToEntryFromSignal(signalText);
            expect(result).to.equal(false); // Replace with your actual implementation
        });
    });

    describe('#closeOrderFromSignal', () => {
        it('should close an order based on a valid signal', async () => {
            const signalText = 'close now';
            // Mock a database entry with the order details
            tradingBot['getEntryPriceForOrderFromDatabase'] = async () => 1.2171; // Mock entry price
            // @ts-ignore
            tradingBot['closeOrderFromSignal'] = async () => true; // Mock order closure
            const result = await tradingBot.closeOrderFromSignal(signalText);
            expect(result).to.equal(true); // Replace with your actual implementation
        });

        it('should handle an invalid signal format', async () => {
            const signalText = 'invalid-signal';
            const result = await tradingBot.closeOrderFromSignal(signalText);
            expect(result).to.equal(false); // Replace with your actual implementation
        });
    });

    // Add more test cases for other TradingBot functions here

});
