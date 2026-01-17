'use server';

import { analyzeStock } from '@/lib/services/analyzer';
import { analyzeIntraday } from '@/lib/services/intraday-analyzer';
import { getHistoricalData } from '@/lib/services/market-data';
import { calculateVWAP } from '@/lib/services/indicators';
import { compareStocks } from '@/lib/services/comparison';
import { DEFAULT_TICKERS } from '@/lib/constants/tickers';
import type { AnalysisResult, ComparisonResult } from '@/types/stock';
import type { StockData } from '@/types/stock';
import type { IntradayAnalysisResult } from '@/lib/services/intraday-analyzer';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to analyze a stock ticker
 * @param formData - FormData containing the ticker input
 * @returns AnalysisResult object or error message
 */
export async function analyzeTicker(
    formData: FormData
): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
    try {
        // Extract ticker from formData
        const ticker = formData.get('ticker')?.toString().trim();

        // Validate ticker input
        if (!ticker || ticker.length === 0) {
            return {
                success: false,
                error: 'Ticker symbol is required',
            };
        }

        // Call analyzer service
        const result = await analyzeStock(ticker);

        // Revalidate the path to ensure fresh data on next request
        revalidatePath('/');

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        // Handle errors gracefully
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to analyze ticker';

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Server Action to analyze intraday data for a stock ticker
 * @param formData - FormData containing the ticker input
 * @returns IntradayAnalysisResult object or error message
 */
export async function analyzeIntradayTicker(
    formData: FormData
): Promise<{ success: boolean; data?: IntradayAnalysisResult; error?: string }> {
    try {
        // Extract ticker from formData
        const ticker = formData.get('ticker')?.toString().trim();

        // Validate ticker input
        if (!ticker || ticker.length === 0) {
            return {
                success: false,
                error: 'Ticker symbol is required',
            };
        }

        // Call intraday analyzer service
        const result = await analyzeIntraday(ticker);

        // Revalidate the path to ensure fresh data on next request
        revalidatePath('/');

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        // Handle errors gracefully
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to analyze intraday ticker';

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Server Action to get chart data for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Chart data with close prices and VWAP
 */
export async function getChartData(
    ticker: string
): Promise<{ success: boolean; data?: Array<{ timestamp: number; close: number; vwap: number }>; error?: string }> {
    try {
        // Fetch 5-minute interval data for intraday chart
        const historicalData: StockData[] = await getHistoricalData(ticker, '5m');

        if (historicalData.length === 0) {
            return {
                success: false,
                error: 'No chart data available',
            };
        }

        // Extract arrays for VWAP calculation
        const high = historicalData.map((d) => d.high);
        const low = historicalData.map((d) => d.low);
        const close = historicalData.map((d) => d.close);
        const volume = historicalData.map((d) => d.volume);

        // Calculate VWAP
        const vwap = calculateVWAP(high, low, close, volume);

        // Prepare chart data
        const chartData = historicalData.map((item, index) => ({
            timestamp: item.timestamp,
            close: item.close,
            vwap: vwap[index] ?? item.close,
        }));

        return {
            success: true,
            data: chartData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch chart data';

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Process items in batches with concurrency limit
 * @param items - Array of items to process
 * @param batchSize - Number of items to process concurrently
 * @param processor - Function to process each item
 * @returns Array of results
 */
async function processInBatches<T, R>(
    items: readonly T[],
    batchSize: number,
    processor: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map((item) =>
                processor(item).catch((error) => {
                    // Return error result instead of throwing
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    } as R;
                })
            )
        );
        results.push(...batchResults);
    }

    return results;
}

/**
 * Normalize ticker code - append .JK if not present
 */
function normalizeTickerForScan(ticker: string): string {
    const upperTicker = ticker.toUpperCase().trim();
    if (upperTicker.endsWith('.JK')) {
        return upperTicker;
    }
    return `${upperTicker}.JK`;
}

/**
 * Server Action to scan multiple stocks in the market
 * Analyzes selected tickers or all default tickers if none provided
 * @param selectedTickers - Array of ticker codes (e.g., ["AALI", "BBCA"]) - will be normalized to include .JK
 * @returns Array of analysis results
 */
export async function scanMarket(
    selectedTickers?: string[]
): Promise<{
    success: boolean;
    data?: AnalysisResult[];
    error?: string;
}> {
    try {
        // Use selected tickers or fall back to default tickers
        const tickersToScan = selectedTickers && selectedTickers.length > 0
            ? selectedTickers.map(normalizeTickerForScan)
            : DEFAULT_TICKERS;

        // Process tickers in batches of 5 to avoid timeouts
        const CONCURRENCY_LIMIT = 5;

        const results = await processInBatches(
            tickersToScan,
            CONCURRENCY_LIMIT,
            async (ticker) => {
                try {
                    return await analyzeStock(ticker);
                } catch (error) {
                    // Return a result with error info instead of throwing
                    const codeWithoutSuffix = ticker.replace('.JK', '');
                    return {
                        symbol: codeWithoutSuffix,
                        price: 0,
                        rsi: 0,
                        macd: 0,
                        signal: 'NEUTRAL' as const,
                        confidenceScore: 0,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    } as AnalysisResult & { error?: string };
                }
            }
        );

        // Filter out failed results and map to AnalysisResult format
        const successfulResults: AnalysisResult[] = results.filter(
            (result): result is AnalysisResult => {
                return 'symbol' in result && !('error' in result);
            }
        );

        // Revalidate the path to ensure fresh data on next request
        revalidatePath('/');

        return {
            success: true,
            data: successfulResults,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to scan market';

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Server Action to compare two stocks
 * @param formData - FormData containing tickerA and tickerB inputs
 * @returns ComparisonResult object or error message
 */
export async function compareTickers(
    formData: FormData
): Promise<{ success: boolean; data?: ComparisonResult; error?: string }> {
    try {
        // Extract tickers from formData
        const tickerA = formData.get('tickerA')?.toString().trim();
        const tickerB = formData.get('tickerB')?.toString().trim();

        // Validate ticker inputs
        if (!tickerA || tickerA.length === 0) {
            return {
                success: false,
                error: 'Ticker A is required',
            };
        }

        if (!tickerB || tickerB.length === 0) {
            return {
                success: false,
                error: 'Ticker B is required',
            };
        }

        if (tickerA.toUpperCase() === tickerB.toUpperCase()) {
            return {
                success: false,
                error: 'Please select two different stocks to compare',
            };
        }

        // Call comparison service
        const result = await compareStocks(tickerA, tickerB);

        // Revalidate the path to ensure fresh data on next request
        revalidatePath('/');

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        // Handle errors gracefully
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to compare tickers';

        return {
            success: false,
            error: errorMessage,
        };
    }
}
