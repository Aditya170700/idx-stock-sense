import type { AnalysisResult } from '@/types/stock';
import { cn } from '@/lib/utils/cn';

interface TechnicalSummaryProps {
    data: AnalysisResult;
}

/**
 * Get RSI status text
 */
function getRSIStatusText(rsi: number): string {
    if (rsi < 30) return 'Murah';
    if (rsi > 70) return 'Mahal';
    if (rsi >= 30 && rsi <= 50) return 'Netral';
    return 'Agak Mahal';
}

/**
 * Get MACD status text
 */
function getMACDStatusText(macd: number): string {
    if (macd > 0) return 'Bullish';
    if (macd < 0) return 'Bearish';
    return 'Netral';
}

/**
 * TechnicalSummary component displaying summary text and raw technical details
 */
export function TechnicalSummary({ data }: TechnicalSummaryProps) {
    const { summaryText, rsi, macd, volRatio } = data;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ringkasan Teknis
            </h3>

            {/* Summary Text - Highlighted Box */}
            <div className={cn(
                'mb-6 p-4 rounded-lg',
                'bg-blue-50 dark:bg-blue-900/20',
                'border border-blue-200 dark:border-blue-800'
            )}>
                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {summaryText}
                </p>
            </div>

            {/* Raw Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RSI */}
                <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        RSI
                    </div>
                    <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                        {rsi.toFixed(2)}
                    </div>
                    <div className={cn(
                        'text-sm font-semibold',
                        rsi < 30 ? 'text-green-600 dark:text-green-400' :
                            rsi > 70 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                    )}>
                        ({getRSIStatusText(rsi)})
                    </div>
                </div>

                {/* MACD */}
                <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        MACD
                    </div>
                    <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                        {macd.toFixed(4)}
                    </div>
                    <div className={cn(
                        'text-sm font-semibold',
                        macd > 0 ? 'text-green-600 dark:text-green-400' :
                            macd < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                    )}>
                        ({getMACDStatusText(macd)})
                    </div>
                </div>

                {/* Volume Ratio */}
                <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Vol Ratio
                    </div>
                    <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                        {volRatio.toFixed(2)}x
                    </div>
                    <div className={cn(
                        'text-sm font-semibold',
                        volRatio > 1.5 ? 'text-green-600 dark:text-green-400' :
                            volRatio < 0.5 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                    )}>
                        {volRatio > 1.5 ? 'Tinggi' : volRatio < 0.5 ? 'Rendah' : 'Normal'}
                    </div>
                </div>
            </div>
        </div>
    );
}
