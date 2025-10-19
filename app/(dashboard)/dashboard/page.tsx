export default function DashboardPage() {
  return (
    <div className="px-4 sm:px-0">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to ForexMentor
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to your forex trading mentor dashboard. This is where you&apos;ll track your progress, 
          analyze trades, and access personalized guidance.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Trading Progress</h3>
            <p className="text-blue-700 text-sm">
              Track your learning journey and trading performance metrics.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Live Analysis</h3>
            <p className="text-green-700 text-sm">
              Get real-time market analysis and trading opportunities.
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Mentor Guidance</h3>
            <p className="text-purple-700 text-sm">
              Access personalized advice and educational content.
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Coming Soon:</strong> This dashboard will be populated with your trading data, 
            performance analytics, and personalized mentor recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
