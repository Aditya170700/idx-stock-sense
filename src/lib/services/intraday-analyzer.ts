import { getIntradayData, getCurrentPrice } from './market-data';
import {
    calculateRSI,
    calculateATR,
    calculateSessionVWAP,
} from './indicators';
import type { StockData } from '@/types/stock';

/**
 * Intraday analysis result interface
 */
export interface IntradayAnalysisResult {
    ticker: string;
    bias: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    score: number; // 0-99
    entry: number;
    sl: number; // Stop Loss
    tp1: number; // Target 1
    tp2: number; // Target 2
    vwapData: Array<{ timestamp: number; vwap: number }>;
    chartData: StockData[];
    orHigh: number; // Opening Range High (first 15 minutes)
    orLow: number; // Opening Range Low (first 15 minutes)
    currentVWAP: number; // Latest VWAP value
    lastTimestamp: number; // Session info - last data point timestamp
    reasonText: string; // Human-readable reasoning
}

/**
 * Analyzes intraday data for a ticker and generates trading plan
 * @param ticker - Stock ticker symbol (e.g., "BBCA" or "BBCA.JK")
 * @returns IntradayAnalysisResult with bias, score, and trading plan
 */
export async function analyzeIntraday(ticker: string): Promise<IntradayAnalysisResult> {
    try {
        // Step 1: Fetch 5m and 15m data
        const { data5m, data15m } = await getIntradayData(ticker);

        if (data5m.length === 0) {
            throw new Error(`No 5m data available for ${ticker}`);
        }

        if (data15m.length === 0) {
            throw new Error(`No 15m data available for ${ticker}`);
        }

        // Get current price
        let currentPrice: number;
        try {
            currentPrice = await getCurrentPrice(ticker);
        } catch {
            // Fallback to latest close from 5m data
            currentPrice = data5m[data5m.length - 1].close;
        }

        // Step 2: Calculate Opening Range (OR) - First 15 minutes (09:00 - 09:15)
        // Filter data for current trading day
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const todayData = data5m.filter((item) => {
            const date = new Date(item.timestamp);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            return dateKey === todayKey;
        });

        // Find Opening Range (first 15 minutes = first 3 candles of 5m data)
        let orHigh = currentPrice;
        let orLow = currentPrice;

        if (todayData.length >= 3) {
            const openingRangeData = todayData.slice(0, 3); // First 3 candles (15 minutes)
            orHigh = Math.max(...openingRangeData.map((d) => d.high));
            orLow = Math.min(...openingRangeData.map((d) => d.low));
        } else if (todayData.length > 0) {
            // Fallback: use all available today data
            orHigh = Math.max(...todayData.map((d) => d.high));
            orLow = Math.min(...todayData.map((d) => d.low));
        } else {
            // Fallback: use first few candles from all data
            const firstFew = data5m.slice(0, Math.min(3, data5m.length));
            if (firstFew.length > 0) {
                orHigh = Math.max(...firstFew.map((d) => d.high));
                orLow = Math.min(...firstFew.map((d) => d.low));
            }
        }

        // Step 3: Calculate Session VWAP
        const sessionVWAP = calculateSessionVWAP(data5m);
        const vwapData = data5m.map((item, index) => ({
            timestamp: item.timestamp,
            vwap: sessionVWAP[index] ?? item.close,
        }));
        const currentVWAP = vwapData.length > 0 ? vwapData[vwapData.length - 1].vwap : currentPrice;

        // Step 4: Determine Bias using new logic
        // If Price > VWAP AND Price > OR High -> BULLISH
        // If Price < VWAP AND Price < OR Low -> BEARISH
        // Else -> SIDEWAYS
        let bias: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';

        if (currentPrice > currentVWAP && currentPrice > orHigh) {
            bias = 'BULLISH';
        } else if (currentPrice < currentVWAP && currentPrice < orLow) {
            bias = 'BEARISH';
        } else {
            bias = 'SIDEWAYS';
        }

        // Step 5: Calculate Score (0-99)
        let score = 50; // Start with base score

        // Add 20 if Bullish
        if (bias === 'BULLISH') {
            score += 20;
        }

        // Calculate RSI(14) on 5m data
        const closes5m = data5m.map((d) => d.close);
        let latestRSI = 50; // Default neutral RSI
        try {
            const rsiPeriod = Math.min(14, Math.max(2, Math.floor(closes5m.length / 2)));
            if (closes5m.length >= rsiPeriod + 1) {
                const rsi5m = calculateRSI(closes5m, rsiPeriod);
                latestRSI = rsi5m[rsi5m.length - 1] ?? 50;
            }
        } catch {
            // If RSI calculation fails, use default value
            latestRSI = 50;
        }

        // Subtract 10 if RSI > 70 (overbought)
        if (latestRSI > 70) {
            score -= 10;
        }
        // Add 10 if RSI < 30 (oversold) and bullish bias
        if (latestRSI < 30 && bias === 'BULLISH') {
            score += 10;
        }

        // Check volume spike (compare latest volume to average)
        const volumes5m = data5m.map((d) => d.volume);
        const avgVolume = volumes5m.reduce((sum, vol) => sum + vol, 0) / volumes5m.length;
        const latestVolume = volumes5m[volumes5m.length - 1] ?? 0;

        // Add 20 if Volume > AvgVolume (volume spike)
        if (latestVolume > avgVolume) {
            score += 20;
        }

        // Clamp score between 0 and 99
        score = Math.max(0, Math.min(99, score));

        // Step 6: Generate Trading Plan using 5m ATR
        const highs5m = data5m.map((d) => d.high);
        const lows5m = data5m.map((d) => d.low);
        let latestATR = currentPrice * 0.02; // Default to 2% if ATR fails
        try {
            const atrPeriod = Math.min(14, Math.max(2, Math.floor(data5m.length / 2)));
            if (data5m.length >= atrPeriod + 1) {
                const atr5m = calculateATR(highs5m, lows5m, closes5m, atrPeriod);
                latestATR = atr5m[atr5m.length - 1] ?? currentPrice * 0.02;
            }
        } catch {
            // If ATR calculation fails, use default value (2% of current price)
            latestATR = currentPrice * 0.02;
        }

        const entry = currentPrice;
        const sl = entry - (2 * latestATR); // Stop Loss = Entry - (2 * ATR)
        const tp1 = entry + (2 * latestATR); // Target 1 = Entry + (2 * ATR)
        const tp2 = entry + (4 * latestATR); // Target 2 = Entry + (4 * ATR)

        // Step 7: Generate Human-Readable Reasoning
        // Reuse volumes5m, avgVolume, and latestVolume from above
        const volumeRatio = avgVolume > 0 ? latestVolume / avgVolume : 1;

        const reasonParts: string[] = [];

        // VWAP analysis
        if (currentPrice > currentVWAP) {
            reasonParts.push('Price is currently above VWAP (Bullish)');
        } else if (currentPrice < currentVWAP) {
            reasonParts.push('Price is currently below VWAP (Bearish)');
        } else {
            reasonParts.push('Price is near VWAP (Neutral)');
        }

        // Volume analysis
        if (volumeRatio < 0.7) {
            reasonParts.push('but Volume is low');
        } else if (volumeRatio > 1.3) {
            reasonParts.push('and Volume is high (Strong momentum)');
        }

        // Opening Range analysis
        if (currentPrice > orHigh) {
            reasonParts.push('Price has broken above Opening Range High');
        } else if (currentPrice < orLow) {
            reasonParts.push('Price has broken below Opening Range Low');
        } else {
            reasonParts.push('Price is within Opening Range');
        }

        // Add recommendation
        if (bias === 'BULLISH' && currentPrice > orHigh) {
            reasonParts.push('Consider BUY on pullback to VWAP');
        } else if (bias === 'BEARISH' && currentPrice < orLow) {
            reasonParts.push('Consider SELL on bounce to VWAP');
        } else {
            reasonParts.push('Wait for a breakout above Opening Range High or below Opening Range Low');
        }

        const reasonText = reasonParts.join('. ') + '.';

        // Get last timestamp
        const lastTimestamp = data5m.length > 0 ? data5m[data5m.length - 1].timestamp : Date.now();

        // Normalize ticker for display (remove .JK suffix)
        const displayTicker = ticker.toUpperCase().replace('.JK', '');

        return {
            ticker: displayTicker,
            bias,
            score: Math.round(score),
            entry: Math.round(entry),
            sl: Math.round(sl),
            tp1: Math.round(tp1),
            tp2: Math.round(tp2),
            vwapData,
            chartData: data5m,
            orHigh: Math.round(orHigh),
            orLow: Math.round(orLow),
            currentVWAP: Math.round(currentVWAP),
            lastTimestamp,
            reasonText,
        };
    } catch (error) {
        throw new Error(
            `Failed to analyze intraday for ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
