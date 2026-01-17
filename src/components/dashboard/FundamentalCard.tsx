'use client';

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Building, TrendingUp, TrendingDown, Tag, DollarSign, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import type { FundamentalBadge } from '@/types/stock';
import { cn } from '@/lib/utils/cn';

interface FundamentalCardProps {
    badges: FundamentalBadge[];
}

/**
 * Icon mapping for fundamental badges
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    ShieldCheck,
    AlertTriangle,
    Building,
    TrendingUp,
    TrendingDown,
    Tag,
    DollarSign,
    Gift,
};

/**
 * FundamentalCard component displaying fundamental health check badges with detailed reasons
 */
export function FundamentalCard({ badges }: FundamentalCardProps) {
    const [expandedBadge, setExpandedBadge] = useState<number | null>(null);

    if (!badges || badges.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fundamental Health Check
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Indikator kesehatan fundamental untuk membantu menghindari saham berisiko tinggi.
            </p>
            <div className="space-y-3">
                {badges.map((badge, index) => {
                    const IconComponent = iconMap[badge.iconName];
                    const isExpanded = expandedBadge === index;

                    return (
                        <div
                            key={index}
                            className={cn(
                                'rounded-lg border transition-all',
                                badge.bgColor,
                                'border-gray-200 dark:border-gray-700'
                            )}
                        >
                            {/* Badge Header - Clickable */}
                            <button
                                onClick={() => setExpandedBadge(isExpanded ? null : index)}
                                className={cn(
                                    'w-full flex items-center justify-between px-4 py-3 rounded-lg',
                                    'hover:bg-opacity-80 transition-all',
                                    'text-left'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {IconComponent && (
                                        <div className={cn('p-1.5 rounded', badge.bgColor)}>
                                            <IconComponent className={cn('w-4 h-4', badge.color)} />
                                        </div>
                                    )}
                                    <div>
                                        <div className={cn('font-semibold text-sm', badge.color)}>
                                            {badge.label}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                            {badge.description}
                                        </div>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                )}
                            </button>

                            {/* Expanded Reason */}
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        <strong className="text-gray-900 dark:text-white">Alasan:</strong>{' '}
                                        {badge.reason}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
