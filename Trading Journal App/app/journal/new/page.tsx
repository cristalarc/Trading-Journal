import Link from "next/link";

export default function NewJournalEntryPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Link 
          href="/journal" 
          className="text-primary hover:underline mr-4"
        >
          ← Back to Journal
        </Link>
        <h1 className="text-3xl font-bold">New Journal Entry</h1>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <form className="space-y-6">
          {/* Ticker and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="ticker" className="text-sm font-medium">
                Ticker Symbol
              </label>
              <input
                id="ticker"
                name="ticker"
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="e.g. AAPL"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="currentPrice" className="text-sm font-medium">
                Current Price
              </label>
              <input
                id="currentPrice"
                name="currentPrice"
                type="number"
                step="0.01"
                className="w-full p-2 border rounded-md"
                placeholder="e.g. 150.25"
                required
              />
            </div>
          </div>
          
          {/* Timeframe, Direction, and Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="timeframe" className="text-sm font-medium">
                Timeframe
              </label>
              <select
                id="timeframe"
                name="timeframe"
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Timeframe</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="direction" className="text-sm font-medium">
                Direction
              </label>
              <select
                id="direction"
                name="direction"
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Direction</option>
                <option value="bullish">Bullish</option>
                <option value="bearish">Bearish</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="sentiment" className="text-sm font-medium">
                Sentiment
              </label>
              <select
                id="sentiment"
                name="sentiment"
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Sentiment</option>
                <option value="bullish">Bullish</option>
                <option value="bearish">Bearish</option>
              </select>
            </div>
          </div>
          
          {/* Sentiment Type and Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="sentimentType" className="text-sm font-medium">
                Sentiment Type
              </label>
              <select
                id="sentimentType"
                name="sentimentType"
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Sentiment Type</option>
                <option value="technical">Technical</option>
                <option value="fundamental">Fundamental</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="governingPattern" className="text-sm font-medium">
                Governing Pattern
              </label>
              <input
                id="governingPattern"
                name="governingPattern"
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Cup & Handle"
              />
            </div>
          </div>
          
          {/* Support and Resistance Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="keySupportLevel" className="text-sm font-medium">
                Key Support Level
              </label>
              <input
                id="keySupportLevel"
                name="keySupportLevel"
                type="number"
                step="0.01"
                className="w-full p-2 border rounded-md"
                placeholder="e.g. 145.50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="keyResistanceLevel" className="text-sm font-medium">
                Key Resistance Level
              </label>
              <input
                id="keyResistanceLevel"
                name="keyResistanceLevel"
                type="number"
                step="0.01"
                className="w-full p-2 border rounded-md"
                placeholder="e.g. 155.75"
              />
            </div>
          </div>
          
          {/* Comments */}
          <div className="space-y-2">
            <label htmlFor="comments" className="text-sm font-medium">
              Comments
            </label>
            <textarea
              id="comments"
              name="comments"
              rows={4}
              className="w-full p-2 border rounded-md"
              placeholder="Enter your analysis and thoughts..."
              required
            ></textarea>
          </div>
          
          {/* Toggle Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <input
                id="weeklyOnePagerToggle"
                name="weeklyOnePagerToggle"
                type="checkbox"
                className="rounded"
              />
              <label htmlFor="weeklyOnePagerToggle" className="text-sm font-medium">
                Include in Weekly One Pager
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isFollowUpToOpenTrade"
                name="isFollowUpToOpenTrade"
                type="checkbox"
                className="rounded"
              />
              <label htmlFor="isFollowUpToOpenTrade" className="text-sm font-medium">
                Follow-up to Open Trade
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Create Journal Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 