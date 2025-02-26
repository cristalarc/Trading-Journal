import Link from "next/link";

export default function JournalPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Trading Journal</h1>
        <Link 
          href="/journal/new" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          New Entry
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold">AAPL</h2>
              <p className="text-muted-foreground">Daily Timeframe</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">$150.25</p>
              <span className="inline-block px-2 py-1 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Bullish
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Support</p>
              <p className="font-medium">$145.50</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resistance</p>
              <p className="font-medium">$155.75</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pattern</p>
              <p className="font-medium">Cup & Handle</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sentiment Type</p>
              <p className="font-medium">Technical</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Comments</p>
            <p>Strong momentum with increasing volume</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                7D: Win
              </span>
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                30D: Win
              </span>
            </div>
            <Link 
              href="/journal/1" 
              className="text-sm text-primary hover:underline"
            >
              View Details
            </Link>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold">TSLA</h2>
              <p className="text-muted-foreground">Weekly Timeframe</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">$220.15</p>
              <span className="inline-block px-2 py-1 text-sm rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                Bearish
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Support</p>
              <p className="font-medium">$210.00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resistance</p>
              <p className="font-medium">$230.50</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pattern</p>
              <p className="font-medium">Head & Shoulders</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sentiment Type</p>
              <p className="font-medium">Technical</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Comments</p>
            <p>Potential breakdown below neckline</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                7D: Lose
              </span>
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                30D: Win
              </span>
            </div>
            <Link 
              href="/journal/2" 
              className="text-sm text-primary hover:underline"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 