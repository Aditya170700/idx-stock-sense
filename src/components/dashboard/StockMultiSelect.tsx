'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ALL_IDX_TICKERS, filterTickers, type TickerOption } from '@/lib/constants/idx-tickers';
import { cn } from '@/lib/utils/cn';

interface StockMultiSelectProps {
    selectedTickers: string[];
    onSelectionChange: (tickers: string[]) => void;
    maxSelections?: number;
}

/**
 * StockMultiSelect component for selecting multiple stock tickers
 */
export function StockMultiSelect({
    selectedTickers,
    onSelectionChange,
    maxSelections,
}: StockMultiSelectProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Filter tickers based on search term
    const filteredTickers = useMemo(() => {
        return filterTickers(searchTerm);
    }, [searchTerm]);

    // Get selected ticker options for display
    const selectedOptions = useMemo(() => {
        return selectedTickers
            .map((code) => ALL_IDX_TICKERS.find((t) => t.value === code))
            .filter((t): t is TickerOption => t !== undefined);
    }, [selectedTickers]);

    const handleToggleTicker = (tickerCode: string) => {
        if (selectedTickers.includes(tickerCode)) {
            // Remove ticker
            onSelectionChange(selectedTickers.filter((t) => t !== tickerCode));
        } else {
            // Add ticker (check max selections)
            if (maxSelections && selectedTickers.length >= maxSelections) {
                return;
            }
            onSelectionChange([...selectedTickers, tickerCode]);
        }
    };

    const handleRemoveTicker = (tickerCode: string) => {
        onSelectionChange(selectedTickers.filter((t) => t !== tickerCode));
    };

    return (
        <div className="relative w-full">
            {/* Selected Tickers Display */}
            {selectedOptions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {selectedOptions.map((option) => (
                        <span
                            key={option.value}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                            {option.value}
                            <button
                                type="button"
                                onClick={() => handleRemoveTicker(option.value)}
                                className="hover:text-blue-600 dark:hover:text-blue-300"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search by code or company name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredTickers.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                No tickers found
                            </div>
                        ) : (
                            filteredTickers.slice(0, 100).map((ticker) => {
                                const isSelected = selectedTickers.includes(ticker.value);
                                const isDisabled = Boolean(
                                    maxSelections &&
                                    !isSelected &&
                                    selectedTickers.length >= maxSelections
                                );

                                return (
                                    <button
                                        key={ticker.value}
                                        type="button"
                                        onClick={() => {
                                            handleToggleTicker(ticker.value);
                                            setSearchTerm('');
                                        }}
                                        disabled={isDisabled}
                                        className={cn(
                                            'w-full text-left px-4 py-2 text-sm transition-colors',
                                            isSelected
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
                                            isDisabled && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{ticker.value}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {ticker.label.split(' - ')[1]}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* Max selections hint */}
            {maxSelections && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {selectedTickers.length} / {maxSelections} selected
                </p>
            )}
        </div>
    );
}
