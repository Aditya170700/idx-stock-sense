'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    AlertTriangle,
    BookOpen,
    TrendingUp,
    BarChart3,
    Users,
    CandlestickChart,
    Zap,
    LayoutGrid,
    FileText,
    ArrowLeft,
    Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Manual/Documentation page component
 */
export default function ManualPage() {
    const [activeSection, setActiveSection] = useState<string>('disclaimer');

    // Handle scroll to update active section
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['disclaimer', 'quick-start', 'single-analysis', 'intraday', 'prediction', 'glossary'];
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80; // Account for navbar height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back to Dashboard Button */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Table of Contents */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Daftar Isi
                                </h2>
                                <nav className="space-y-2">
                                    {[
                                        { id: 'disclaimer', label: '⚠️ Disclaimer Penting', icon: AlertTriangle },
                                        { id: 'quick-start', label: '🚀 Quick Start', icon: BookOpen },
                                        { id: 'single-analysis', label: '📊 Single Analysis', icon: BarChart3 },
                                        { id: 'intraday', label: '⚡ Intraday Analysis', icon: Zap },
                                        { id: 'prediction', label: '🔮 Prediction Scanner', icon: LayoutGrid },
                                        { id: 'glossary', label: '📖 Kamus Istilah', icon: FileText },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToSection(item.id)}
                                            className={cn(
                                                'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                                'hover:bg-gray-100 dark:hover:bg-gray-700',
                                                activeSection === item.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                                                    : 'text-gray-700 dark:text-gray-300'
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </aside>

                    {/* Right Content - Main Documentation */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 lg:p-12 border border-gray-200 dark:border-gray-700 prose prose-gray dark:prose-invert max-w-none">
                            {/* Title */}
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Manual Book - IDX Stock Sense
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                                Panduan lengkap untuk menggunakan aplikasi analisis saham IDX Stock Sense
                            </p>

                            {/* SECTION 1: DISCLAIMER */}
                            <section id="disclaimer" className="mb-12 scroll-mt-24">
                                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">
                                                ⚠️ DISCLAIMER PENTING
                                            </h2>
                                            <p className="text-base text-red-800 dark:text-red-200 leading-relaxed font-medium">
                                                Aplikasi ini adalah <strong>alat bantu analisis</strong>, BUKAN penasihat keuangan.
                                                Segala keputusan investasi (Beli/Jual) adalah <strong>tanggung jawab penuh pengguna</strong>.
                                                Data mungkin mengalami keterlambatan (delayed) dan tidak dijamin 100% akurat.
                                                <strong> Do Your Own Research (DYOR)</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 2: QUICK START */}
                            <section id="quick-start" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Quick Start
                                    </h2>
                                </div>

                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <p className="text-base leading-relaxed">
                                        Selamat datang di <strong>IDX Stock Sense</strong>! Aplikasi ini membantu Anda menganalisis saham
                                        di Bursa Efek Indonesia (IDX) dengan pendekatan yang mudah dipahami untuk pemula.
                                    </p>

                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                                        Cara Menggunakan Dashboard
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-2 ml-4">
                                        <li>
                                            <strong>Pilih Tab:</strong> Gunakan tab di bagian atas untuk beralih antara
                                            &quot;Single (Daily)&quot;, &quot;Intraday&quot;, &quot;Prediction All&quot;, atau &quot;Compare&quot;.
                                        </li>
                                        <li>
                                            <strong>Masukkan Kode Saham:</strong> Ketik kode saham (contoh: BBCA, BMRI)
                                            di search bar dan klik &quot;Analyze&quot;.
                                        </li>
                                        <li>
                                            <strong>Baca Hasil Analisis:</strong> Lihat kartu-kartu yang menampilkan
                                            prediksi harga, indikator teknikal, fundamental, dan pola candlestick.
                                        </li>
                                    </ol>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg mt-6">
                                        <div className="flex items-start gap-2">
                                            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                    💡 Tip Pemula
                                                </p>
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    Mulai dengan saham Blue Chip (kapitalisasi besar) seperti BBCA, BMRI, atau BBRI
                                                    untuk memahami cara kerja aplikasi sebelum mencoba saham dengan risiko lebih tinggi.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 3: SINGLE ANALYSIS */}
                            <section id="single-analysis" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Single Analysis (Swing Trading)
                                    </h2>
                                </div>

                                <div className="space-y-6 text-gray-700 dark:text-gray-300">
                                    <p className="text-base leading-relaxed">
                                        Analisis Single digunakan untuk trading jangka menengah (swing trading).
                                        Aplikasi ini menggunakan <strong>4 Pilar Analisis</strong> untuk memberikan gambaran lengkap tentang kondisi saham:
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        {/* Pillar 1: Technical */}
                                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    1. Technical Analysis
                                                </h3>
                                            </div>
                                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                                <li>
                                                    <strong>RSI (Relative Strength Index):</strong> Indikator momentum yang menunjukkan
                                                    apakah saham <strong>murah</strong> (RSI &lt; 30) atau <strong>mahal</strong> (RSI &gt; 70).
                                                    RSI 30-70 berarti harga wajar.
                                                </li>
                                                <li>
                                                    <strong>MACD:</strong> Indikator trend yang menunjukkan arah pergerakan harga.
                                                    MACD positif = tren naik, MACD negatif = tren turun.
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Pillar 2: Fundamental */}
                                        <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    2. Fundamental Analysis
                                                </h3>
                                            </div>
                                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                                <li>
                                                    <strong>Health Check Badges:</strong> Menampilkan status kesehatan perusahaan:
                                                    <ul className="list-disc list-inside ml-4 mt-1">
                                                        <li><strong>Untung/Rugi:</strong> Berdasarkan EPS (Earning Per Share)</li>
                                                        <li><strong>Big Cap/Micro Cap:</strong> Berdasarkan kapitalisasi pasar</li>
                                                        <li><strong>Valuasi:</strong> Berdasarkan PER dan PBV</li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Pillar 3: Bandarmology */}
                                        <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    3. Bandarmology (Smart Money Flow)
                                                </h3>
                                            </div>
                                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                                <li>
                                                    <strong>Akumulasi:</strong> Big players sedang membeli secara bertahap
                                                    (harga flat/turun tapi volume naik). Sinyal positif untuk jangka panjang.
                                                </li>
                                                <li>
                                                    <strong>Distribusi:</strong> Big players sedang menjual secara bertahap
                                                    (harga flat/naik tapi volume turun). Hati-hati, bisa jadi koreksi akan terjadi.
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Pillar 4: Price Action */}
                                        <div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-5 border border-orange-200 dark:border-orange-800">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CandlestickChart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    4. Price Action (Candlestick Patterns)
                                                </h3>
                                            </div>
                                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                                <li>
                                                    <strong>Hammer:</strong> Pola palu - sinyal rebound dari level support.
                                                </li>
                                                <li>
                                                    <strong>Bullish/Bearish Engulfing:</strong> Pola &quot;melahap&quot; - sinyal pembalikan trend yang kuat.
                                                </li>
                                                <li>
                                                    <strong>Doji:</strong> Pasar galau/netral - menunggu konfirmasi.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-6">
                                        <div className="flex items-start gap-2">
                                            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                                    💡 Tip: Kombinasi 4 Pilar
                                                </p>
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                    Sinyal terkuat muncul ketika semua 4 pilar menunjukkan arah yang sama.
                                                    Misalnya: RSI murah + Fundamental sehat + Akumulasi + Hammer = Potensi naik kuat.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 4: INTRADAY ANALYSIS */}
                            <section id="intraday" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Intraday Analysis (Day Trading)
                                    </h2>
                                </div>

                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <p className="text-base leading-relaxed">
                                        Analisis Intraday digunakan untuk trading harian (day trading).
                                        Cocok untuk trader yang ingin mengambil keuntungan dari pergerakan harga dalam satu hari.
                                    </p>

                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                                        Konsep Penting Intraday
                                    </h3>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800 mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            VWAP (Volume Weighted Average Price)
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            VWAP adalah garis rata-rata harga yang dihitung berdasarkan volume transaksi.
                                            <strong> Jika harga berada di atas VWAP</strong>, berarti buyer (pembeli) sedang menguasai pasar = <strong>Bullish</strong>.
                                            <strong> Jika harga berada di bawah VWAP</strong>, berarti seller (penjual) sedang menguasai = <strong>Bearish</strong>.
                                        </p>
                                    </div>

                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5 border border-orange-200 dark:border-orange-800 mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Opening Range (OR)
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            Opening Range adalah rentang harga <strong>15 menit pertama</strong> setelah pasar dibuka (09:00-09:15).
                                            Level High dan Low dari Opening Range sering menjadi <strong>support dan resistance</strong> yang kuat sepanjang hari.
                                            Breakout di atas OR High atau breakdown di bawah OR Low bisa menjadi sinyal pergerakan besar.
                                        </p>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-5 mt-6">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                                                    ⚠️ Peringatan: Risiko Day Trading
                                                </p>
                                                <p className="text-sm text-red-800 dark:text-red-200">
                                                    Data Intraday lebih berisiko dan volatil. Day trading membutuhkan pengalaman dan
                                                    manajemen risiko yang ketat. Jangan gunakan semua modal untuk day trading.
                                                    Selalu gunakan Stop Loss (SL) untuk melindungi modal Anda.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 5: PREDICTION SCANNER */}
                            <section id="prediction" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Prediction Scanner
                                    </h2>
                                </div>

                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <p className="text-base leading-relaxed">
                                        Prediction Scanner memungkinkan Anda melihat analisis untuk <strong>banyak saham sekaligus</strong>.
                                        Berguna untuk menemukan peluang trading dari berbagai saham dalam waktu singkat.
                                    </p>

                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                                        Cara Menggunakan Prediction Scanner
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-2 ml-4">
                                        <li>Pilih saham yang ingin dianalisis menggunakan multi-select (bisa pilih beberapa sekaligus).</li>
                                        <li>Klik tombol &quot;Compute / Scan&quot; untuk memulai analisis.</li>
                                        <li>Tunggu proses selesai (akan muncul loading indicator).</li>
                                        <li>Lihat hasil dalam bentuk tabel dengan kolom: Code, Close Price, Pred Price, Signal, dan Confidence Score.</li>
                                    </ol>

                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                                        Memahami &quot;Pred Price&quot;
                                    </h3>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            <strong>Pred Price (Predicted Price)</strong> adalah perkiraan harga berdasarkan:
                                        </p>
                                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                            <li><strong>Volatilitas harian:</strong> Semakin volatile saham, semakin besar potensi pergerakan</li>
                                            <li><strong>RSI dan MACD:</strong> Untuk menentukan arah (naik/turun)</li>
                                            <li><strong>Formula heuristik:</strong> Bukan prediksi yang dijamin 100% akurat</li>
                                        </ul>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                                            <strong>Penting:</strong> Pred Price adalah <strong>estimasi berdasarkan pola historis</strong>,
                                            bukan jaminan. Gunakan sebagai referensi, bukan sebagai satu-satunya dasar keputusan trading.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 6: GLOSSARY */}
                            <section id="glossary" className="mb-12 scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Kamus Istilah (Glossary)
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                                            <thead>
                                                <tr className="bg-gray-100 dark:bg-gray-800">
                                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                                        Istilah
                                                    </th>
                                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                                        Penjelasan
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm text-gray-700 dark:text-gray-300">
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>OHLC</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>Open, High, Low, Close</strong> - Data harga saham dalam satu periode.
                                                        Open = harga pembukaan, High = harga tertinggi, Low = harga terendah, Close = harga penutupan.
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>RSI</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>Relative Strength Index</strong> - Indikator momentum (0-100).
                                                        RSI &lt; 30 = Oversold (Murah), RSI &gt; 70 = Overbought (Mahal).
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>MACD</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>Moving Average Convergence Divergence</strong> - Indikator trend.
                                                        MACD positif = tren naik, MACD negatif = tren turun.
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>EPS</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>Earning Per Share</strong> - Laba per lembar saham.
                                                        EPS positif = perusahaan untung, EPS negatif = perusahaan rugi.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>PER</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>Price to Earning Ratio</strong> - Rasio valuasi.
                                                        PER rendah (&lt; 15) = murah, PER tinggi (&gt; 25) = mahal.
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>PBV</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>Price to Book Value</strong> - Rasio harga terhadap nilai buku.
                                                        PBV &lt; 1 = harga lebih murah dari nilai buku perusahaan.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>VWAP</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>Volume Weighted Average Price</strong> - Rata-rata harga berbobot volume.
                                                        Harga di atas VWAP = bullish, di bawah VWAP = bearish.
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>Bandar</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        Institusi atau pemilik modal besar yang dapat mempengaruhi pergerakan harga saham.
                                                        Aktivitas mereka dapat terdeteksi melalui analisis volume (Bandarmology).
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>OBV</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>On-Balance Volume</strong> - Indikator volume kumulatif.
                                                        OBV naik = akumulasi, OBV turun = distribusi.
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-medium">
                                                        <strong>ATR</strong>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                                        <strong>Average True Range</strong> - Indikator volatilitas.
                                                        Digunakan untuk menentukan Stop Loss dan Target Price dalam intraday trading.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    © 2024 IDX Stock Sense - Alat Bantu Analisis Saham untuk Pemula
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
