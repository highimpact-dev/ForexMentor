import { ReferralStats } from "@/components/dashboard/ReferralStats";

export default function DashboardPage() {
  return (
    <div className="px-4 sm:px-0 space-y-8">
      {/* Referral Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Earn Bonus Trades
        </h2>
        <ReferralStats />
      </div>

      {/* Main Dashboard */}
      <div className="bg-card rounded-lg shadow-sm p-8 border">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to ForexMentor
        </h1>
        <p className="text-muted-foreground mb-6">
          Welcome to your forex trading mentor dashboard. This is where you&apos;ll track your progress,
          analyze trades, and access personalized guidance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Trading Progress</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Track your learning journey and trading performance metrics.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Live Analysis</h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Get real-time market analysis and trading opportunities.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Mentor Guidance</h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              Access personalized advice and educational content.
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Coming Soon:</strong> This dashboard will be populated with your trading data,
            performance analytics, and personalized mentor recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
