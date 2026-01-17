'use server';

import YahooFinance from 'yahoo-finance2';

/**
 * Yahoo Finance instance (singleton pattern)
 */
const yahooFinance = new YahooFinance();

/**
 * Yahoo Finance quote interface with marketState
 */
interface YahooQuoteWithMarketState {
    marketState?: string;
    [key: string]: unknown;
}

/**
 * Market status type
 */
export type MarketStatus = 'OPEN' | 'BREAK' | 'CLOSED';

/**
 * Market status result interface
 */
export interface MarketStatusResult {
    status: MarketStatus;
    message: string;
    timestamp: number;
}

/**
 * Check if current time is within break hours
 * Mon-Thu: 12:00-13:30 WIB
 * Fri: 11:30-14:00 WIB
 */
function isBreakTime(): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    // Friday: 11:30-14:00
    if (dayOfWeek === 5) {
        const breakStart = 11 * 60 + 30; // 11:30
        const breakEnd = 14 * 60; // 14:00
        return timeInMinutes >= breakStart && timeInMinutes < breakEnd;
    }

    // Mon-Thu: 12:00-13:30
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
        const breakStart = 12 * 60; // 12:00
        const breakEnd = 13 * 60 + 30; // 13:30
        return timeInMinutes >= breakStart && timeInMinutes < breakEnd;
    }

    return false;
}

/**
 * Fallback: Basic time-based logic for market hours
 * IDX Market Hours: 09:00-15:50 WIB (Mon-Fri)
 */
function getMarketStatusByTime(): MarketStatus {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    // Weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 'CLOSED';
    }

    // Check break time
    if (isBreakTime()) {
        return 'BREAK';
    }

    // Market hours: 09:00-15:50
    const marketOpen = 9 * 60; // 09:00
    const marketClose = 15 * 60 + 50; // 15:50

    if (timeInMinutes >= marketOpen && timeInMinutes < marketClose) {
        return 'OPEN';
    }

    return 'CLOSED';
}

/**
 * Get real-time market status using Yahoo Finance API
 * @returns MarketStatusResult with status and message
 */
export async function getRealTimeMarketStatus(): Promise<MarketStatusResult> {
    try {
        // Try to fetch Jakarta Composite Index (^JKSE) or use BBCA.JK as fallback
        let quote: YahooQuoteWithMarketState | null = null;
        let marketState: string | undefined;

        // Try ^JKSE first
        try {
            quote = (await yahooFinance.quote('^JKSE')) as YahooQuoteWithMarketState;
            marketState = quote?.marketState;
        } catch {
            // Fallback to BBCA.JK
            try {
                quote = (await yahooFinance.quote('BBCA.JK')) as YahooQuoteWithMarketState;
                marketState = quote?.marketState;
            } catch {
                // If both fail, use time-based logic
                const status = getMarketStatusByTime();
                return {
                    status,
                    message: status === 'OPEN' ? 'Market Open' : status === 'BREAK' ? 'Istirahat Sesi 1' : 'Market Closed',
                    timestamp: Date.now(),
                };
            }
        }

        // Determine status based on marketState
        let status: MarketStatus;

        if (marketState === 'REGULAR') {
            // Check if it's break time
            if (isBreakTime()) {
                status = 'BREAK';
            } else {
                status = 'OPEN';
            }
        } else if (marketState === 'CLOSED' || marketState === 'PRE' || marketState === 'POST') {
            status = 'CLOSED';
        } else {
            // Unknown state, fallback to time-based logic
            status = getMarketStatusByTime();
        }

        const messages: Record<MarketStatus, string> = {
            OPEN: 'Market Open',
            BREAK: 'Istirahat Sesi 1',
            CLOSED: 'Market Closed',
        };

        return {
            status,
            message: messages[status],
            timestamp: Date.now(),
        };
    } catch {
        // Fallback to time-based logic if API fails
        const status = getMarketStatusByTime();
        return {
            status,
            message: status === 'OPEN' ? 'Market Open' : status === 'BREAK' ? 'Istirahat Sesi 1' : 'Market Closed',
            timestamp: Date.now(),
        };
    }
}
