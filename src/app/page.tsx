'use client';

import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { SingleAnalysisView } from '@/components/dashboard/SingleAnalysisView';
import { IntradayView } from '@/components/dashboard/IntradayView';
import { PredictionAllView } from '@/components/dashboard/PredictionAllView';
import { ComparisonView } from '@/components/dashboard/ComparisonView';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Main Content - Add top padding to account for fixed navbar */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                <DashboardTabs
                    singleAnalysisView={<SingleAnalysisView />}
                    intradayView={<IntradayView />}
                    predictionAllView={<PredictionAllView />}
                    comparisonView={<ComparisonView />}
                />
            </main>
        </div>
    );
}
