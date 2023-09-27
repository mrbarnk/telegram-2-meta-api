// DatabaseManager.ts
import { MongoClient, ObjectId } from 'mongodb';
import { IDatabaseManager, IOrder } from './interfaces';

class DatabaseManager implements IDatabaseManager {
    private dbUrl: string;
    private dbName: string;
    private client: MongoClient;
    private db: any; // Database connection

    constructor(dbUrl: string, dbName: string) {
        this.dbUrl = dbUrl;
        this.dbName = dbName;
        this.client = new MongoClient(this.dbUrl, {});
        this.db = null; // Database connection
    }

    async connectToDb() {
        try {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }
    async getfromDb(collectionName: string, query: any) {
        try {
            const collection = this.db.collection(collectionName);
            const result = await collection.findOne(query);
            // console.log(result)
            return result;
        } catch (error) {
            console.error('Error getting trade response from the database:', error);
            return null;
        }
    }

    async writeTradeResponse(collectionName: string, response: any) {
        try {
            const collection = this.db.collection(collectionName);
            const result = await collection.insertOne(response);
            console.log(result)
            return result.ops;
        } catch (error) {
            console.error('Error writing trade response to the database:', error);
            return null;
        }
    }

    async getEntryPriceForOrder(positionId: string) {
        try {
            const collection = this.db.collection('orders'); // Adjust the collection name as needed
            const query = { positionId: positionId };
            const order = await collection.findOne(query);

            if (order) {
                return order.entryPrice;
            } else {
                console.error(`Order with positionId ${positionId} not found in the database.`);
                return null;
            }
        } catch (error) {
            console.error('Error fetching entry price from the database:', error);
            return null;
        }
    }

    async closeConnection() {
        await this.client.close();
        console.log('Disconnected from MongoDB');
    }

    async getOrdersByStatus(status: string) {
        try {
            const collection = this.db.collection('orders'); // Replace 'orders' with your orders collection name
            const orders = await collection.find({ status }).toArray();
            return orders.map((order: IOrder, index: number) => `${index + 1}. Symbol: ${order.symbol}, Type: ${order.type}, Entry Price: ${order.entryPrice}, SL: ${order.stopLoss}, TP: ${order.takeProfit}, Status: ${order.status}`);
        } catch (error) {
            console.error(`Error fetching ${status} orders from the database:`, error);
            return [];
        }
    }

    async getTotalProfitLossByStatus(status: string) {
        try {
            const collection = this.db.collection('orders'); // Replace 'orders' with your orders collection name
            const orders = await collection.find({ status }).toArray();

            // Calculate total profit/loss for the specified status
            let totalProfitLoss = 0;
            for (const order of orders) {
                // Replace with your actual logic to calculate profit/loss for each order
                totalProfitLoss += order.profitLoss;
            }

            return totalProfitLoss;
        } catch (error) {
            console.error(`Error calculating total profit/loss for ${status} orders:`, error);
            return 0; // Return 0 if there's an error
        }
    }
}

export default DatabaseManager;
