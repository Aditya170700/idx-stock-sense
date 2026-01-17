'use client';

import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

/**
 * Chart data point interface
 */
export interface ChartDataPoint {
    timestamp: number; // Unix timestamp in milliseconds
    close: number;
    vwap: number;
    predPrice?: number; // Optional prediction price
}

interface StockChartProps {
    data: ChartDataPoint[];
    predPrice?: number; // Optional prediction price for display
}

/**
 * Format timestamp to DD MMM HH:mm format
 */
function formatDate(timestamp: number): string {
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
    return `Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * StockChart component displaying Close Price, VWAP, and Prediction Point
 */
export function StockChart({ data, predPrice }: StockChartProps) {
    // Prepare data for chart (ensure data is sorted by timestamp)
    const chartData = [...data]
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((item) => ({
            ...item,
            formattedDate: formatDate(item.timestamp),
        }));

    if (chartData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    No chart data available
                </div>
            </div>
        );
    }

    // Prepare prediction point data (if predPrice is provided)
    const latestTimestamp = chartData[chartData.length - 1]?.timestamp;
    const predictionPoint = predPrice && latestTimestamp ? [{
        timestamp: latestTimestamp,
        predPrice: predPrice,
        formattedDate: formatDate(latestTimestamp),
    }] : [];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Price Chart
            </h3>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => formatDate(value)}
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
                                return formatDate(label);
                            }
                            return String(label);
                        }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />
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
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                    {predictionPoint.length > 0 && (
                        <Scatter
                            data={predictionPoint}
                            dataKey="predPrice"
                            name="Prediction Point"
                            fill="#f97316"
                            shape={(props: unknown) => {
                                const p = props as { cx?: number; cy?: number };
                                const { cx = 0, cy = 0 } = p;
                                return (
                                    <g>
                                        <circle cx={cx} cy={cy} r={6} fill="#f97316" stroke="#fff" strokeWidth={2} />
                                        <circle cx={cx} cy={cy} r={8} fill="none" stroke="#f97316" strokeWidth={1} opacity={0.5} />
                                    </g>
                                );
                            }}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
