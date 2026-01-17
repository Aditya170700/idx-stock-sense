import { getHistoricalData, getCurrentPrice, getFundamentalData } from './market-data';
import {
    calculateRSI,
    calculateMACD,
    calculateEMA,
    calculateOBV,
} from './indicators';
import { analyzeFundamentals } from './fundamental-analyzer';
import type { AnalysisResult, BandarFlowData, CandlestickPattern, StockData } from '@/types/stock';

/**
 * Detects candlestick patterns from the last 3-5 candles
 * @param historicalData - Array of StockData (OHLCV)
 * @returns Array of detected CandlestickPattern
 */
function detectCandlePatterns(historicalData: StockData[]): CandlestickPattern[] {
    const patterns: CandlestickPattern[] = [];

    if (historicalData.length < 2) {
        return patterns;
    }

    // Get last 5 candles for pattern detection
    const last5Candles = historicalData.slice(-5);
    const current = last5Candles[last5Candles.length - 1];
    const prev = last5Candles[last5Candles.length - 2];

    // Helper functions
    const isBullish = (candle: StockData) => candle.close > candle.open;
    const isBearish = (candle: StockData) => candle.close < candle.open;
    const bodySize = (candle: StockData) => Math.abs(candle.close - candle.open);
    const rangeSize = (candle: StockData) => candle.high - candle.low;
    const upperShadow = (candle: StockData) => candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = (candle: StockData) => Math.min(candle.open, candle.close) - candle.low;

    // 1. Bullish Engulfing Pattern
    if (prev && isBearish(prev) && isBullish(current)) {
        const prevBody = bodySize(prev);
        const currentBody = bodySize(current);
        if (
            current.open < prev.close &&
            current.close > prev.open &&
            currentBody > prevBody * 1.1 // Current body is at least 10% larger
        ) {
            patterns.push({
                name: 'Bullish Engulfing',
                label: 'Bullish Engulfing (Potensi Naik Kuat)',
                color: 'text-green-700 dark:text-green-300',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
            });
        }
    }

    // 2. Bearish Engulfing Pattern
    if (prev && isBullish(prev) && isBearish(current)) {
        const prevBody = bodySize(prev);
        const currentBody = bodySize(current);
        if (
            current.open > prev.close &&
            current.close < prev.open &&
            currentBody > prevBody * 1.1 // Current body is at least 10% larger
        ) {
            patterns.push({
                name: 'Bearish Engulfing',
                label: 'Bearish Engulfing (Potensi Turun Cepat)',
                color: 'text-red-700 dark:text-red-300',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
            });
        }
    }

    // 3. Hammer Pattern
    if (current) {
        const body = bodySize(current);
        const range = rangeSize(current);
        const lower = lowerShadow(current);
        const upper = upperShadow(current);

        if (
            range > 0 &&
            body < range * 0.3 && // Small body (< 30% of range)
            lower > body * 2 && // Long lower shadow (> 2x body)
            upper < body * 0.5 // Small upper shadow
        ) {
            patterns.push({
                name: 'Hammer',
                label: 'Hammer (Palu - Sinyal Rebound)',
                color: 'text-blue-700 dark:text-blue-300',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            });
        }
    }

    // 4. Shooting Star Pattern
    if (current) {
        const body = bodySize(current);
        const range = rangeSize(current);
        const lower = lowerShadow(current);
        const upper = upperShadow(current);

        if (
            range > 0 &&
            body < range * 0.3 && // Small body (< 30% of range)
            upper > body * 2 && // Long upper shadow (> 2x body)
            lower < body * 0.5 && // Small lower shadow
            isBearish(current) // Typically bearish
        ) {
            patterns.push({
                name: 'Shooting Star',
                label: 'Shooting Star (Sinyal Koreksi)',
                color: 'text-orange-700 dark:text-orange-300',
                bgColor: 'bg-orange-100 dark:bg-orange-900/30',
            });
        }
    }

    // 5. Doji Pattern
    if (current) {
        const body = bodySize(current);
        const range = rangeSize(current);

        if (range > 0 && body < range * 0.1) {
            // Very small body (< 10% of range)
            patterns.push({
                name: 'Doji',
                label: 'Doji (Pasar Galau/Netral)',
                color: 'text-gray-700 dark:text-gray-300',
                bgColor: 'bg-gray-100 dark:bg-gray-800',
            });
        }
    }

    return patterns;
}

