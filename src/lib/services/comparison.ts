import { analyzeStock } from './analyzer';
import { getFundamentalData } from './market-data';
import type { ComparisonResult } from '@/types/stock';

/**
 * Compares two stocks and determines winner for each metric
 * @param tickerA - First stock ticker symbol
 * @param tickerB - Second stock ticker symbol
 * @returns ComparisonResult with analysis and winners
 */
export async function compareStocks(tickerA: string, tickerB: string): Promise<ComparisonResult> {
    // Fetch analysis for both stocks in parallel
    const [analysisA, analysisB] = await Promise.all([
        analyzeStock(tickerA),
        analyzeStock(tickerB),
    ]);

    // Fetch fundamental data for both stocks in parallel
    const [fundamentalA, fundamentalB] = await Promise.all([
        getFundamentalData(tickerA).catch(() => ({})),
        getFundamentalData(tickerB).catch(() => ({})),
    ]);

    // Determine winners for each metric
    const winners: ComparisonResult['winners'] = {
        valuation: determineValuationWinner(fundamentalA, fundamentalB),
        momentum: determineMomentumWinner(analysisA, analysisB),
        profitability: determineProfitabilityWinner(fundamentalA, fundamentalB),
        bandarmology: determineBandarmologyWinner(analysisA, analysisB),
    };

    // Generate AI Verdict
    const verdict = generateVerdict(analysisA, analysisB, fundamentalA, fundamentalB, winners);

    return {
        stockA: {
            symbol: analysisA.symbol,
            analysis: analysisA,
            fundamentalData: fundamentalA,
        },
        stockB: {
            symbol: analysisB.symbol,
            analysis: analysisB,
            fundamentalData: fundamentalB,
        },
        winners,
        verdict,
    };
}

/**
 * Determines valuation winner (lower PER/PBV wins)
 */
function determineValuationWinner(
    fundamentalA: { trailingPE?: number; priceToBook?: number },
    fundamentalB: { trailingPE?: number; priceToBook?: number }
): 'A' | 'B' | 'TIE' {
    const peA = fundamentalA.trailingPE ?? Infinity;
    const pbvA = fundamentalA.priceToBook ?? Infinity;
    const peB = fundamentalB.trailingPE ?? Infinity;
    const pbvB = fundamentalB.priceToBook ?? Infinity;

    // Use PER if available, otherwise use PBV
    const scoreA = peA !== Infinity ? peA : pbvA;
    const scoreB = peB !== Infinity ? peB : pbvB;

    if (scoreA === Infinity && scoreB === Infinity) return 'TIE';
    if (scoreA === Infinity) return 'B';
    if (scoreB === Infinity) return 'A';

    if (scoreA < scoreB) return 'A';
    if (scoreB < scoreA) return 'B';
    return 'TIE';
}

/**
 * Determines momentum winner (RSI closer to 50 or Bullish trend wins)
 */
function determineMomentumWinner(
    analysisA: { rsi: number; signal: string },
    analysisB: { rsi: number; signal: string }
): 'A' | 'B' | 'TIE' {
    // Calculate RSI distance from 50 (neutral)
    const rsiDistanceA = Math.abs(analysisA.rsi - 50);
    const rsiDistanceB = Math.abs(analysisB.rsi - 50);

    // Prefer BUY signal over NEUTRAL/SELL
    const signalScoreA = analysisA.signal === 'BUY' ? 1 : analysisA.signal === 'SELL' ? -1 : 0;
    const signalScoreB = analysisB.signal === 'BUY' ? 1 : analysisB.signal === 'SELL' ? -1 : 0;

    // Combined score: lower RSI distance + better signal
    const scoreA = -rsiDistanceA + signalScoreA * 10;
    const scoreB = -rsiDistanceB + signalScoreB * 10;

    if (scoreA > scoreB) return 'A';
    if (scoreB > scoreA) return 'B';
    return 'TIE';
}

