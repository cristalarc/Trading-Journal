"use client";

import { useState, useEffect } from 'react';
import { Plus, Upload, Filter, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Trade {
  id: string;
  tradeId: number;
  ticker: string;
  status: 'OPEN' | 'CLOSED' | 'WIN' | 'LOSS';
  side: 'LONG' | 'SHORT';
  type: 'SHARE' | 'OPTION';
  size: number;
  openDate: string;
  closeDate?: string;
  entryPrice?: number;
  exitPrice?: number;
  avgBuy?: number;
  avgSell?: number;
  netReturn?: number;
  netReturnPercent?: number;
  mae?: number;
  mfe?: number;
  bestExitDollar?: number;
  bestExitPercent?: number;
  missedExit?: number;
  portfolio?: {
    id: string;
    name: string;
  };
  source?: {
    id: string;
    name: string;
  };
  setup1?: { name: string };
  setup2?: { name: string };
  setup3?: { name: string };
  setup4?: { name: string };
  setup5?: { name: string };
  setup6?: { name: string };
  setup7?: { name: string };
  mistake1?: { name: string };
  mistake2?: { name: string };
  mistake3?: { name: string };
  mistake4?: { name: string };
  mistake5?: { name: string };
  subOrders: any[];
}

interface TradeStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalNetReturn: number;
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'WIN' | 'LOSS'>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');

  useEffect(() => {
    fetchTrades();
    fetchStats();
  }, []);

  const fetchTrades = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (sideFilter !== 'ALL') params.append('side', sideFilter);
      if (searchTerm) params.append('ticker', searchTerm);

      const response = await fetch(`/api/trades?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/trades?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatCurrency = (amount: number | undefined | any) => {
    if (amount === undefined || amount === null) return 'N/A';
    // Handle Prisma Decimal objects and other types
    const numValue = typeof amount === 'number' ? amount : parseFloat(amount.toString());
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numValue);
  };

  const formatPercentage = (percent: number | undefined | any) => {
    if (percent === undefined || percent === null) return 'N/A';
    // Handle Prisma Decimal objects and other types
    const numValue = typeof percent === 'number' ? percent : parseFloat(percent.toString());
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'OPEN') {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
          Open Position
        </Badge>
      );
    } else if (status === 'CLOSED') {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Closed</Badge>;
    } else if (status === 'WIN') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Win</Badge>;
    } else if (status === 'LOSS') {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Loss</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const getSideIcon = (side: string) => {
    return side === 'LONG' 
      ? <TrendingUp className="h-4 w-4 text-green-600" />
      : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getReturnColor = (returnValue: number | undefined) => {
    if (returnValue === undefined || returnValue === null) return 'text-gray-500';
    return returnValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  useEffect(() => {
    fetchTrades();
  }, [searchTerm, statusFilter, sideFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trade Log</h1>
          <p className="text-gray-600 mt-1">Track and analyze your trading performance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/trades/import">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </Link>
          <Link href="/trades/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trades</p>
                <p className="text-2xl font-bold">{stats.totalTrades}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Trades</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.openTrades}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed Trades</p>
                <p className="text-2xl font-bold text-green-600">{stats.closedTrades}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Net Return</p>
                <p className={`text-2xl font-bold ${getReturnColor(stats.totalNetReturn)}`}>
                  {formatCurrency(stats.totalNetReturn)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by ticker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-1 w-48 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border rounded px-3 py-1 bg-white text-gray-900"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="WIN">Win</option>
              <option value="LOSS">Loss</option>
            </select>
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value as any)}
              className="border rounded px-3 py-1 bg-white text-gray-900"
            >
              <option value="ALL">All Sides</option>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Trades Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trade ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Return</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className={`hover:bg-gray-50 ${
                    trade.status === 'OPEN' ? 'bg-yellow-50/50 border-l-4 border-l-yellow-400' : ''
                  }`}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{trade.tradeId}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={trade.status === 'OPEN' ? 'text-yellow-700 font-semibold' : 'text-gray-900'}>
                      {trade.ticker}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {trade.portfolio?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(trade.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getSideIcon(trade.side)}
                      <span className="text-sm text-gray-900">{trade.side}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trade.size.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(trade.openDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getReturnColor(trade.netReturn)}`}>
                      {formatCurrency(trade.netReturn)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getReturnColor(trade.netReturnPercent)}`}>
                      {formatPercentage(trade.netReturnPercent)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/trades/${trade.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {trades.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No trades found</div>
            <p className="text-gray-400 mb-4">Start by creating your first trade or importing from a file</p>
            <div className="flex gap-2 justify-center">
              <Link href="/trades/new">
                <Button>Create Trade</Button>
              </Link>
              <Link href="/trades/import">
                <Button variant="outline">Import Trades</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
