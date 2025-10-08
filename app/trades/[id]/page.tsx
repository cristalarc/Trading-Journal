"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, AlertTriangle } from 'lucide-react';
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

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTrade(params.id as string);
    }
  }, [params.id]);

  const fetchTrade = async (id: string) => {
    try {
      const response = await fetch(`/api/trades/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTrade(data);
      } else {
        console.error('Failed to fetch trade');
      }
    } catch (error) {
      console.error('Error fetching trade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!trade) return;

    try {
      const response = await fetch(`/api/trades/${trade.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/trades');
      } else {
        alert('Failed to delete trade');
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Failed to delete trade');
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'OPEN') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Open</Badge>;
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
      ? <TrendingUp className="h-5 w-5 text-green-600" />
      : <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const getReturnColor = (returnValue: number | undefined) => {
    if (returnValue === undefined || returnValue === null) return 'text-gray-500';
    return returnValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading trade...</div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trade Not Found</h1>
          <p className="text-gray-600 mb-4">The trade you're looking for doesn't exist.</p>
          <Link href="/trades">
            <Button>Back to Trades</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/trades">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trades
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Trade #{trade.tradeId} - {trade.ticker}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              {getStatusBadge(trade.status)}
              <div className="flex items-center gap-2">
                {getSideIcon(trade.side)}
                <span className="text-gray-600">{trade.side}</span>
              </div>
              <span className="text-gray-600">{trade.type}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/trades/${trade.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(true)} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Trade Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <p className="text-lg font-semibold">{trade.size.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Date</label>
                <p className="text-lg font-semibold">{formatDate(trade.openDate)}</p>
              </div>
              {trade.closeDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
                  <p className="text-lg font-semibold">{formatDate(trade.closeDate)}</p>
                </div>
              )}
              {trade.source && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <p className="text-lg font-semibold">{trade.source.name}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Price Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trade.entryPrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Price</label>
                  <p className="text-lg font-semibold">{formatCurrency(trade.entryPrice)}</p>
                </div>
              )}
              {trade.exitPrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exit Price</label>
                  <p className="text-lg font-semibold">{formatCurrency(trade.exitPrice)}</p>
                </div>
              )}
              {trade.avgBuy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Buy</label>
                  <p className="text-lg font-semibold">{formatCurrency(trade.avgBuy)}</p>
                </div>
              )}
              {trade.avgSell && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Sell</label>
                  <p className="text-lg font-semibold">{formatCurrency(trade.avgSell)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Net Return</label>
                <p className={`text-lg font-semibold ${getReturnColor(trade.netReturn)}`}>
                  {formatCurrency(trade.netReturn)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return %</label>
                <p className={`text-lg font-semibold ${getReturnColor(trade.netReturnPercent)}`}>
                  {formatPercentage(trade.netReturnPercent)}
                </p>
              </div>
              {trade.mae && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MAE</label>
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(trade.mae)}</p>
                </div>
              )}
              {trade.mfe && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MFE</label>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(trade.mfe)}</p>
                </div>
              )}
              {trade.bestExitDollar && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Best Exit $</label>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(trade.bestExitDollar)}</p>
                </div>
              )}
              {trade.bestExitPercent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Best Exit %</label>
                  <p className="text-lg font-semibold text-green-600">{formatPercentage(trade.bestExitPercent)}</p>
                </div>
              )}
              {trade.missedExit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Missed Exit</label>
                  <p className="text-lg font-semibold text-orange-600">{formatCurrency(trade.missedExit)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Sub Orders */}
          {trade.subOrders && trade.subOrders.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Sub Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trade.subOrders.map((order: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{order.orderType}</td>
                        <td className="px-4 py-2 text-sm">{order.quantity.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm">{formatCurrency(order.price)}</td>
                        <td className="px-4 py-2 text-sm">{formatDate(order.orderDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Setup Tags */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Setup Tags
            </h3>
            <div className="space-y-2">
              {[trade.setup1, trade.setup2, trade.setup3, trade.setup4, trade.setup5, trade.setup6, trade.setup7]
                .filter(Boolean)
                .map((setup, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {setup?.name}
                  </Badge>
                ))}
              {![trade.setup1, trade.setup2, trade.setup3, trade.setup4, trade.setup5, trade.setup6, trade.setup7]
                .filter(Boolean).length && (
                <p className="text-gray-500 text-sm">No setup tags</p>
              )}
            </div>
          </Card>

          {/* Mistake Tags */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Mistake Tags
            </h3>
            <div className="space-y-2">
              {[trade.mistake1, trade.mistake2, trade.mistake3, trade.mistake4, trade.mistake5]
                .filter(Boolean)
                .map((mistake, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2 bg-red-50 text-red-700">
                    {mistake?.name}
                  </Badge>
                ))}
              {![trade.mistake1, trade.mistake2, trade.mistake3, trade.mistake4, trade.mistake5]
                .filter(Boolean).length && (
                <p className="text-gray-500 text-sm">No mistake tags</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Trade</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete Trade #{trade?.tradeId} - {trade?.ticker}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowDeleteModal(false);
                  handleDelete();
                }}
              >
                Delete Trade
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

