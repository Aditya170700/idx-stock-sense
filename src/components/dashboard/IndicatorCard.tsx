import type { AnalysisResult } from '@/types/stock';
import { cn } from '@/lib/utils/cn';

interface IndicatorCardProps {
    data: AnalysisResult;
}

/**
 * Get RSI status and color based on value
 */
function getRSIStatus(rsi: number): { label: string; color: string } {
    if (rsi >= 70) {
        return { label: 'Overbought', color: 'text-red-600 dark:text-red-400' };
    }
    if (rsi <= 30) {
        return { label: 'Oversold', color: 'text-green-600 dark:text-green-400' };
    }
    return { label: 'Neutral', color: 'text-gray-600 dark:text-gray-400' };
}

/**
 * Get MACD status based on value
 */
function getMACDStatus(macd: number): { label: string; color: string } {
    if (macd > 0) {
        return { label: 'Bullish', color: 'text-green-600 dark:text-green-400' };
    }
    if (macd < 0) {
        return { label: 'Bearish', color: 'text-red-600 dark:text-red-400' };
    }
    return { label: 'Neutral', color: 'text-gray-600 dark:text-gray-400' };
}

/**
 * IndicatorCard component displaying technical indicators in a grid
 */
export function IndicatorCard({ data }: IndicatorCardProps) {
    const { rsi, macd } = data;
    const rsiStatus = getRSIStatus(rsi);
    const macdStatus = getMACDStatus(macd);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Technical Indicators
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RSI Indicator */}
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        RSI (14)
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {rsi.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${rsiStatus.color}`}>
                        {rsiStatus.label}
                    </div>
                    {/* RSI Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div
                            className={cn(
                                'h-2 rounded-full',
                                rsi >= 70 ? 'bg-red-500' :
                                    rsi <= 30 ? 'bg-green-500' : 'bg-gray-500'
                            )}
                            style={{ width: `${Math.min(rsi, 100)}%` }}
                        />
                    </div>
                </div>

                {/* MACD Indicator */}
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        MACD
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {macd.toFixed(4)}
                    </div>
                    <div className={`text-sm font-medium ${macdStatus.color}`}>
                        {macdStatus.label}
                    </div>
                    {/* MACD Visual Indicator */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className={cn(
                            'w-3 h-3 rounded-full',
                            macd > 0 ? 'bg-green-500' :
                                macd < 0 ? 'bg-red-500' : 'bg-gray-500'
                        )} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {macd > 0 ? 'Above zero line' : macd < 0 ? 'Below zero line' : 'At zero line'}
                        </span>
                    </div>
                </div>

                {/* Volume Info Placeholder */}
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Volume Analysis
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        —
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Not available
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Volume data will be available in chart view
                    </div>
                </div>
            </div>
        </div>
    );
}
