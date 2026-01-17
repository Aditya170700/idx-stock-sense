'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, GitCompare } from 'lucide-react';
import { compareTickers } from '@/app/actions/stock-actions';
import type { ComparisonResult } from '@/types/stock';
import { cn } from '@/lib/utils/cn';

type ActionState = {
    success: boolean;
    data?: ComparisonResult;
    error?: string;
} | null;

/**
 * Submit button component with loading state
 */
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                'px-6 py-2 rounded-lg font-semibold text-white',
                'transition-all duration-200 flex items-center gap-2',
                pending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
                'disabled:opacity-50'
            )}
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Comparing...
                </>
            ) : (
                <>
                    <GitCompare className="w-4 h-4" /> Compare
                </>
            )}
        </button>
    );
}

/**
 * Format value for display
 */
function formatValue(value: number | undefined, type: 'price' | 'ratio' | 'percent' = 'price'): string {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';

    if (type === 'price') {
        return `Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (type === 'ratio') {
        return value.toFixed(2);
    }
    if (type === 'percent') {
        return `${value.toFixed(2)}%`;
    }
    return String(value);
}

/**
 * Get bandarmology status display
 */
function getBandarmologyStatus(status?: string): string {
    if (!status) return 'N/A';
    const statusMap: Record<string, string> = {
        AKUMULASI: 'Akumulasi',
        DISTRIBUSI: 'Distribusi',
        MARKUP: 'Markup',
        MARKDOWN: 'Markdown',
        NEUTRAL: 'Neutral',
    };
    return statusMap[status] ?? status;
}

/**
 * ComparisonView component - displays side-by-side stock comparison
 */
export function ComparisonView() {
    const [state, formAction] = useActionState<ActionState, FormData>(
        async (prevState: ActionState, formData: FormData) => {
            return await compareTickers(formData);
        },
        null
    );

    const [tickerA, setTickerA] = useState('');
    const [tickerB, setTickerB] = useState('');

    // Reset inputs when form is submitted successfully
    useEffect(() => {
        if (state?.success) {
            const timeoutId = setTimeout(() => {
                setTickerA('');
                setTickerB('');
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [state?.success]);

    return (
        <div>
            {/* Search Bars - Side by Side */}
            <div className="mb-8">
                <form action={formAction} className="w-full max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Stock A Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stock A
                            </label>
                            <input
                                type="text"
                                name="tickerA"
                                value={tickerA}
                                placeholder="BBCA"
                                required
                                onChange={(e) => {
                                    const upperValue = e.target.value.toUpperCase();
                                    setTickerA(upperValue);
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white text-lg uppercase"
                            />
                        </div>

                        {/* Stock B Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stock B
                            </label>
                            <input
                                type="text"
                                name="tickerB"
                                value={tickerB}
                                placeholder="BMRI"
                                required
                                onChange={(e) => {
                                    const upperValue = e.target.value.toUpperCase();
                                    setTickerB(upperValue);
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white text-lg uppercase"
                            />
                        </div>
                    </div>

                    {/* Compare Button */}
                    <div className="flex justify-center">
                        <SubmitButton />
                    </div>

                    {/* Error Display */}
                    {state?.error && (
                        <div className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
                            {state.error}
                        </div>
                    )}
                </form>
            </div>

            {/* Comparison Results */}
            {state?.success && state.data && (
                <div className="space-y-6">
                    {/* Comparison Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Metrik
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                            {state.data.stockA.symbol}
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                            {state.data.stockB.symbol}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {/* Harga */}
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Harga
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            'text-gray-900 dark:text-white'
                                        )}>
                                            {formatValue(state.data.stockA.analysis.price, 'price')}
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            'text-gray-900 dark:text-white'
                                        )}>
                                            {formatValue(state.data.stockB.analysis.price, 'price')}
                                        </td>
                                    </tr>

                                    {/* Trend / Signal */}
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Trend / Signal
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center font-semibold',
                                            state.data.winners.momentum === 'A'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {state.data.stockA.analysis.signal}
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center font-semibold',
                                            state.data.winners.momentum === 'B'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {state.data.stockB.analysis.signal}
                                        </td>
                                    </tr>

                                    {/* RSI */}
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            RSI
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            state.data.winners.momentum === 'A'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {state.data.stockA.analysis.rsi.toFixed(2)}
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            state.data.winners.momentum === 'B'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {state.data.stockB.analysis.rsi.toFixed(2)}
                                        </td>
                                    </tr>

                                    {/* Valuasi (PER) */}
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Valuasi (PER)
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            state.data.winners.valuation === 'A'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {formatValue(state.data.stockA.fundamentalData?.trailingPE, 'ratio')}
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            state.data.winners.valuation === 'B'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {formatValue(state.data.stockB.fundamentalData?.trailingPE, 'ratio')}
                                        </td>
                                    </tr>

                                    {/* Profitabilitas (EPS) */}
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Profitabilitas (EPS)
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            state.data.winners.profitability === 'A'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {formatValue(state.data.stockA.fundamentalData?.trailingEps, 'price')}
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            state.data.winners.profitability === 'B'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {formatValue(state.data.stockB.fundamentalData?.trailingEps, 'price')}
                                        </td>
                                    </tr>

                                    {/* Bandar Flow */}
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Bandar Flow
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            state.data.winners.bandarmology === 'A'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {getBandarmologyStatus(state.data.stockA.analysis.bandarFlow?.status)}
                                        </td>
                                        <td className={cn(
                                            'px-6 py-4 text-sm text-center',
                                            state.data.winners.bandarmology === 'B'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                                                : 'text-gray-900 dark:text-white'
                                        )}>
                                            {getBandarmologyStatus(state.data.stockB.analysis.bandarFlow?.status)}
                                        </td>
                                    </tr>

                                    {/* Confidence Score */}
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Confidence Score
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-white">
                                            {state.data.stockA.analysis.confidenceScore}/100
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-white">
                                            {state.data.stockB.analysis.confidenceScore}/100
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Verdict Section */}
                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Verdict
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {state.data.verdict.split('**').map((part, index) => {
                                if (index % 2 === 1) {
                                    // Bold text (between **)
                                    return <strong key={index} className="text-blue-700 dark:text-blue-300">{part}</strong>;
                                }
                                return <span key={index}>{part}</span>;
                            })}
                        </p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!state && (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Enter two ticker symbols above to compare stocks
                    </p>
                </div>
            )}
        </div>
    );
}
