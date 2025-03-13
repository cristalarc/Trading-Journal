import Link from "next/link";

export default function AnalysisPage() {
  // Mock data for demonstration
  const performanceData = {
    totalEntries: 25,
    winRate7D: 68,
    winRate30D: 72,
    byTimeframe: {
      hourly: { entries: 8, winRate7D: 62, winRate30D: 75 },
      daily: { entries: 12, winRate7D: 75, winRate30D: 83 },
      weekly: { entries: 5, winRate7D: 60, winRate30D: 40 },
    },
    byDirection: {
      bullish: { entries: 15, winRate7D: 73, winRate30D: 80 },
      bearish: { entries: 10, winRate7D: 60, winRate30D: 60 },
    },
    bySentimentType: {
      technical: { entries: 18, winRate7D: 72, winRate30D: 78 },
      fundamental: { entries: 7, winRate7D: 57, winRate30D: 57 },
    },
    topPatterns: [
      { name: "Cup & Handle", entries: 5, winRate: 80 },
      { name: "Head & Shoulders", entries: 4, winRate: 75 },
      { name: "Double Bottom", entries: 3, winRate: 67 },
    ],
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Trading Analysis</h1>
        <Link 
          href="/" 
          className="text-primary hover:underline"
        >
          Back to Home
        </Link>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-2">Total Entries</h2>
          <p className="text-3xl font-bold">{performanceData.totalEntries}</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-2">7-Day Win Rate</h2>
          <p className="text-3xl font-bold">{performanceData.winRate7D}%</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-2">30-Day Win Rate</h2>
          <p className="text-3xl font-bold">{performanceData.winRate30D}%</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-2">Best Timeframe</h2>
          <p className="text-3xl font-bold capitalize">Daily</p>
          <p className="text-sm text-muted-foreground">83% win rate (30D)</p>
        </div>
      </div>
      
      {/* Performance by Timeframe */}
      <div className="bg-card p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance by Timeframe</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Timeframe</th>
                <th className="text-left py-2 px-4">Entries</th>
                <th className="text-left py-2 px-4">7-Day Win Rate</th>
                <th className="text-left py-2 px-4">30-Day Win Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4 capitalize">Hourly</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.hourly.entries}</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.hourly.winRate7D}%</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.hourly.winRate30D}%</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 capitalize">Daily</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.daily.entries}</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.daily.winRate7D}%</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.daily.winRate30D}%</td>
              </tr>
              <tr>
                <td className="py-2 px-4 capitalize">Weekly</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.weekly.entries}</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.weekly.winRate7D}%</td>
                <td className="py-2 px-4">{performanceData.byTimeframe.weekly.winRate30D}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Performance by Direction and Sentiment Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Performance by Direction</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Direction</th>
                  <th className="text-left py-2 px-4">Entries</th>
                  <th className="text-left py-2 px-4">7-Day Win Rate</th>
                  <th className="text-left py-2 px-4">30-Day Win Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 capitalize">Bullish</td>
                  <td className="py-2 px-4">{performanceData.byDirection.bullish.entries}</td>
                  <td className="py-2 px-4">{performanceData.byDirection.bullish.winRate7D}%</td>
                  <td className="py-2 px-4">{performanceData.byDirection.bullish.winRate30D}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 capitalize">Bearish</td>
                  <td className="py-2 px-4">{performanceData.byDirection.bearish.entries}</td>
                  <td className="py-2 px-4">{performanceData.byDirection.bearish.winRate7D}%</td>
                  <td className="py-2 px-4">{performanceData.byDirection.bearish.winRate30D}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Performance by Sentiment Type</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Entries</th>
                  <th className="text-left py-2 px-4">7-Day Win Rate</th>
                  <th className="text-left py-2 px-4">30-Day Win Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 capitalize">Technical</td>
                  <td className="py-2 px-4">{performanceData.bySentimentType.technical.entries}</td>
                  <td className="py-2 px-4">{performanceData.bySentimentType.technical.winRate7D}%</td>
                  <td className="py-2 px-4">{performanceData.bySentimentType.technical.winRate30D}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 capitalize">Fundamental</td>
                  <td className="py-2 px-4">{performanceData.bySentimentType.fundamental.entries}</td>
                  <td className="py-2 px-4">{performanceData.bySentimentType.fundamental.winRate7D}%</td>
                  <td className="py-2 px-4">{performanceData.bySentimentType.fundamental.winRate30D}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Top Performing Patterns */}
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Top Performing Patterns</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Pattern</th>
                <th className="text-left py-2 px-4">Entries</th>
                <th className="text-left py-2 px-4">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.topPatterns.map((pattern, index) => (
                <tr key={index} className={index < performanceData.topPatterns.length - 1 ? "border-b" : ""}>
                  <td className="py-2 px-4">{pattern.name}</td>
                  <td className="py-2 px-4">{pattern.entries}</td>
                  <td className="py-2 px-4">{pattern.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 