/**
 * Determines profitability winner (higher EPS wins)
 */
function determineProfitabilityWinner(
    fundamentalA: { trailingEps?: number },
    fundamentalB: { trailingEps?: number }
): 'A' | 'B' | 'TIE' {
    const epsA = fundamentalA.trailingEps ?? -Infinity;
    const epsB = fundamentalB.trailingEps ?? -Infinity;

    if (epsA === -Infinity && epsB === -Infinity) return 'TIE';
    if (epsA === -Infinity) return 'B';
    if (epsB === -Infinity) return 'A';

    if (epsA > epsB) return 'A';
    if (epsB > epsA) return 'B';
    return 'TIE';
}

/**
 * Determines bandarmology winner (Accumulation beats Distribution)
 */
function determineBandarmologyWinner(
    analysisA: { bandarFlow?: { status: string } },
    analysisB: { bandarFlow?: { status: string } }
): 'A' | 'B' | 'TIE' {
    const statusA = analysisA.bandarFlow?.status ?? 'NEUTRAL';
    const statusB = analysisB.bandarFlow?.status ?? 'NEUTRAL';

    // Score: AKUMULASI > MARKUP > NEUTRAL > MARKDOWN > DISTRIBUSI
    const statusScore: Record<string, number> = {
        AKUMULASI: 5,
        MARKUP: 4,
        NEUTRAL: 3,
        MARKDOWN: 2,
        DISTRIBUSI: 1,
    };

    const scoreA = statusScore[statusA] ?? 3;
    const scoreB = statusScore[statusB] ?? 3;

    if (scoreA > scoreB) return 'A';
    if (scoreB > scoreA) return 'B';
    return 'TIE';
}

/**
 * Generates AI verdict summary based on comparison results
 */
function generateVerdict(
    analysisA: { symbol: string },
    analysisB: { symbol: string },
    fundamentalA: { trailingPE?: number; trailingEps?: number },
    fundamentalB: { trailingPE?: number; trailingEps?: number },
    winners: ComparisonResult['winners']
): string {
    const parts: string[] = [];

    // Fundamental comparison
    const fundamentalWins = [
        winners.valuation === 'A' ? 1 : winners.valuation === 'B' ? -1 : 0,
        winners.profitability === 'A' ? 1 : winners.profitability === 'B' ? -1 : 0,
    ].reduce((sum, val) => sum + val, 0);

    if (fundamentalWins > 0) {
        parts.push(`Secara fundamental, **${analysisA.symbol}** lebih unggul`);
    } else if (fundamentalWins < 0) {
        parts.push(`Secara fundamental, **${analysisB.symbol}** lebih unggul`);
    }

    // Technical comparison
    const technicalWins = [
        winners.momentum === 'A' ? 1 : winners.momentum === 'B' ? -1 : 0,
        winners.bandarmology === 'A' ? 1 : winners.bandarmology === 'B' ? -1 : 0,
    ].reduce((sum, val) => sum + val, 0);

    if (technicalWins > 0) {
        parts.push(`secara teknikal, **${analysisA.symbol}** memiliki momentum jangka pendek yang lebih baik`);
    } else if (technicalWins < 0) {
        parts.push(`secara teknikal, **${analysisB.symbol}** memiliki momentum jangka pendek yang lebih baik`);
    }

    // Overall winner
    const totalWins = fundamentalWins + technicalWins;
    if (totalWins > 0) {
        parts.push(`Secara keseluruhan, **${analysisA.symbol}** menunjukkan performa yang lebih baik berdasarkan analisis fundamental dan teknikal.`);
    } else if (totalWins < 0) {
        parts.push(`Secara keseluruhan, **${analysisB.symbol}** menunjukkan performa yang lebih baik berdasarkan analisis fundamental dan teknikal.`);
    } else {
        parts.push(`Kedua saham memiliki kelebihan masing-masing. Pilih sesuai dengan strategi investasi Anda.`);
    }

    return parts.join('. ') + '.';
}
