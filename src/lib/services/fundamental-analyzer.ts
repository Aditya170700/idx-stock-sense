import type { FundamentalData } from './market-data';
import type { FundamentalBadge } from '@/types/stock';

/**
 * Analyzes fundamental data and returns badges with health indicators
 * @param data - FundamentalData object
 * @returns Array of FundamentalBadge objects
 */
export function analyzeFundamentals(data: FundamentalData): FundamentalBadge[] {
    const badges: FundamentalBadge[] = [];

    const { marketCap, trailingPE, priceToBook, trailingEps, dividendYield } = data;

    // SIZE (Market Cap) Analysis
    if (marketCap !== undefined) {
        const marketCapTrillion = marketCap / 1_000_000_000_000; // Convert to trillions
        const marketCapFormatted = marketCapTrillion.toFixed(2);

        if (marketCapTrillion > 10) {
            badges.push({
                label: 'Big Cap (Blue Chip)',
                color: 'text-blue-700 dark:text-blue-300',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                iconName: 'ShieldCheck',
                description: 'Perusahaan raksasa, relatif aman dari manipulasi.',
                reason: `Kapitalisasi pasar sebesar Rp ${marketCapFormatted} Triliun. Perusahaan dengan kapitalisasi di atas Rp 10 Triliun disebut "Blue Chip" karena ukurannya yang besar membuat harga saham lebih stabil dan sulit dimanipulasi oleh pihak tertentu. Cocok untuk investor yang mencari stabilitas.`,
            });
        } else if (marketCapTrillion < 1) {
            badges.push({
                label: 'Micro Cap (High Risk)',
                color: 'text-red-700 dark:text-red-300',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                iconName: 'AlertTriangle',
                description: 'Kapitalisasi kecil, rawan volatilitas tinggi/gorengan.',
                reason: `Kapitalisasi pasar sebesar Rp ${marketCapFormatted} Triliun. Perusahaan dengan kapitalisasi di bawah Rp 1 Triliun memiliki risiko tinggi karena harga saham mudah berfluktuasi drastis dan rentan terhadap manipulasi (gorengan). Hati-hati jika tidak memahami risikonya.`,
            });
        } else {
            badges.push({
                label: 'Mid Cap (Second Liner)',
                color: 'text-gray-700 dark:text-gray-300',
                bgColor: 'bg-gray-100 dark:bg-gray-800',
                iconName: 'Building',
                description: 'Perusahaan menengah, potensi pertumbuhan dengan risiko sedang.',
                reason: `Kapitalisasi pasar sebesar Rp ${marketCapFormatted} Triliun. Perusahaan menengah dengan kapitalisasi antara Rp 1-10 Triliun memiliki potensi pertumbuhan yang baik namun dengan risiko yang lebih tinggi dibanding Blue Chip. Cocok untuk investor yang mencari keseimbangan antara risiko dan return.`,
            });
        }
    }

    // PROFITABILITY (EPS) Analysis
    if (trailingEps !== undefined) {
        const epsFormatted = trailingEps.toFixed(2);

        if (trailingEps > 0) {
            badges.push({
                label: 'Perusahaan Untung',
                color: 'text-green-700 dark:text-green-300',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                iconName: 'TrendingUp',
                description: 'Perusahaan menghasilkan laba, indikator kesehatan positif.',
                reason: `EPS (Earning Per Share) sebesar Rp ${epsFormatted}. EPS positif berarti perusahaan menghasilkan laba bersih. Setiap lembar saham menghasilkan laba sebesar Rp ${epsFormatted}. Ini adalah indikator kesehatan finansial yang baik karena menunjukkan perusahaan mampu menghasilkan profit untuk pemegang saham.`,
            });
        } else if (trailingEps < 0) {
            badges.push({
                label: 'Perusahaan Rugi',
                color: 'text-red-700 dark:text-red-300',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                iconName: 'TrendingDown',
                description: 'Waspada, perusahaan sedang merugi.',
                reason: `EPS (Earning Per Share) negatif sebesar Rp ${epsFormatted}. EPS negatif berarti perusahaan mengalami kerugian bersih. Setiap lembar saham mengalami kerugian sebesar Rp ${Math.abs(trailingEps).toFixed(2)}. Ini adalah tanda peringatan karena perusahaan tidak menghasilkan profit. Perlu investigasi lebih lanjut sebelum berinvestasi.`,
            });
        }
    }

    // VALUATION (PER & PBV) Analysis
    if (trailingPE !== undefined || priceToBook !== undefined) {
        const pe = trailingPE ?? Infinity;
        const pbv = priceToBook ?? Infinity;
        const peFormatted = pe !== Infinity ? pe.toFixed(2) : 'N/A';
        const pbvFormatted = pbv !== Infinity ? pbv.toFixed(2) : 'N/A';

        if (pe < 15 || pbv < 1) {
            const reasons: string[] = [];
            if (pe < 15 && pe !== Infinity) {
                reasons.push(`PER (Price to Earnings Ratio) sebesar ${peFormatted} yang tergolong rendah (di bawah 15)`);
            }
            if (pbv < 1 && pbv !== Infinity) {
                reasons.push(`PBV (Price to Book Value) sebesar ${pbvFormatted} yang berarti harga saham lebih murah dari nilai buku perusahaan`);
            }

            badges.push({
                label: 'Valuasi Murah',
                color: 'text-emerald-700 dark:text-emerald-300',
                bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
                iconName: 'Tag',
                description: 'Harga saham tergolong murah (Undervalued).',
                reason: `${reasons.join(' dan ')}. Ini menunjukkan harga saham mungkin lebih murah dari nilai intrinsiknya. Bisa jadi peluang bagus untuk membeli, namun tetap perlu analisis lebih lanjut tentang prospek perusahaan.`,
            });
        } else if (pe > 25 && pe !== Infinity) {
            badges.push({
                label: 'Valuasi Mahal',
                color: 'text-orange-700 dark:text-orange-300',
                bgColor: 'bg-orange-100 dark:bg-orange-900/30',
                iconName: 'DollarSign',
                description: 'Harga saham tergolong mahal (Overvalued), hati-hati dengan bubble.',
                reason: `PER (Price to Earnings Ratio) sebesar ${peFormatted} yang tergolong tinggi (di atas 25). Ini berarti investor membayar Rp ${peFormatted} untuk setiap Rp 1 laba perusahaan. Harga saham mungkin sudah terlalu mahal dibanding kemampuan perusahaan menghasilkan laba. Hati-hati dengan risiko koreksi harga atau bubble.`,
            });
        }
    }

    // DIVIDEND Analysis
    if (dividendYield !== undefined && dividendYield > 0.02) {
        const dividendYieldPercent = (dividendYield * 100).toFixed(2);
        badges.push({
            label: 'Rajin Dividen',
            color: 'text-purple-700 dark:text-purple-300',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            iconName: 'Gift',
            description: 'Cocok untuk investor jangka panjang.',
            reason: `Dividend Yield sebesar ${dividendYieldPercent}% per tahun. Ini berarti jika Anda membeli saham ini, Anda akan mendapat dividen sekitar ${dividendYieldPercent}% dari nilai investasi setiap tahunnya. Perusahaan yang rajin membagikan dividen biasanya memiliki arus kas yang sehat dan fokus pada kepentingan pemegang saham jangka panjang. Cocok untuk investor yang mencari passive income.`,
        });
    }

    return badges;
}
