'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ChartCandlestick, Loader2 } from 'lucide-react';
import { analyzeTicker, getChartData } from '@/app/actions/stock-actions';
import { PriceCard } from '@/components/dashboard/PriceCard';
import { StockChart } from '@/components/dashboard/StockChart';
import { TechnicalSummary } from '@/components/dashboard/TechnicalSummary';
import { FundamentalCard } from '@/components/dashboard/FundamentalCard';
import { BandarFlowCard } from '@/components/dashboard/BandarFlowCard';
import { PatternBadges } from '@/components/dashboard/PatternBadges';
import { QuickGuide } from '@/components/dashboard/QuickGuide';
import { AnalysisSkeleton } from '@/components/dashboard/AnalysisSkeleton';
import type { AnalysisResult } from '@/types/stock';
import type { ChartDataPoint } from '@/components/dashboard/StockChart';

type ActionState = {
    success: boolean;
    data?: AnalysisResult;
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
            className={`
        px-6 py-2 rounded-lg font-semibold text-white
        transition-all duration-200
        ${pending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }
        disabled:opacity-50
        flex items-center gap-2
      `}
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                </>
            ) : (
                <>
                    <ChartCandlestick className="w-4 h-4" /> Analyze
                </>
            )}
        </button>
    );
}

/**
 * SingleAnalysisView component - displays single ticker analysis with educational guide
 */
export function SingleAnalysisView() {
    const [state, formAction] = useActionState<ActionState, FormData>(
        async (prevState: ActionState, formData: FormData) => {
            return await analyzeTicker(formData);
        },
        null
    );

    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [tickerInput, setTickerInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset input when form is submitted successfully
    useEffect(() => {
        if (state?.success) {
            setTimeout(() => {
                setIsSubmitting(false);
                setTickerInput('');
            }, 0);
        } else if (state?.error) {
            setTimeout(() => {
                setIsSubmitting(false);
            }, 0);
        }
    }, [state]);

    // Derive analyzing state
    const isAnalyzing = isSubmitting && !state?.success;

    // Fetch chart data when analysis succeeds
    useEffect(() => {
        if (!state?.success || !state.data?.symbol) {
            // Use setTimeout to defer state updates
            const timeoutId = setTimeout(() => {
                setChartData([]);
                setLoadingChart(false);
            }, 0);
            return () => clearTimeout(timeoutId);
        }

        let cancelled = false;

        // Async function to fetch chart data
        const fetchChart = async () => {
            try {
                // Set loading state in async callback
                if (!cancelled) {
                    setLoadingChart(true);
                }

                const result = await getChartData(state.data!.symbol);

                if (!cancelled) {
                    if (result.success && result.data) {
                        setChartData(result.data);
                    }
                    setLoadingChart(false);
                }
            } catch {
                // Silently fail - chart is optional
                if (!cancelled) {
                    setLoadingChart(false);
                }
            }
        };

        fetchChart();

        return () => {
            cancelled = true;
        };
    }, [state]);

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-8">
                <form
                    action={formAction}
                    className="w-full max-w-2xl mx-auto px-2 sm:px-0"
                    onSubmit={() => setIsSubmitting(true)}
                >
                    <div className="flex gap-2 sm:gap-3">
                        <input
                            type="text"
                            name="ticker"
                            value={tickerInput}
                            placeholder="BBCA"
                            required
                            onChange={(e) => {
                                const upperValue = e.target.value.toUpperCase();
                                setTickerInput(upperValue);
                            }}
                            className="
                                flex-1 px-4 py-2 rounded-lg border border-gray-300
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                dark:bg-gray-800 dark:border-gray-600 dark:text-white
                                text-lg uppercase
                            "
                        />
                        <SubmitButton />
                    </div>
                    {state?.error && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {state.error}
                        </div>
                    )}
                </form>
            </div>

            {/* Loading State - Show Skeleton when analyzing */}
            {isAnalyzing && !state?.success && (
                <AnalysisSkeleton />
            )}

            {/* Results - Grid Layout */}
            {state?.success && state.data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
                    {/* Left Column - Main Analysis (2 columns on desktop) */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1">
                        {/* Price Card */}
                        <PriceCard data={state.data} />

                        {/* Technical Summary */}
                        <TechnicalSummary data={state.data} />

                        {/* Candlestick Patterns */}
                        {state.data.candlePatterns && state.data.candlePatterns.length > 0 && (
                            <PatternBadges patterns={state.data.candlePatterns} />
                        )}
                        {state.data.candlePatterns && state.data.candlePatterns.length === 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                    Candlestick patterns not available
                                </div>
                            </div>
                        )}

                        {/* Fundamental Health Check */}
                        {state.data.fundamentalBadges && state.data.fundamentalBadges.length > 0 && (
                            <FundamentalCard badges={state.data.fundamentalBadges} />
                        )}
                        {state.data.fundamentalBadges && state.data.fundamentalBadges.length === 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                    Fundamental data not available
                                </div>
                            </div>
                        )}

                        {/* Stock Chart */}
                        {loadingChart ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                </div>
                            </div>
                        ) : chartData.length > 0 ? (
                            <StockChart data={chartData} predPrice={state.data.predPrice} />
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                    Chart data loading...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Quick Guide (1 column on desktop) */}
                    <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2">
                        {/* Bandar Flow Card */}
                        {state.data.bandarFlow && (
                            <BandarFlowCard data={state.data.bandarFlow} />
                        )}

                        {/* Quick Guide */}
                        <QuickGuide />
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!state && (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Enter a ticker symbol above to analyze a stock
                    </p>
                </div>
            )}
        </div>
    );
}
