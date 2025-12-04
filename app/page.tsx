"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BookOpen,
  BarChart2,
  Lightbulb,
  FileText,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalNetReturn: number;
  winRate: number;
  openPositions: OpenPosition[];
}

interface OpenPosition {
  id: string;
  tradeId: number;
  ticker: string;
  side: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
  openDate: string;
  portfolio?: {
    name: string;
  };
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch trade stats
      const statsResponse = await fetch("/api/trades?stats=true");
      const tradesResponse = await fetch("/api/trades?status=OPEN");

      if (statsResponse.ok && tradesResponse.ok) {
        const statsData = await statsResponse.json();
        const tradesData = await tradesResponse.json();

        setStats({
          ...statsData,
          openPositions: tradesData.slice(0, 5), // Show top 5 open positions
          winRate:
            statsData.closedTrades > 0
              ? ((statsData.closedTrades - (statsData.totalTrades - statsData.openTrades - statsData.closedTrades)) /
                  statsData.closedTrades) *
                100
              : 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return "$0.00";
    const numValue = typeof amount === "number" ? amount : parseFloat(String(amount));
    if (isNaN(numValue)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getReturnColor = (value: number | undefined) => {
    if (value === undefined || value === null) return "text-gray-500";
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <main className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your Trading Journal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold">{stats?.totalTrades || 0}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Positions</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.openTrades || 0}</p>
            </div>
            <div className="relative">
              {stats?.openTrades && stats.openTrades > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              )}
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Closed Trades</p>
              <p className="text-2xl font-bold text-green-600">{stats?.closedTrades || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold ${getReturnColor(stats?.totalNetReturn)}`}>
                {formatCurrency(stats?.totalNetReturn)}
              </p>
            </div>
            {stats?.totalNetReturn && stats.totalNetReturn >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Positions Panel */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              Open Positions
            </h2>
            <Link href="/trades?status=OPEN">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : stats?.openPositions && stats.openPositions.length > 0 ? (
            <div className="space-y-3">
              {stats.openPositions.map((position) => (
                <Link
                  key={position.id}
                  href={`/trades/${position.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {position.side === "LONG" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-semibold text-yellow-800">{position.ticker}</span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 text-xs">
                        {position.side}
                      </Badge>
                      {position.portfolio && (
                        <span className="text-xs text-gray-500">{position.portfolio.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{position.size} shares</span>
                      <span className="text-gray-600">@ {formatCurrency(position.entryPrice)}</span>
                      <span className="text-gray-500">{formatDate(position.openDate)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No open positions</p>
              <Link href="/trades/new">
                <Button variant="outline">Create Trade</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/trades/new" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">New Trade</p>
                  <p className="text-sm text-gray-500">Record a new trade</p>
                </div>
              </div>
            </Link>

            <Link href="/trades/import" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Import Trades</p>
                  <p className="text-sm text-gray-500">From CSV file</p>
                </div>
              </div>
            </Link>

            <Link href="/journal" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Journal</p>
                  <p className="text-sm text-gray-500">Write trading notes</p>
                </div>
              </div>
            </Link>

            <Link href="/ideas" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Ideas</p>
                  <p className="text-sm text-gray-500">Track trade ideas</p>
                </div>
              </div>
            </Link>

            <Link href="/analysis" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <BarChart2 className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium">Analysis</p>
                  <p className="text-sm text-gray-500">View performance</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
