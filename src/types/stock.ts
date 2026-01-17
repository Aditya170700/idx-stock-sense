/**
 * Stock data interface representing OHLCV (Open, High, Low, Close, Volume) data
 */
export interface StockData {
    timestamp: number; // Unix timestamp in milliseconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

/**
 * Ticker data interface from tickers.json
 */
export interface TickerData {
    No: number;
    Code: string;
    'Company Name': string;
    'Listing Date'?: string;
    Shares?: string;
    'Listing Board'?: string;
}

/**
 * Fundamental badge interface
 */
export interface FundamentalBadge {
    label: string;
    color: string;
    bgColor: string;
    iconName: string; // Icon name to be mapped to React component in UI
    description: string;
    reason: string; // Detailed explanation with actual values for beginners
}

/**
 * Bandar Flow Analysis Data
 */
export interface BandarFlowData {
    status: 'AKUMULASI' | 'DISTRIBUSI' | 'MARKUP' | 'MARKDOWN' | 'NEUTRAL';
    priceSlope: number; // Price trend slope (last 20 days)
    obvSlope: number; // OBV trend slope (last 20 days)
    priceData: Array<{ timestamp: number; value: number }>; // Last 20 days price data for chart
    obvData: Array<{ timestamp: number; value: number }>; // Last 20 days OBV data for chart
}

/**
 * Candlestick pattern interface
 */
export interface CandlestickPattern {
    name: string; // Pattern name (e.g., "Bullish Engulfing")
    label: string; // Human-readable label in Indonesian
    color: string; // Text color class
    bgColor: string; // Background color class
}

/**
 * Analysis result interface containing technical indicators and trading signal
 */
export interface AnalysisResult {
    symbol: string;
    price: number;
    rsi: number; // Relative Strength Index (0-100)
    macd: number; // MACD value
    signal: 'BUY' | 'SELL' | 'NEUTRAL';
    confidenceScore: number; // 0-100, indicating confidence level of the signal
    predPrice?: number; // Predicted price based on dynamic volatility
    predPercent?: number; // Prediction percentage change
    low52w: number; // 52-week low price
    high52w: number; // 52-week high price
    position52w: number; // Position in 52-week range (0-100%)
    volRatio: number; // Volume ratio (current volume / average volume 20)
    summaryText: string; // Human-readable summary in Indonesian
    fundamentalBadges?: FundamentalBadge[]; // Fundamental health check badges
    bandarFlow?: BandarFlowData; // Bandarmology proxy analysis
    candlePatterns?: CandlestickPattern[]; // Detected candlestick patterns
}

/**
 * Comparison result interface for stock comparison
 */
export interface ComparisonResult {
    stockA: {
        symbol: string;
        analysis: AnalysisResult;
        fundamentalData?: {
            trailingPE?: number;
            priceToBook?: number;
            trailingEps?: number;
            dividendYield?: number;
        };
    };
    stockB: {
        symbol: string;
        analysis: AnalysisResult;
        fundamentalData?: {
            trailingPE?: number;
            priceToBook?: number;
            trailingEps?: number;
            dividendYield?: number;
        };
    };
    winners: {
        valuation: 'A' | 'B' | 'TIE'; // Lower PER/PBV wins
        momentum: 'A' | 'B' | 'TIE'; // RSI closer to 50 or Bullish trend wins
        profitability: 'A' | 'B' | 'TIE'; // Higher EPS wins
        bandarmology: 'A' | 'B' | 'TIE'; // Accumulation beats Distribution
    };
    verdict: string; // AI-generated summary verdict
}