/**
 * Analyzes a stock ticker and generates trading signals based on technical indicators
 * Strategy:
 * - BUY: RSI < 30 AND Price > EMA200
 * - SELL: RSI > 70
 * - NEUTRAL: Otherwise
 * 
 * @param ticker - Stock ticker symbol (e.g., "BBCA" or "BBCA.JK")
 * @returns AnalysisResult with signal and confidence score
 */
export async function analyzeStock(ticker: string): Promise<AnalysisResult> {
    try {
        // Fetch historical data (1 year / ~250 bars for 52-week range calculation)
        const historicalData = await getHistoricalData(ticker, '1d');

        if (historicalData.length < 200) {
            throw new Error(
                `Insufficient historical data for ${ticker}. Need at least 200 days for EMA200 calculation.`
            );
        }

        // Extract arrays for calculations
        const closes = historicalData.map((d) => d.close);
        const volumes = historicalData.map((d) => d.volume);
        const latestClose = closes[closes.length - 1];

        // Get latest candle data for volatility calculation
        const latestCandle = historicalData[historicalData.length - 1];

        // Get current price (more accurate than latest close)
        let currentPrice: number;
        try {
            currentPrice = await getCurrentPrice(ticker);
        } catch {
            // Fallback to latest close if quote fails
            currentPrice = latestClose;
        }

        // Calculate indicators
        const rsiValues = calculateRSI(closes, 14);
        const macdData = calculateMACD(closes);
        const ema200Values = calculateEMA(closes, 200);
        const ema50Values = calculateEMA(closes, 50);

        // Get latest indicator values
        const latestRSI = rsiValues[rsiValues.length - 1] ?? 50;
        const latestMACD = macdData.MACD[macdData.MACD.length - 1] ?? 0;
        const latestMACDHistogram = macdData.histogram[macdData.histogram.length - 1] ?? 0;
        const latestEMA200 = ema200Values[ema200Values.length - 1] ?? currentPrice;
        const latestEMA50 = ema50Values[ema50Values.length - 1] ?? currentPrice;

        // Calculate 52-week range (use last ~250 bars or all available data)
        const dataFor52w = historicalData.slice(-250); // Last 250 trading days (~1 year)
        const high52w = Math.max(...dataFor52w.map((d) => d.high));
        const low52w = Math.min(...dataFor52w.map((d) => d.low));
        const range52w = high52w - low52w;
        const position52w = range52w > 0
            ? ((currentPrice - low52w) / range52w) * 100
            : 50; // Default to middle if range is 0

        // Calculate Volume Ratio (Current Volume / Average Volume 20)
        const last20Volumes = volumes.slice(-20);
        const avgVolume20 = last20Volumes.reduce((sum, vol) => sum + vol, 0) / last20Volumes.length;
        const currentVolume = volumes[volumes.length - 1] ?? 0;
        const volRatio = avgVolume20 > 0 ? currentVolume / avgVolume20 : 1;

        // Determine Trend Status
        let trendStatus: 'Uptrend' | 'Downtrend' | 'Sideways' = 'Sideways';
        if (currentPrice > latestEMA200 && latestEMA50 > latestEMA200) {
            trendStatus = 'Uptrend';
        } else if (currentPrice < latestEMA200 && latestEMA50 < latestEMA200) {
            trendStatus = 'Downtrend';
        } else {
            trendStatus = 'Sideways';
        }

        // Calculate daily volatility
        const volatility = latestCandle.close > 0
            ? (latestCandle.high - latestCandle.low) / latestCandle.close
            : 0.02; // Default to 2% if calculation fails

        // Determine signal based on strategy
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        let confidenceScore = 50; // Base confidence

        // BUY condition: RSI < 30 AND Price > EMA200
        if (latestRSI < 30 && currentPrice > latestEMA200) {
            signal = 'BUY';
            // Higher confidence if RSI is very oversold (< 25) and price is well above EMA200
            const rsiStrength = (30 - latestRSI) / 30; // 0-1 scale
            const priceStrength = Math.min((currentPrice - latestEMA200) / latestEMA200, 0.1) * 10; // 0-1 scale
            confidenceScore = Math.min(50 + (rsiStrength * 30) + (priceStrength * 20), 95);
        }
        // SELL condition: RSI > 70
        else if (latestRSI > 70) {
            signal = 'SELL';
            // Higher confidence if RSI is very overbought (> 75)
            const rsiStrength = (latestRSI - 70) / 30; // 0-1 scale
            confidenceScore = Math.min(50 + (rsiStrength * 30), 95);
        }
        // NEUTRAL: default case
        else {
            signal = 'NEUTRAL';
            // Lower confidence for neutral signals
            confidenceScore = 30;
        }

        // Calculate predicted price based on dynamic volatility
        let predPrice: number;

        if (latestRSI < 30) {
            // Strong Buy: Rebound from oversold, covering 80% of daily range
            predPrice = currentPrice * (1 + (volatility * 0.8));
        } else if (latestRSI > 70) {
            // Strong Sell: Correction from overbought
            predPrice = currentPrice * (1 - (volatility * 0.8));
        } else {
            // Neutral/Trend Follow: Check MACD Histogram
            if (latestMACDHistogram > 0) {
                // Bullish trend: Small upward movement
                predPrice = currentPrice * (1 + (volatility * 0.3));
            } else {
                // Bearish trend: Small downward movement
                predPrice = currentPrice * (1 - (volatility * 0.3));
            }
        }

        // Round predPrice to nearest integer (IDR stock prices > 50 don't use decimals)
        predPrice = Math.round(predPrice);

        // Calculate prediction percentage
        const predPercent = ((predPrice - currentPrice) / currentPrice) * 100;

        // Generate Human-Readable Summary in Indonesian
        const summaryParts: string[] = [];

        // Trend status
        if (trendStatus === 'Uptrend') {
            summaryParts.push('Tren sedang Naik');
        } else if (trendStatus === 'Downtrend') {
            summaryParts.push('Tren sedang Turun');
        } else {
            summaryParts.push('Tren sedang Sideways');
        }

        // RSI status (Cheap/Expensive)
        if (latestRSI < 30) {
            summaryParts.push(`Harga tergolong Murah (RSI ${Math.round(latestRSI)})`);
        } else if (latestRSI > 70) {
            summaryParts.push(`Harga tergolong Mahal (RSI ${Math.round(latestRSI)})`);
        } else if (latestRSI >= 30 && latestRSI <= 50) {
            summaryParts.push(`Harga tergolong Wajar (RSI ${Math.round(latestRSI)})`);
        } else {
            summaryParts.push(`Harga tergolong Agak Mahal (RSI ${Math.round(latestRSI)})`);
        }

        // Volume status
        if (volRatio > 1.5) {
            summaryParts.push('Ada lonjakan volume transaksi hari ini');
        } else if (volRatio < 0.5) {
            summaryParts.push('Volume transaksi rendah hari ini');
        } else {
            summaryParts.push('Volume transaksi normal');
        }

        // Combine into summary text
        const summaryText = summaryParts.join('. ') + '.';

        // Fetch fundamental data (non-blocking, graceful degradation)
        let fundamentalBadges: AnalysisResult['fundamentalBadges'] = undefined;
        try {
            const fundamentalData = await getFundamentalData(ticker);
            fundamentalBadges = analyzeFundamentals(fundamentalData);
        } catch (error) {
            // Silently fail - fundamental data is optional
            console.warn(`Failed to fetch fundamental data for ${ticker}:`, error);
        }

        // Calculate Bandar Flow Analysis (Bandarmology Proxy)
        let bandarFlow: BandarFlowData | undefined = undefined;
        try {
            // Get last 20 days data for analysis
            const last20Data = historicalData.slice(-20);
            if (last20Data.length >= 20) {
                const last20Closes = last20Data.map((d) => d.close);
                const last20Volumes = last20Data.map((d) => d.volume);
                const last20Timestamps = last20Data.map((d) => d.timestamp);

                // Calculate OBV
                const obvValues = calculateOBV(last20Closes, last20Volumes);

                // Calculate slopes using linear regression (simple approach)
                // Slope = (last value - first value) / number of periods
                const priceSlope = (last20Closes[last20Closes.length - 1] - last20Closes[0]) / last20Closes.length;
                const obvSlope = (obvValues[obvValues.length - 1] - obvValues[0]) / obvValues.length;

                // Normalize slopes to percentage change for comparison
                const priceChangePercent = priceSlope / last20Closes[0];
                const obvChangePercent = obvValues[0] !== 0 ? obvSlope / Math.abs(obvValues[0]) : 0;

                // Determine status based on divergence logic
                let status: BandarFlowData['status'] = 'NEUTRAL';
                const significantThreshold = 0.02; // 2% threshold for "significant" change

                if (Math.abs(priceChangePercent) < 0.01 && obvChangePercent > significantThreshold) {
                    // Price Flat/Down, OBV Rising significantly -> AKUMULASI
                    status = 'AKUMULASI';
                } else if (Math.abs(priceChangePercent) < 0.01 && obvChangePercent < -significantThreshold) {
                    // Price Flat/Up, OBV Falling significantly -> DISTRIBUSI
                    status = 'DISTRIBUSI';
                } else if (priceChangePercent > 0 && obvChangePercent > 0) {
                    // Price Up + OBV Up -> MARKUP
                    status = 'MARKUP';
                } else if (priceChangePercent < 0 && obvChangePercent < 0) {
                    // Price Down + OBV Down -> MARKDOWN
                    status = 'MARKDOWN';
                }

                // Prepare chart data (normalize for visualization)
                const priceData = last20Data.map((d) => ({
                    timestamp: d.timestamp,
                    value: d.close,
                }));

                // Normalize OBV values for chart (0-100 scale for better visualization)
                const obvMin = Math.min(...obvValues);
                const obvMax = Math.max(...obvValues);
                const obvRange = obvMax - obvMin;
                const obvData = obvValues.map((obv, index) => ({
                    timestamp: last20Timestamps[index],
                    value: obvRange > 0 ? ((obv - obvMin) / obvRange) * 100 : 50, // Normalize to 0-100
                }));

                bandarFlow = {
                    status,
                    priceSlope,
                    obvSlope,
                    priceData,
                    obvData,
                };
            }
        } catch (error) {
            // Silently fail - bandar flow analysis is optional
            console.warn(`Failed to calculate bandar flow for ${ticker}:`, error);
        }

        // Detect candlestick patterns
        const candlePatterns = detectCandlePatterns(historicalData);

        // Normalize ticker for display (remove .JK suffix)
        const displayTicker = ticker.toUpperCase().replace('.JK', '');

        const result: AnalysisResult = {
            symbol: displayTicker,
            price: currentPrice,
            rsi: Math.round(latestRSI * 100) / 100, // Round to 2 decimal places
            macd: Math.round(latestMACD * 100) / 100,
            signal: signal,
            confidenceScore: Math.round(confidenceScore),
            predPrice: predPrice,
            predPercent: Math.round(predPercent * 100) / 100, // Round to 2 decimal places
            low52w: Math.round(low52w),
            high52w: Math.round(high52w),
            position52w: Math.round(position52w * 100) / 100, // Round to 2 decimal places
            volRatio: Math.round(volRatio * 100) / 100, // Round to 2 decimal places
            summaryText: summaryText,
            fundamentalBadges: fundamentalBadges,
            bandarFlow: bandarFlow,
            candlePatterns: candlePatterns.length > 0 ? candlePatterns : [],
        };

        return result;
    } catch (error) {
        throw new Error(
            `Failed to analyze stock ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
