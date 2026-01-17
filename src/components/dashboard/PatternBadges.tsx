'use client';

import type { CandlestickPattern } from '@/types/stock';
import { cn } from '@/lib/utils/cn';

interface PatternBadgesProps {
    patterns: CandlestickPattern[];
}

/**
 * PatternBadges component displaying detected candlestick patterns
 */
export function PatternBadges({ patterns }: PatternBadgesProps) {
            if (!patterns || patterns.length === 0) {
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Pola Candlestick Terdeteksi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tidak ada pola candle signifikan hari ini.
                </p>
            </div>
        );
    }

            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Pola Candlestick Terdeteksi
                    </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Pola candlestick yang terdeteksi dari pergerakan harga terakhir dapat mengindikasikan potensi pembalikan atau kelanjutan tren.
            </p>
            <div className="flex flex-wrap gap-2">
                {patterns.map((pattern, index) => (
                    <div
                        key={index}
                        className={cn(
                            'px-3 py-2 rounded-lg text-sm font-medium',
                            pattern.color,
                            pattern.bgColor
                        )}
                    >
                        {pattern.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
