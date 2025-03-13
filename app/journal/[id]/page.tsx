import Link from "next/link";

export default function JournalEntryDetailPage({ params }: { params: { id: string } }) {
  // In a real application, we would fetch the journal entry by ID
  const entryId = params.id;
  
  // Mock data for demonstration
  const entry = {
    id: entryId,
    entryDate: new Date("2023-01-01").toLocaleDateString(),
    relevantWeek: 1,
    ticker: entryId === "1" ? "AAPL" : "TSLA",
    currentPrice: entryId === "1" ? 150.25 : 220.15,
    timeframe: entryId === "1" ? "daily" : "weekly",
    direction: entryId === "1" ? "bullish" : "bearish",
    sentiment: entryId === "1" ? "bullish" : "bearish",
    sentimentType: "technical",
    governingPattern: entryId === "1" ? "Cup & Handle" : "Head & Shoulders",
    keySupportLevel: entryId === "1" ? 145.50 : 210.00,
    keyResistanceLevel: entryId === "1" ? 155.75 : 230.50,
    comments: entryId === "1" 
      ? "Strong momentum with increasing volume" 
      : "Potential breakdown below neckline",
    weeklyOnePagerToggle: true,
    isFollowUpToOpenTrade: entryId === "1" ? false : true,
    retrospective7D: entryId === "1" ? "win" : "lose",
    retrospective30D: "win",
    updates: entryId === "1" ? [
      {
        id: "1-1",
        updateDate: new Date("2023-01-02").toLocaleDateString(),
        comments: "Price broke resistance as expected",
      }
    ] : [],
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Link 
          href="/journal" 
          className="text-primary hover:underline mr-4"
        >
          ← Back to Journal
        </Link>
        <h1 className="text-3xl font-bold">{entry.ticker} Journal Entry</h1>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">{entry.ticker}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Entry Date</p>
                <p className="font-medium">{entry.entryDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relevant Week</p>
                <p className="font-medium">Week {entry.relevantWeek}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="font-medium">${entry.currentPrice}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timeframe</p>
                <p className="font-medium capitalize">{entry.timeframe}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                entry.direction === "bullish" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}>
                Direction: {entry.direction}
              </span>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                entry.sentiment === "bullish" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}>
                Sentiment: {entry.sentiment}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sentiment Type</p>
                <p className="font-medium capitalize">{entry.sentimentType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pattern</p>
                <p className="font-medium">{entry.governingPattern}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Support</p>
                <p className="font-medium">${entry.keySupportLevel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resistance</p>
                <p className="font-medium">${entry.keyResistanceLevel}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Comments</h3>
          <p className="p-3 bg-muted/50 rounded-md">{entry.comments}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Retrospective</h3>
            <div className="flex space-x-3">
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                entry.retrospective7D === "win" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}>
                7D: {entry.retrospective7D}
              </span>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                entry.retrospective30D === "win" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}>
                30D: {entry.retrospective30D}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Options</h3>
            <div className="flex space-x-3">
              {entry.weeklyOnePagerToggle && (
                <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Weekly One Pager
                </span>
              )}
              {entry.isFollowUpToOpenTrade && (
                <span className="inline-block px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                  Follow-up to Open Trade
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Updates</h3>
          {entry.updates.length > 0 ? (
            <div className="space-y-3">
              {entry.updates.map((update) => (
                <div key={update.id} className="p-3 bg-muted/50 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">{update.updateDate}</p>
                  </div>
                  <p>{update.comments}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No updates yet.</p>
          )}
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Add Update</h3>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="updateComments" className="text-sm font-medium">
              Comments
            </label>
            <textarea
              id="updateComments"
              name="updateComments"
              rows={3}
              className="w-full p-2 border rounded-md"
              placeholder="Enter your update..."
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Add Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 