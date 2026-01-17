import {
    RSI,
    MACD,
    ATR,
    EMA,
} from 'technicalindicators';
import type { StockData } from '@/types/stock';

/**
 * Calculates Relative Strength Index (RSI)
 * @param closes - Array of closing prices
 * @param period - RSI period (default: 14)
 * @returns Array of RSI values (0-100)
 */
export function calculateRSI(
    closes: number[],
    period: number = 14
): number[] {
    if (closes.length < period + 1) {
        throw new Error(`Insufficient data for RSI calculation. Need at least ${period + 1} data points.`);
    }

    const rsi = RSI.calculate({
        values: closes,
        period: period,
    });

    return rsi;
}

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 * @param closes - Array of closing prices
 * @returns Array of MACD values with signal and histogram
 */
export function calculateMACD(closes: number[]): {
    MACD: number[];
    signal: number[];
    histogram: number[];
} {
    if (closes.length < 26) {
        throw new Error('Insufficient data for MACD calculation. Need at least 26 data points.');
    }

    const macd = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    });

    return {
        MACD: macd.map((item) => item.MACD ?? 0),
        signal: macd.map((item) => item.signal ?? 0),
        histogram: macd.map((item) => item.histogram ?? 0),
    };
}

/**
 * Calculates VWAP (Volume Weighted Average Price)
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of close prices
 * @param volume - Array of volumes
 * @returns Array of VWAP values
 */
export function calculateVWAP(
    high: number[],
    low: number[],
    close: number[],
    volume: number[]
): number[] {
    if (
        high.length !== low.length ||
        low.length !== close.length ||
        close.length !== volume.length
    ) {
        throw new Error('All arrays must have the same length for VWAP calculation.');
    }

    const vwap: number[] = [];
    let cumulativeTPV = 0; // Cumulative Typical Price * Volume
    let cumulativeVolume = 0;

    for (let i = 0; i < close.length; i++) {
        const typicalPrice = (high[i] + low[i] + close[i]) / 3;
        const tpv = typicalPrice * volume[i];

        cumulativeTPV += tpv;
        cumulativeVolume += volume[i];

        if (cumulativeVolume === 0) {
            vwap.push(typicalPrice);
        } else {
            vwap.push(cumulativeTPV / cumulativeVolume);
        }
    }

    return vwap;
}

/**
 * Calculates ATR (Average True Range)
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of close prices
 * @param period - ATR period (default: 14)
 * @returns Array of ATR values
 */
export function calculateATR(
    high: number[],
    low: number[],
    close: number[],
    period: number = 14
): number[] {
    if (
        high.length !== low.length ||
        low.length !== close.length
    ) {
        throw new Error('All arrays must have the same length for ATR calculation.');
    }

    if (high.length < period + 1) {
        throw new Error(`Insufficient data for ATR calculation. Need at least ${period + 1} data points.`);
    }

    const atr = ATR.calculate({
        high: high,
        low: low,
        close: close,
        period: period,
    });

    return atr;
}

/**
 * Calculates EMA (Exponential Moving Average)
 * @param values - Array of values (usually closing prices)
 * @param period - EMA period (default: 200)
 * @returns Array of EMA values
 */
export function calculateEMA(
    values: number[],
    period: number = 200
): number[] {
    if (values.length < period) {
        throw new Error(`Insufficient data for EMA calculation. Need at least ${period} data points.`);
    }

    const ema = EMA.calculate({
        values: values,
        period: period,
    });

    return ema;
}

/**
 * Calculates Session VWAP (Volume Weighted Average Price) anchored to trading day start
 * Resets cumulative values whenever the date changes
 * @param data - Array of StockData with timestamps
 * @returns Array of VWAP values matching input data length
 */
export function calculateSessionVWAP(data: StockData[]): number[] {
    if (data.length === 0) {
        return [];
    }

    const vwap: number[] = [];
    let currentDate = '';
    let cumulativeTPV = 0; // Cumulative Typical Price * Volume
    let cumulativeVolume = 0;

    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const date = new Date(item.timestamp);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Reset cumulative values when date changes (new trading session)
        if (dateKey !== currentDate) {
            cumulativeTPV = 0;
            cumulativeVolume = 0;
            currentDate = dateKey;
        }

        // Calculate Typical Price
        const typicalPrice = (item.high + item.low + item.close) / 3;
        const tpv = typicalPrice * item.volume;

        // Update cumulative values
        cumulativeTPV += tpv;
        cumulativeVolume += item.volume;

        // Calculate VWAP for this candle
        if (cumulativeVolume === 0) {
            vwap.push(typicalPrice);
        } else {
            vwap.push(cumulativeTPV / cumulativeVolume);
        }
    }

    return vwap;
}

/**
 * Calculates OBV (On-Balance Volume) - cumulative volume indicator
 * OBV increases when price closes higher, decreases when price closes lower
 * @param closes - Array of closing prices
 * @param volumes - Array of volumes
 * @returns Array of OBV values
 */
export function calculateOBV(closes: number[], volumes: number[]): number[] {
    if (closes.length !== volumes.length) {
        throw new Error('Closes and volumes arrays must have the same length for OBV calculation.');
    }

    if (closes.length === 0) {
        return [];
    }

    const obv: number[] = [];
    let cumulativeOBV = 0;

    for (let i = 0; i < closes.length; i++) {
        if (i === 0) {
            // First value: OBV = volume (no previous close to compare)
            cumulativeOBV = volumes[i];
        } else {
            const currentClose = closes[i];
            const previousClose = closes[i - 1];

            if (currentClose > previousClose) {
                // Price up: add volume
                cumulativeOBV += volumes[i];
            } else if (currentClose < previousClose) {
                // Price down: subtract volume
                cumulativeOBV -= volumes[i];
            } else {
                // Price unchanged: OBV stays the same
                // cumulativeOBV remains unchanged
            }
        }

        obv.push(cumulativeOBV);
    }

    return obv;
}
