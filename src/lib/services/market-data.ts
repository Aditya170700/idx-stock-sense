import YahooFinance from 'yahoo-finance2';
import type { StockData } from '@/types/stock';

/**
 * Yahoo Finance instance (singleton pattern)
 */
const yahooFinance = new YahooFinance();

/**
 * Yahoo Finance historical data item interface
 */
interface YahooHistoricalItem {
    date: Date;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
}

/**
 * Yahoo Finance quote interface
 */
interface YahooQuote {
    regularMarketPrice?: number;
    regularMarketPreviousClose?: number;
    regularMarketVolume?: number;
    [key: string]: unknown;
}

/**
 * Fundamental data interface
 */
export interface FundamentalData {
    marketCap?: number;
    trailingPE?: number;
    priceToBook?: number;
    trailingEps?: number;
    dividendYield?: number;
}

/**
 * Normalizes ticker symbol for Indonesian market (IDX)
 * Adds ".JK" suffix if not present
 * @param ticker - Stock ticker symbol (e.g., "BBCA" or "BBCA.JK")
 * @returns Normalized ticker with ".JK" suffix
 */
function normalizeTicker(ticker: string): string {
    const upperTicker = ticker.toUpperCase().trim();
    if (upperTicker.endsWith('.JK')) {
        return upperTicker;
    }
    return `${upperTicker}.JK`;
}

/**
 * Fetches historical stock data from Yahoo Finance
 * @param ticker - Stock ticker symbol (e.g., "BBCA" or "BBCA.JK")
 * @param interval - Data interval (e.g., "1d", "5m", "1h")
 * @returns Array of StockData objects
 */
