'use client';

import { useState } from 'react';
import { Search, Zap, LayoutGrid, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type TabType = 'single' | 'intraday' | 'prediction' | 'compare';

interface DashboardTabsProps {
    singleAnalysisView: React.ReactNode;
    intradayView: React.ReactNode;
    predictionAllView: React.ReactNode;
    comparisonView: React.ReactNode;
}

/**
 * DashboardTabs component with segmented control style (Pill Shape)
 */
export function DashboardTabs({ singleAnalysisView, intradayView, predictionAllView, comparisonView }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('single');

    return (
        <div className="w-full">
            {/* Segmented Control Container - Horizontal Scroll on Mobile */}
            <div className="mb-6 sm:mb-8">
                <div className="inline-flex bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-full overflow-x-auto scrollbar-hide w-full sm:w-auto">
                    <div className="flex flex-nowrap gap-1">
                        <button
                            onClick={() => setActiveTab('single')}
                            className={cn(
                                'flex items-center gap-2 px-4 sm:px-6 py-2.5 font-semibold text-xs sm:text-sm whitespace-nowrap',
                                'transition-all duration-200 rounded-full',
                                activeTab === 'single'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            )}
                        >
                            <Search className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Single (Daily)</span>
                            <span className="sm:hidden">Single</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('intraday')}
                            className={cn(
                                'flex items-center gap-2 px-4 sm:px-6 py-2.5 font-semibold text-xs sm:text-sm whitespace-nowrap',
                                'transition-all duration-200 rounded-full',
                                activeTab === 'intraday'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            )}
                        >
                            <Zap className="w-4 h-4 shrink-0" />
                            Intraday
                        </button>
                        <button
                            onClick={() => setActiveTab('prediction')}
                            className={cn(
                                'flex items-center gap-2 px-4 sm:px-6 py-2.5 font-semibold text-xs sm:text-sm whitespace-nowrap',
                                'transition-all duration-200 rounded-full',
                                activeTab === 'prediction'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            )}
                        >
                            <LayoutGrid className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Prediction All</span>
                            <span className="sm:hidden">Prediction</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('compare')}
                            className={cn(
                                'flex items-center gap-2 px-4 sm:px-6 py-2.5 font-semibold text-xs sm:text-sm whitespace-nowrap',
                                'transition-all duration-200 rounded-full',
                                activeTab === 'compare'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            )}
                        >
                            <GitCompare className="w-4 h-4 shrink-0" />
                            Compare
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'single' && singleAnalysisView}
                {activeTab === 'intraday' && intradayView}
                {activeTab === 'prediction' && predictionAllView}
                {activeTab === 'compare' && comparisonView}
            </div>
        </div>
    );
}
