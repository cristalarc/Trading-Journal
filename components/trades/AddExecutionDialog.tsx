"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface AddExecutionDialogProps {
  tradeId: string;
  tradeTicker: string;
  currentPosition: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddExecutionDialog({
  tradeId,
  tradeTicker,
  currentPosition,
  onSuccess,
  onCancel,
}: AddExecutionDialogProps) {
  const [orderType, setOrderType] = useState<'BUY' | 'SELL' | 'ADD_TO_POSITION' | 'REDUCE_POSITION'>('BUY');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [orderTime, setOrderTime] = useState<string>('09:30');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const qty = parseFloat(quantity);
    const px = parseFloat(price);

    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    if (isNaN(px) || px <= 0) {
      setError('Price must be a positive number');
      return;
    }

    // Check for negative position
    if ((orderType === 'SELL' || orderType === 'REDUCE_POSITION') && qty > currentPosition) {
      setError(`Cannot sell ${qty} shares. Current position is only ${currentPosition} shares.`);
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const dateTimeString = `${orderDate}T${orderTime}:00`;
      const executionDate = new Date(dateTimeString);

      const response = await fetch(`/api/trades/${tradeId}/executions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderType,
          quantity: qty,
          price: px,
          orderDate: executionDate.toISOString(),
          notes: notes || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to add execution');
      }
    } catch (err) {
      console.error('Error adding execution:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Execution</h2>
              <p className="text-sm text-gray-600 mt-1">
                {tradeTicker} - Current Position: {currentPosition} shares
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    orderType === 'BUY'
                      ? 'border-green-500 bg-green-50 text-gray-900'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="orderType"
                    value="BUY"
                    checked={orderType === 'BUY'}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="font-medium">BUY</span>
                </label>

                <label
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    orderType === 'SELL'
                      ? 'border-red-500 bg-red-50 text-gray-900'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="orderType"
                    value="SELL"
                    checked={orderType === 'SELL'}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="font-medium">SELL</span>
                </label>

                <label
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    orderType === 'ADD_TO_POSITION'
                      ? 'border-blue-500 bg-blue-50 text-gray-900'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="orderType"
                    value="ADD_TO_POSITION"
                    checked={orderType === 'ADD_TO_POSITION'}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="font-medium text-sm">ADD TO POSITION</span>
                </label>

                <label
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    orderType === 'REDUCE_POSITION'
                      ? 'border-orange-500 bg-orange-50 text-gray-900'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="orderType"
                    value="REDUCE_POSITION"
                    checked={orderType === 'REDUCE_POSITION'}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="font-medium text-sm">REDUCE POSITION</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {orderType === 'BUY' && 'Initial purchase or opening a position'}
                {orderType === 'SELL' && 'Closing or reducing a position'}
                {orderType === 'ADD_TO_POSITION' && 'Adding to an existing position (scaling in)'}
                {orderType === 'REDUCE_POSITION' && 'Partially closing a position (scaling out)'}
              </p>
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                  placeholder="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                  placeholder="150.50"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={orderTime}
                  onChange={(e) => setOrderTime(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                placeholder="Add any notes about this execution..."
                rows={3}
              />
            </div>

            {/* Position Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Position Preview</p>
              <p className="text-sm text-blue-800">
                Current: {currentPosition} shares →{' '}
                {orderType === 'BUY' || orderType === 'ADD_TO_POSITION'
                  ? `${currentPosition + (parseFloat(quantity) || 0)} shares (adding ${quantity || '0'})`
                  : `${Math.max(0, currentPosition - (parseFloat(quantity) || 0))} shares (reducing by ${quantity || '0'})`}
              </p>
              {orderType === 'SELL' || orderType === 'REDUCE_POSITION' ? (
                <p className="text-xs text-blue-700 mt-1">
                  {currentPosition - (parseFloat(quantity) || 0) <= 0
                    ? '⚠️ This will close the position'
                    : 'Position will remain open'}
                </p>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Adding Execution...' : 'Add Execution'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
