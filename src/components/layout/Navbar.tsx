'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getRealTimeMarketStatus, type MarketStatus } from '@/app/actions/market-status';

// Cache duration: 2 minutes (120000 ms)
const CACHE_DURATION = 2 * 60 * 1000;

/**
 * Premium Navbar component with glassmorphism effect
 */
export function Navbar() {
    const [marketStatus, setMarketStatus] = useState<MarketStatus>('CLOSED');
    const [statusMessage, setStatusMessage] = useState('Market Closed');
    const [isLoading, setIsLoading] = useState(true);
    const [lastFetch, setLastFetch] = useState<number>(0);

    useEffect(() => {
        const fetchMarketStatus = async () => {
            const now = Date.now();

            // Check cache - only fetch if cache expired
            if (now - lastFetch < CACHE_DURATION && lastFetch > 0) {
                return;
            }

            try {
                setIsLoading(true);
                const result = await getRealTimeMarketStatus();
                setMarketStatus(result.status);
                setStatusMessage(result.message);
                setLastFetch(now);
            } catch (error) {
                // Keep previous status on error
                console.error('Failed to fetch market status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch immediately on mount
        fetchMarketStatus();

        // Set up interval to refresh every 2 minutes
        const interval = setInterval(fetchMarketStatus, CACHE_DURATION);

        return () => clearInterval(interval);
    }, [lastFetch]);

    // Get status color and animation
    const getStatusStyles = (status: MarketStatus) => {
        switch (status) {
            case 'OPEN':
                return {
                    dotColor: 'bg-green-500',
                    animate: 'animate-pulse',
                    textColor: 'text-green-700 dark:text-green-400',
                };
            case 'BREAK':
                return {
                    dotColor: 'bg-yellow-500',
                    animate: '',
                    textColor: 'text-yellow-700 dark:text-yellow-400',
                };
            case 'CLOSED':
                return {
                    dotColor: 'bg-red-500',
                    animate: '',
                    textColor: 'text-red-700 dark:text-red-400',
                };
        }
    };

    const statusStyles = getStatusStyles(marketStatus);

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50',
                'bg-white/80 dark:bg-gray-900/80',
                'backdrop-blur-md',
                'border-b border-gray-200 dark:border-gray-700',
                'shadow-sm'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Side - Brand */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            IDX Stock Sense
                        </h1>
                        <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            Beta
                        </span>
                    </div>

                    {/* Right Side - Status & Links */}
                    <div className="flex items-center gap-6">
                        {/* Market Status */}
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'w-2 h-2 rounded-full',
                                    statusStyles.dotColor,
                                    statusStyles.animate
                                )}
                            />
                            <span className={cn(
                                'text-sm font-medium mt-1',
                                isLoading ? 'text-gray-400 dark:text-gray-500' : statusStyles.textColor
                            )}>
                                {isLoading ? 'Loading...' : statusMessage}
                            </span>
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Documentation"
                            >
                                <BookOpen className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
