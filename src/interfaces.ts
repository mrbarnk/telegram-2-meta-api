// interfaces.ts

// DatabaseManager interface
export interface IDatabaseManager {
    connectToDb(): Promise<void>;
    closeConnection(): Promise<void>;
    getOrdersByStatus(status: string): Promise<string[]>;
    getTotalProfitLossByStatus(status: string): Promise<number>;
    // Add other methods as needed
}

// TelegramChatbot interface
export interface ITelegramChatbot {
    setupCallbacks(): void;
    formatAsTableWithTotal(data: string[], total: number): string;
    sendOrders(chatId: number, status: string): Promise<void>;
    // Add other methods as needed
}


// Define the IOrder interface
export interface IOrder {
    symbol: string;
    type: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    status: string;
    // Add other properties as needed
}

// DatabaseManager interface
export interface IDatabaseManager {
    connectToDb(): Promise<void>;
    closeConnection(): Promise<void>;
    getOrdersByStatus(status: string): Promise<IOrder[]>;
    getTotalProfitLossByStatus(status: string): Promise<number>;
    // Add other methods as needed
}

// TelegramChatbot interface
export interface ITelegramChatbot {
    setupCallbacks(): void;
    formatAsTableWithTotal(data: string[], total: number): string;
    sendOrders(chatId: number, status: string): Promise<void>;
    // Add other methods as needed
}