export async function getHistoricalData(
    ticker: string,
    interval: string = '1d'
): Promise<StockData[]> {
    try {
        const normalizedTicker = normalizeTicker(ticker);

        // Map interval to valid Yahoo Finance intervals
        // For intraday intervals (5m, 1h), use '1d' as fallback or handle separately
        const validInterval = interval === '5m' || interval === '1h' ? '1d' : (interval as '1d' | '1wk' | '1mo');

        const queryOptions = {
            period1: Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60, // 1 year ago
            period2: Math.floor(Date.now() / 1000), // Now
            interval: validInterval,
        };

        const result = (await yahooFinance.historical(normalizedTicker, queryOptions)) as unknown as YahooHistoricalItem[];

        if (!result || !Array.isArray(result) || result.length === 0) {
            throw new Error(`No data found for ticker: ${normalizedTicker}`);
        }

        // Transform Yahoo Finance data to StockData format
        const stockData: StockData[] = result.map((item: YahooHistoricalItem) => ({
            timestamp: item.date ? item.date.getTime() : Date.now(),
            open: item.open ?? 0,
            high: item.high ?? 0,
            low: item.low ?? 0,
            close: item.close ?? 0,
            volume: item.volume ?? 0,
        }));

        return stockData;
    } catch (error) {
        throw new Error(
            `Failed to fetch historical data for ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Gets the latest quote/price for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Current price
 */
export async function getCurrentPrice(ticker: string): Promise<number> {
    try {
        const normalizedTicker = normalizeTicker(ticker);
        const quote = (await yahooFinance.quote(normalizedTicker)) as unknown as YahooQuote;

        if (!quote || typeof quote.regularMarketPrice !== 'number') {
            throw new Error(`No price data found for ticker: ${normalizedTicker}`);
        }

        return quote.regularMarketPrice;
    } catch (error) {
        throw new Error(
            `Failed to fetch current price for ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Fetches fundamental data for a ticker using quoteSummary
 * @param ticker - Stock ticker symbol (e.g., "BBCA" or "BBCA.JK")
 * @returns FundamentalData object with market cap, PE ratio, etc.
 */
export async function getFundamentalData(ticker: string): Promise<FundamentalData> {
    try {
        const normalizedTicker = normalizeTicker(ticker);

        const quoteSummary = await yahooFinance.quoteSummary(normalizedTicker, {
            modules: ['summaryDetail', 'defaultKeyStatistics', 'price'],
        }) as unknown as {
            summaryDetail?: Record<string, unknown>;
            defaultKeyStatistics?: Record<string, unknown>;
            price?: Record<string, unknown>;
        };

        // Extract data from different modules (handle nulls gracefully)
        // Values can be either direct numbers or objects with 'raw' property
        const summaryDetail = quoteSummary?.summaryDetail;
        const defaultKeyStats = quoteSummary?.defaultKeyStatistics;
        const price = quoteSummary?.price;

        // Helper function to extract value (handles both direct number and {raw: number} formats)
        const extractValue = (value: unknown): number | undefined => {
            if (value === undefined || value === null) return undefined;
            if (typeof value === 'number') return value;
            if (typeof value === 'object' && value !== null && 'raw' in value) {
                const rawValue = (value as { raw?: unknown }).raw;
                return typeof rawValue === 'number' ? rawValue : undefined;
            }
            return undefined;
        };

        return {
            marketCap: extractValue(summaryDetail?.marketCap) ??
                extractValue(defaultKeyStats?.marketCap) ??
                extractValue(price?.marketCap) ??
                undefined,
            trailingPE: extractValue(summaryDetail?.trailingPE) ??
                extractValue(defaultKeyStats?.trailingPE) ??
                undefined,
            priceToBook: extractValue(summaryDetail?.priceToBook) ??
                extractValue(defaultKeyStats?.priceToBook) ??
                undefined,
            trailingEps: extractValue(summaryDetail?.trailingEps) ??
                extractValue(defaultKeyStats?.trailingEps) ??
                undefined,
            dividendYield: extractValue(summaryDetail?.dividendYield) ??
                extractValue(defaultKeyStats?.dividendYield) ??
                undefined,
        };
    } catch (error) {
        // Return empty object if fetch fails (graceful degradation)
        console.warn(`Failed to fetch fundamental data for ${ticker}:`, error);
        return {};
    }
}

/**
 * Intraday data interface
 */
export interface IntradayData {
    data5m: StockData[];
    data15m: StockData[];
}

/**
 * Fetches intraday data (5m and 15m intervals) for the last 5 days
 * Note: yahoo-finance2 doesn't support intraday intervals, so we use daily data
 * with extended range to ensure enough data points for calculations
 * @param ticker - Stock ticker symbol (e.g., "BBCA" or "BBCA.JK")
 * @returns Object containing 5m and 15m data arrays (using daily data)
 */
export async function getIntradayData(ticker: string): Promise<IntradayData> {
    try {
        const normalizedTicker = normalizeTicker(ticker);

        // Calculate 60 days ago timestamp to ensure enough data points for EMA-20
        // We need at least 20+ data points for EMA calculation
        const sixtyDaysAgo = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60);
        const now = Math.floor(Date.now() / 1000);

        // Fetch daily data (yahoo-finance2 doesn't support intraday intervals)
        // We'll use daily data for both 5m and 15m simulations
        const query1d = {
            period1: sixtyDaysAgo,
            period2: now,
            interval: '1d' as '1d' | '1wk' | '1mo',
        };

        const result1d = (await yahooFinance.historical(normalizedTicker, query1d)) as unknown as YahooHistoricalItem[];

        if (!result1d || !Array.isArray(result1d) || result1d.length === 0) {
            throw new Error(`No historical data found for ticker: ${normalizedTicker}`);
        }

        // Convert to StockData format
        const dailyData: StockData[] = result1d.map((item: YahooHistoricalItem) => ({
            timestamp: item.date ? item.date.getTime() : Date.now(),
            open: item.open ?? 0,
            high: item.high ?? 0,
            low: item.low ?? 0,
            close: item.close ?? 0,
            volume: item.volume ?? 0,
        }));

        // Filter to last 5 days for "intraday" view (most recent data)
        const fiveDaysAgoTimestamp = Date.now() - (5 * 24 * 60 * 60 * 1000);
        const recentData = dailyData.filter((item) => item.timestamp >= fiveDaysAgoTimestamp);

        // Use recent data for 5m simulation, and all data for 15m (for better EMA calculation)
        // For 15m, we use more data points to ensure EMA-20 has enough data
        const data5m = recentData.length > 0 ? recentData : dailyData.slice(-10); // Last 10 days if less than 5 days available
        const data15m = dailyData.length >= 20 ? dailyData : dailyData; // Use all available data for 15m

        if (data5m.length === 0 && data15m.length === 0) {
            throw new Error(`No intraday data found for ticker: ${normalizedTicker}`);
        }

        return {
            data5m,
            data15m,
        };
    } catch (error) {
        throw new Error(
            `Failed to fetch intraday data for ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
