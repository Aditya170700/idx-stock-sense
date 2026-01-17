'use client';

import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { scanMarket } from '@/app/actions/stock-actions';
import { StockMultiSelect } from '@/components/dashboard/StockMultiSelect';
import type { AnalysisResult } from '@/types/stock';
import { cn } from '@/lib/utils/cn';

/**
 * Get signal badge color classes - Standard trading colors
 */
function getSignalBadgeClass(signal: AnalysisResult['signal']): string {
    switch (signal) {
        case 'BUY':
            return 'bg-green-500 text-white dark:bg-green-600 dark:text-white';
        case 'SELL':
            return 'bg-red-500 text-white dark:bg-red-600 dark:text-white';
        case 'NEUTRAL':
            return 'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
}

/**
 * PredictionAllView component - Market Scanner with table results
 */
export function PredictionAllView() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

    const handleScan = async () => {
        setLoading(true);
        setError(null);
        setResults([]);

        try {
            // Pass selected tickers (empty array means use default tickers)
            const response = await scanMarket(selectedTickers.length > 0 ? selectedTickers : undefined);

            if (response.success && response.data) {
                setResults(response.data);
            } else {
                setError(response.error || 'Failed to scan market');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Scan Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Market Scanner
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Scan multiple stocks to find potential trading signals
                    </p>
                </div>
            </div>

            {/* Multi-Select Ticker Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Tickers (leave empty to scan all default tickers)
                </label>
                <StockMultiSelect
                    selectedTickers={selectedTickers}
                    onSelectionChange={setSelectedTickers}
                    maxSelections={50}
                />
                <button
                    onClick={handleScan}
                    disabled={loading || selectedTickers.length === 0}
                    className={cn(
                        'px-6 py-2 rounded-lg font-semibold text-white mt-4',
                        'transition-all duration-200 flex items-center gap-2',
                        loading || selectedTickers.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" /> Compute / Scan
                        </>
                    )}
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            Scanning market...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            Analyzing multiple stocks, this may take a moment
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Results Table */}
            {!loading && results.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto w-full sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-700">
                                            Code
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-700">
                                            Close Price
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-700">
                                            Pred Price
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-700">
                                            Signal
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-700">
                                            Confidence
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result) => {
                                        const predPrice = result.predPrice ?? result.price;
                                        return (
                                            <tr
                                                key={result.symbol}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
                                            >
                                                <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                                    {result.symbol}
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                                    Rp {result.price.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                                    Rp {predPrice.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-sm text-center border-r border-gray-200 dark:border-gray-700">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-semibold',
                                                            getSignalBadgeClass(result.signal)
                                                        )}
                                                    >
                                                        {result.signal}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                                                    {result.confidenceScore}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && !error && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Click &quot;Compute / Scan&quot; to analyze multiple stocks
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            This will scan the market and display potential trading signals
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
