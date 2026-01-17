import type { AnalysisResult } from '@/types/stock';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceCardProps {
    data: AnalysisResult;
}

/**
 * Get RSI status badge
 */
function getRSIBadge(rsi: number): { label: string; color: string; bgColor: string } {
    if (rsi < 30) {
        return {
            label: 'Murah',
            color: 'text-green-700 dark:text-green-300',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
        };
    }
    if (rsi > 70) {
        return {
            label: 'Mahal',
            color: 'text-red-700 dark:text-red-300',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
        };
    }
    if (rsi >= 30 && rsi <= 50) {
        return {
            label: 'Wajar',
            color: 'text-blue-700 dark:text-blue-300',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        };
    }
    return {
        label: 'Agak Mahal',
        color: 'text-orange-700 dark:text-orange-300',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    };
}

/**
 * Get Volume badge
 */
function getVolumeBadge(volRatio: number): { label: string; color: string; bgColor: string } {
    if (volRatio > 1.5) {
        return {
            label: 'Ramai',
            color: 'text-purple-700 dark:text-purple-300',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        };
    }
    if (volRatio < 0.5) {
        return {
            label: 'Sepi',
            color: 'text-gray-700 dark:text-gray-300',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
        };
    }
    return {
        label: 'Normal',
        color: 'text-blue-700 dark:text-blue-300',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    };
}

/**
 * Get Trend badge
 */
function getTrendBadge(summaryText: string): { label: string; color: string; bgColor: string; icon: React.ReactNode } {
    if (summaryText.includes('Naik')) {
        return {
            label: 'Uptrend',
            color: 'text-green-700 dark:text-green-300',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            icon: <TrendingUp className="w-4 h-4" />,
        };
    }
    if (summaryText.includes('Turun')) {
        return {
            label: 'Downtrend',
            color: 'text-red-700 dark:text-red-300',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            icon: <TrendingDown className="w-4 h-4" />,
        };
    }
    return {
        label: 'Sideways',
        color: 'text-gray-700 dark:text-gray-300',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        icon: <Minus className="w-4 h-4" />,
    };
}

/**
 * PriceCard component displaying current price, predicted price, badges, and 52-week range
 */
export function PriceCard({ data }: PriceCardProps) {
    const {
        symbol,
        price,
        predPrice,
        predPercent,
        signal,
        confidenceScore,
        low52w,
        high52w,
        position52w,
        rsi,
        volRatio,
        summaryText,
    } = data;

    const rsiBadge = getRSIBadge(rsi);
    const volumeBadge = getVolumeBadge(volRatio);
    const trendBadge = getTrendBadge(summaryText);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {symbol}
                    </div>
                    <div className={cn(
                        'px-4 py-1.5 rounded-full text-xs font-bold uppercase',
                        signal === 'BUY'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : signal === 'SELL'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    )}>
                        {signal}
                    </div>
                </div>

                {/* Current Price */}
                <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Harga Saat Ini</div>
                    <div className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                        Rp {price.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>

                {/* Predicted Price - Big Orange Display */}
                {predPrice && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Prediksi Besok
                        </div>
                        <div className="flex items-baseline gap-3">
                            <div className="text-5xl font-black tracking-tight text-orange-600 dark:text-orange-400">
                                Rp {predPrice.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                            {predPercent && (
                                <div className={cn(
                                    'text-xl font-black',
                                    predPercent >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                )}>
                                    {predPercent >= 0 ? '+' : ''}{predPercent.toFixed(2)}%
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2">
                    {/* Trend Badge */}
                    <div className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                        trendBadge.color,
                        trendBadge.bgColor
                    )}>
                        {trendBadge.icon}
                        {trendBadge.label}
                    </div>

                    {/* RSI Badge */}
                    <div className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                        rsiBadge.color,
                        rsiBadge.bgColor
                    )}>
                        {rsiBadge.label}
                    </div>

                    {/* Volume Badge */}
                    <div className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                        volumeBadge.color,
                        volumeBadge.bgColor
                    )}>
                        {volumeBadge.label}
                    </div>
                </div>

                {/* 52-Week Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Posisi Harga Setahun Terakhir
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {position52w.toFixed(1)}%
                        </span>
                    </div>
                    <div className="relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className="h-3 rounded-full bg-linear-to-r from-red-500 via-yellow-500 to-green-500"
                                style={{ width: '100%' }}
                            />
                            <div
                                className="absolute top-0 h-3 rounded-full bg-gray-900 dark:bg-white opacity-80"
                                style={{
                                    left: `${position52w}%`,
                                    width: '2px',
                                    transform: 'translateX(-50%)',
                                }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                            <span>Rp {low52w.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            <span>Rp {high52w.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                        <span className={cn(
                            'text-lg font-semibold',
                            confidenceScore >= 70 ? 'text-green-600 dark:text-green-400' :
                                confidenceScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-orange-600 dark:text-orange-400'
                        )}>
                            {confidenceScore}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={cn(
                                'h-2 rounded-full transition-all duration-300',
                                confidenceScore >= 70 ? 'bg-green-500' :
                                    confidenceScore >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                            )}
                            style={{ width: `${confidenceScore}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
