'use client';

import { TrendingUp, Target, BarChart3, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * QuickGuide component - Educational panel for beginners
 */
export function QuickGuide() {
    return (
        <div className={cn(
            'bg-linear-to-br from-blue-50 to-indigo-50',
            'dark:from-blue-900/20 dark:to-indigo-900/20',
            'rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border border-blue-200 dark:border-blue-800'
        )}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Panduan Pemula
            </h3>

            <div className="space-y-6">
                {/* Prediksi Section */}
                <div className="flex gap-4">
                    <div className="shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Prediksi
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Jika positif, potensi naik. Jika negatif, potensi turun.
                        </p>
                    </div>
                </div>

                {/* Confidence Section */}
                <div className="flex gap-4">
                    <div className="shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Confidence
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Tingkat keyakinan sistem berdasarkan pola masa lalu.
                        </p>
                    </div>
                </div>

                {/* RSI Section */}
                <div className="flex gap-4">
                    <div className="shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            RSI (Indikator Momentum)
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            &lt; 30 artinya Murah (Jenuh Jual). &gt; 70 artinya Mahal (Jenuh Beli).
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className={cn(
                    'mt-6 pt-6 border-t border-blue-200 dark:border-blue-800',
                    'flex gap-3'
                )}>
                    <AlertCircle className="w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        <strong className="text-gray-900 dark:text-white">Disclaimer:</strong> Ini bukan ajakan membeli. Gunakan sebagai referensi saja.
                    </p>
                </div>
            </div>
        </div>
    );
}
