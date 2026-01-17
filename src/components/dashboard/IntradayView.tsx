'use client';

import { useActionState, useEffect, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, ChartCandlestick, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { analyzeIntradayTicker } from '@/app/actions/stock-actions';
import type { IntradayAnalysisResult } from '@/lib/services/intraday-analyzer';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    ReferenceArea,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { cn } from '@/lib/utils/cn';

type ActionState = {
    success: boolean;
    data?: IntradayAnalysisResult;
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
 * Get signal based on bias and conditions
 */
function getSignal(bias: IntradayAnalysisResult['bias'], currentPrice: number, orHigh: number, orLow: number): {
    text: string;
    color: string;
    bgColor: string;
} {
    if (bias === 'BULLISH' && currentPrice > orHigh) {
        return {
            text: 'BUY',
            color: 'text-green-700 dark:text-green-300',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
        };
    }
    if (bias === 'BEARISH' && currentPrice < orLow) {
        return {
            text: 'SELL',
            color: 'text-red-700 dark:text-red-300',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
        };
    }
    return {
        text: 'WAIT',
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    };
}

/**
 * Get bias badge info
 */
function getBiasBadge(bias: IntradayAnalysisResult['bias']): {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
} {
    switch (bias) {
        case 'BULLISH':
            return {
                label: 'Bias: Bullish',
                icon: <TrendingUp className="w-4 h-4" />,
                color: 'text-green-700 dark:text-green-300',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
            };
        case 'BEARISH':
            return {
                label: 'Bias: Bearish',
                icon: <TrendingDown className="w-4 h-4" />,
                color: 'text-red-700 dark:text-red-300',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
            };
        default:
            return {
                label: 'Bias: Sideways',
                icon: <Minus className="w-4 h-4" />,
                color: 'text-yellow-700 dark:text-yellow-300',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            };
    }
}

/**
 * Format timestamp to HH:mm format for intraday chart
 */
function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Format timestamp for tooltip (Date + Time)
 */
function formatTooltipDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${hours}:${minutes}`;
}

/**
 * Format price for tooltip
 */
function formatPrice(value: number): string {
    return `Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Filter data to show only current trading day
 */
function filterCurrentTradingDay(
    chartData: Array<{ timestamp: number; close: number }>,
    vwapData: Array<{ timestamp: number; vwap: number }>
): {
    chartData: Array<{ timestamp: number; close: number; vwap: number }>;
} {
    if (chartData.length === 0) {
        return { chartData: [] };
    }

    // Find the latest date
    const latestTimestamp = Math.max(...chartData.map((d) => d.timestamp));
    const latestDate = new Date(latestTimestamp);
    const latestDateKey = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}-${String(latestDate.getDate()).padStart(2, '0')}`;

    // Filter data for latest trading day
    const filtered = chartData
        .map((item) => {
            const date = new Date(item.timestamp);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            return dateKey === latestDateKey ? item : null;
        })
        .filter((item): item is { timestamp: number; close: number } => item !== null);

    // Combine with VWAP data
    const vwapMap = new Map(vwapData.map((v) => [v.timestamp, v.vwap]));
    const combined = filtered.map((item) => ({
        timestamp: item.timestamp,
        close: item.close,
        vwap: vwapMap.get(item.timestamp) ?? item.close,
    }));

    return { chartData: combined };
}

/**
 * IntradayView component - Pro-level dashboard with 2-column layout
 */
export function IntradayView() {
    const [state, formAction] = useActionState<ActionState, FormData>(
        async (prevState: ActionState, formData: FormData) => {
            return await analyzeIntradayTicker(formData);
        },
        null
    );

    const [tickerInput, setTickerInput] = useState('');

    // Reset input when form is submitted successfully
    useEffect(() => {
        if (state?.success) {
            const timeoutId = setTimeout(() => {
                setTickerInput('');
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [state?.success]);

    // Filter chart data to current trading day
    const currentDayChartData = useMemo(() => {
        if (!state?.success || !state.data) {
            return { chartData: [] };
        }
        return filterCurrentTradingDay(
            state.data.chartData.map((d) => ({ timestamp: d.timestamp, close: d.close })),
            state.data.vwapData
        );
    }, [state]);

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-8">
                <form action={formAction} className="w-full max-w-2xl mx-auto">
                    <div className="flex gap-3">
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

            {/* Results - 2 Column Grid Layout */}
            {state?.success && state.data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COLUMN 1: Left Side - The Strategy */}
                    <div className="space-y-6">
                        {/* Signal Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-4">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    SIGNAL INTRADAY
                                </div>

                                {(() => {
                                    const signal = getSignal(
                                        state.data.bias,
                                        state.data.entry,
                                        state.data.orHigh,
                                        state.data.orLow
                                    );
                                    return (
                                        <div className={cn(
                                            'text-5xl font-black tracking-tight',
                                            signal.color
                                        )}>
                                            {signal.text}
                                        </div>
                                    );
                                })()}

                                {/* Score */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
                                        <span className="text-xl font-black text-gray-900 dark:text-white">
                                            {state.data.score}/99
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className={cn(
                                                'h-3 rounded-full transition-all duration-300',
                                                state.data.score >= 70 ? 'bg-green-500' :
                                                    state.data.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            )}
                                            style={{ width: `${(state.data.score / 99) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Bias Badge */}
                                {(() => {
                                    const biasBadge = getBiasBadge(state.data.bias);
                                    return (
                                        <div className={cn(
                                            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold',
                                            biasBadge.color,
                                            biasBadge.bgColor
                                        )}>
                                            {biasBadge.icon}
                                            {biasBadge.label}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Trading Plan Grid */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Trading Plan
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Entry */}
                                <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                                        Entry Price
                                    </div>
                                    <div className="text-xl font-black text-blue-900 dark:text-blue-100">
                                        Rp {state.data.entry.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Current market price
                                    </div>
                                </div>

                                {/* SL */}
                                <div className="border-2 border-red-300 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                                    <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                                        Stop Loss (SL)
                                    </div>
                                    <div className="text-xl font-black text-red-900 dark:text-red-100">
                                        Rp {state.data.sl.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Cut loss here to protect capital
                                    </div>
                                </div>

                                {/* TP1 */}
                                <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                        Target 1 (TP1)
                                    </div>
                                    <div className="text-xl font-black text-green-900 dark:text-green-100">
                                        Rp {state.data.tp1.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        First profit target
                                    </div>
                                </div>

                                {/* TP2 */}
                                <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                        Target 2 (TP2)
                                    </div>
                                    <div className="text-xl font-black text-green-900 dark:text-green-100">
                                        Rp {state.data.tp2.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Extended profit target
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Box */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Key Levels
                            </h3>
                            <div className="space-y-3">
                                {/* VWAP */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">VWAP</span>
                                    <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                                        Rp {state.data.currentVWAP.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                </div>

                                {/* Opening Range */}
                                <div className="space-y-1">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Opening Range (09:00-09:15)
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                            Rp {state.data.orHigh.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Low</span>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                            Rp {state.data.orLow.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 2: Right Side - The Visuals */}
                    <div className="space-y-6">
                        {/* Chart */}
                        {currentDayChartData.chartData.length > 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Intraday Movement (5m) vs VWAP
                                </h3>
                                <ResponsiveContainer width="100%" height={500}>
                                    <ComposedChart
                                        data={currentDayChartData.chartData.sort((a, b) => a.timestamp - b.timestamp)}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(value) => formatTime(value)}
                                            className="text-xs fill-gray-600 dark:fill-gray-400"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => value.toLocaleString('id-ID')}
                                            className="text-xs fill-gray-600 dark:fill-gray-400"
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                            }}
                                            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                                            formatter={(value: number | undefined) => {
                                                if (value === undefined) return 'N/A';
                                                return formatPrice(value);
                                            }}
                                            labelFormatter={(label) => {
                                                if (typeof label === 'number') {
                                                    return formatTooltipDate(label);
                                                }
                                                return String(label);
                                            }}
                                        />
                                        <Legend
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            iconType="line"
                                        />
                                        {/* Opening Range Background Band */}
                                        {state.data && (
                                            <ReferenceArea
                                                y1={state.data.orLow}
                                                y2={state.data.orHigh}
                                                fill="#fef3c7"
                                                fillOpacity={0.2}
                                                stroke="#f59e0b"
                                                strokeDasharray="3 3"
                                                label={{ value: 'Opening Range', position: 'insideTopRight' }}
                                            />
                                        )}
                                        <Line
                                            type="monotone"
                                            dataKey="close"
                                            name="Close Price"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="vwap"
                                            name="VWAP"
                                            stroke="#f97316"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
                                    Chart data loading...
                                </div>
                            </div>
                        )}

                        {/* Educational Footer */}
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                        Quick Guide
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                                        <strong>VWAP</strong> is the &apos;average&apos; price paid by big players. If price is above VWAP line, buyers are in control.
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        <strong>Opening Range</strong> (first 15 minutes) often acts as support/resistance. Breakouts above/below this range can signal strong moves.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reasoning Box */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Analysis Reasoning
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {state.data.reasonText}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!state && (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Enter a ticker symbol above to analyze intraday trading
                    </p>
                </div>
            )}
        </div>
    );
}
