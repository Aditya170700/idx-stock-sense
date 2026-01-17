import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "IDX Stock Sense - Stock Analysis & Prediction Dashboard",
    description: "Aplikasi bantu analisa saham Indonesia dengan fitur Bandarmology, Intraday VWAP, dan Fundamental Check. Gratis.",
    openGraph: {
        title: "IDX Stock Sense - Stock Analysis & Prediction Dashboard",
        description: "Cek kesehatan saham, bandarmology, dan sinyal intraday gratis.",
        url: "https://idx-stock-sense.vercel.app",
        siteName: "IDX Stock Sense",
        images: [
            {
                url: "/opengraph-image.png",
                width: 1200,
                height: 630,
                alt: "IDX Stock Sense Dashboard Preview",
            },
        ],
        locale: "id_ID",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "IDX Stock Sense",
        description: "Analisa saham Indonesia jadi lebih mudah.",
        images: ["/opengraph-image.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50/50 dark:bg-gray-900`}
            >
                <Navbar />
                {children}
                <Analytics />
            </body>
        </html>
    );
}
