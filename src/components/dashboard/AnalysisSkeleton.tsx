'use client';

/**
 * Skeleton loader for analysis cards
 */
export function AnalysisSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Analysis */}
            <div className="lg:col-span-2 space-y-6">
                {/* Price Card Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        </div>

                        {/* Current Price */}
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>

                        {/* Predicted Price */}
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-12 w-64 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse" />
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Technical Summary Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                    <div className="space-y-4">
                        <div className="h-20 w-full bg-blue-100 dark:bg-blue-900/20 rounded-lg animate-pulse" />
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Chart Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                    <div className="h-96 w-full bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse" />
                </div>
            </div>

            {/* Right Column - Quick Guide */}
            <div className="lg:col-span-1">
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
