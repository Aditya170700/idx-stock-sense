'use client';

import { Layers, LogOut, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import type { BandarFlowData } from '@/types/stock';
import { cn } from '@/lib/utils/cn';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

interface BandarFlowCardProps {
    data: BandarFlowData;
}

/**
 * Get status display info
 */
function getStatusInfo(status: BandarFlowData['status']): {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
} {
    switch (status) {
        case 'AKUMULASI':
            return {
                label: 'AKUMULASI TERDETEKSI',
                icon: <Layers className="w-5 h-5" />,
                color: 'text-green-700 dark:text-green-300',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                description: 'Harga relatif stabil/turun, namun volume akumulasi meningkat. Big players sedang membeli secara bertahap.',
            };
        case 'DISTRIBUSI':
            return {
                label: 'DISTRIBUSI TERDETEKSI',
                icon: <LogOut className="w-5 h-5" />,
                color: 'text-red-700 dark:text-red-300',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                description: 'Harga relatif stabil/naik, namun volume distribusi meningkat. Big players sedang menjual secara bertahap.',
            };
        case 'MARKUP':
            return {
                label: 'MARKUP (UPTREND)',
                icon: <TrendingUp className="w-5 h-5" />,
                color: 'text-blue-700 dark:text-blue-300',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                description: 'Harga naik disertai volume akumulasi. Tren naik yang sehat dengan dukungan volume.',
            };
        case 'MARKDOWN':
            return {
                label: 'MARKDOWN (DOWNTREND)',
                icon: <TrendingDown className="w-5 h-5" />,
                color: 'text-orange-700 dark:text-orange-300',
                bgColor: 'bg-orange-100 dark:bg-orange-900/30',
                description: 'Harga turun disertai volume distribusi. Tren turun dengan tekanan jual yang kuat.',
            };
        default:
            return {
                label: 'NEUTRAL',
                icon: <Activity className="w-5 h-5" />,
                color: 'text-gray-700 dark:text-gray-300',
                bgColor: 'bg-gray-100 dark:bg-gray-800',
                description: 'Tidak ada sinyal akumulasi atau distribusi yang jelas. Perlu observasi lebih lanjut.',
            };
    }
}

/**
 * Format timestamp for chart
 */
function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('id-ID', { month: 'short' });
    return `${day} ${month}`;
}

/**
 * BandarFlowCard component displaying volume flow analysis
 */
export function BandarFlowCard({ data }: BandarFlowCardProps) {
    const statusInfo = getStatusInfo(data.status);

    // Combine price and OBV data for chart
    const chartData = data.priceData.map((priceItem, idx) => ({
        timestamp: priceItem.timestamp,
        price: priceItem.value,
        obv: data.obvData[idx]?.value ?? 0,
    }));

    // Normalize price for chart (0-100 scale for comparison)
    const priceMin = Math.min(...data.priceData.map((d) => d.value));
    const priceMax = Math.max(...data.priceData.map((d) => d.value));
    const priceRange = priceMax - priceMin;
    const normalizedChartData = chartData.map((item) => ({
        ...item,
        priceNormalized: priceRange > 0 ? ((item.price - priceMin) / priceRange) * 100 : 50,
    }));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Analisis Aliran Dana (Bandarmology)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Deteksi akumulasi atau distribusi oleh big players berdasarkan volume transaksi aktif.
            </p>

            {/* Status Display */}
            <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg mb-4',
                statusInfo.bgColor
            )}>
                <div className={cn(statusInfo.color)}>
                    {statusInfo.icon}
                </div>
                <div className="flex-1">
                    <div className={cn('font-bold text-sm', statusInfo.color)}>
                        {statusInfo.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {statusInfo.description}
                    </div>
                </div>
            </div>

            {/* Mini Sparkline Chart */}
            {normalizedChartData.length > 0 && (
                <div className="mt-4">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Perbandingan Harga vs Volume Akumulasi (20 hari terakhir)
                    </div>
                    <ResponsiveContainer width="100%" height={200} className="sm:h-[180px] lg:h-[150px]">
                        <ComposedChart
                            data={normalizedChartData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={formatTimestamp}
                                className="text-xs fill-gray-500 dark:fill-gray-400"
                                angle={-45}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis
                                domain={[0, 100]}
                                className="text-xs fill-gray-500 dark:fill-gray-400"
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                }}
                                labelStyle={{ color: '#374151', fontWeight: 'bold', fontSize: '12px' }}
                                formatter={(value: number | undefined, name: string | undefined) => {
                                    if (value === undefined) return ['N/A', name ?? 'Unknown'];
                                    if (name === 'priceNormalized') {
                                        return [`${value.toFixed(1)}%`, 'Harga (Normalized)'];
                                    }
                                    return [`${value.toFixed(1)}%`, 'OBV (Normalized)'];
                                }}
                                labelFormatter={(label) => {
                                    if (typeof label === 'number') {
                                        return formatTimestamp(label);
                                    }
                                    return String(label);
                                }}
                            />
                            {/* Price Line */}
                            <Line
                                type="monotone"
                                dataKey="priceNormalized"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                name="Harga"
                            />
                            {/* OBV Area */}
                            <Area
                                type="monotone"
                                dataKey="obv"
                                fill="#10b981"
                                fillOpacity={0.3}
                                stroke="#10b981"
                                strokeWidth={1.5}
                                name="OBV"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            <span>Harga</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500/30 border border-green-500"></div>
                            <span>OBV</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Explanation Note */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                    <strong>Catatan:</strong> Analisis berdasarkan volume transaksi aktif. Divergence antara harga dan OBV dapat mengindikasikan aktivitas big players yang tidak terlihat dari pergerakan harga saja.
                </p>
            </div>
        </div>
    );
}
