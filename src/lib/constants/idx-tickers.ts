import tickersData from '@/lib/data/tickers.json';
import type { TickerData } from '@/types/stock';

/**
 * Select option interface for ticker selection
 */
export interface TickerOption {
    value: string; // Stock code (e.g., "AALI")
    label: string; // Display format: "AALI - Astra Agro Lestari Tbk."
}

/**
 * All IDX tickers mapped from JSON data
 * Value is the stock code, Label includes code and company name
 */
export const ALL_IDX_TICKERS: TickerOption[] = (tickersData as TickerData[]).map((ticker) => ({
    value: ticker.Code,
    label: `${ticker.Code} - ${ticker['Company Name']}`,
}));

/**
 * Get ticker options filtered by search term
 * Searches both Code and Company Name
 */
export function filterTickers(searchTerm: string): TickerOption[] {
    if (!searchTerm.trim()) {
        return ALL_IDX_TICKERS;
    }

    const lowerSearch = searchTerm.toLowerCase();
    return ALL_IDX_TICKERS.filter(
        (ticker) =>
            ticker.value.toLowerCase().includes(lowerSearch) ||
            ticker.label.toLowerCase().includes(lowerSearch)
    );
}

/**
 * Get ticker option by code
 */
export function getTickerByCode(code: string): TickerOption | undefined {
    return ALL_IDX_TICKERS.find((ticker) => ticker.value === code);
}
