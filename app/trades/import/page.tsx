"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { UnmatchedTagsDialog } from '@/components/trades/UnmatchedTagsDialog';

interface UnmatchedTag {
  name: string;
  suggestedType: 'pattern' | 'strategy' | 'source' | 'tag';
}

interface ImportResult {
  success: boolean;
  message: string;
  tradesCreated: number;
  errors: string[];
  warnings?: string[];
  unmatchedTags?: UnmatchedTag[];
}

interface Portfolio {
  id: string;
  name: string;
  isDefault: boolean;
}

interface TOSPreviewTrade {
  ticker: string;
  side: string;
  type: string;
  size: number;
  openDate: string;
  status: string;
  entryPrice?: number;
  exitPrice?: number;
  validation: {
    valid: boolean;
    errors: string[];
  };
}

interface TOSPreview {
  totalTrades: number;
  validTrades: number;
  invalidTrades: number;
  trades: TOSPreviewTrade[];
  errors: string[];
  warnings: string[];
}

export default function ImportTradesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'tradersync' | 'thinkorswim'>('tradersync');
  const [portfolioId, setPortfolioId] = useState<string>('');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [showUnmatchedDialog, setShowUnmatchedDialog] = useState(false);
  const [unmatchedTags, setUnmatchedTags] = useState<UnmatchedTag[]>([]);

  // TOS Preview states
  const [tosPreview, setTosPreview] = useState<TOSPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('/api/portfolios');
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data);
        // Set default portfolio as selected
        const defaultPortfolio = data.find((p: Portfolio) => p.isDefault);
        if (defaultPortfolio) {
          setPortfolioId(defaultPortfolio.id);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
      setTosPreview(null);
      setShowPreview(false);
    }
  };

  // Preview TOS trades
  const handleTOSPreview = async () => {
    if (!selectedFile) {
      alert('Please select a file to preview');
      return;
    }

    if (!portfolioId) {
      alert('Please select a portfolio');
      return;
    }

    setLoading(true);
    setTosPreview(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/trades/import/tos', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.preview) {
        setTosPreview(result.preview);
        setShowPreview(true);
      } else {
        alert('Failed to preview TOS import');
      }
    } catch (error) {
      console.error('Error previewing TOS import:', error);
      alert('Failed to preview TOS import');
    } finally {
      setLoading(false);
    }
  };

  // Confirm and import TOS trades
  const handleTOSConfirm = async () => {
    if (!tosPreview || !portfolioId) return;

    setLoading(true);
    setImportResult(null);

    try {
      // Only import valid trades
      const validTrades = tosPreview.trades.filter(t => t.validation.valid);

      const response = await fetch('/api/trades/import/tos/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trades: validTrades,
          portfolioId,
        }),
      });

      const result = await response.json();

      if (result.success && result.results) {
        setImportResult({
          success: true,
          message: 'Import completed',
          tradesCreated: result.results.successful,
          errors: result.results.errors || [],
        });
        setTosPreview(null);
        setShowPreview(false);
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert('Failed to import TOS trades');
      }
    } catch (error) {
      console.error('Error confirming TOS import:', error);
      alert('Failed to import TOS trades');
    } finally {
      setLoading(false);
    }
  };

  // Tradersync direct import (existing functionality)
  const handleTradersyncImport = async () => {
    if (!selectedFile) {
      alert('Please select a file to import');
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('importType', importType);
      formData.append('portfolioId', portfolioId);

      const response = await fetch('/api/trades/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      // Check if there are unmatched tags
      if (result.unmatchedTags && result.unmatchedTags.length > 0) {
        setUnmatchedTags(result.unmatchedTags);
        setShowUnmatchedDialog(true);
      }

      if (result.success) {
        // Clear the file input
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error importing trades:', error);
      setImportResult({
        success: false,
        message: 'Failed to import trades',
        tradesCreated: 0,
        errors: ['Network error occurred']
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    if (importType === 'tradersync') {
      const sampleData = [
        'Date,Time,Symbol,Quantity,Price,Side,Type,Commission,Fees,Notes',
        '2024-01-15,09:30:00,AAPL,100,150.00,BUY,SHARE,1.00,0.00,',
        '2024-01-16,15:45:00,AAPL,100,155.00,SELL,SHARE,1.00,0.00,'
      ].join('\n');

      const blob = new Blob([sampleData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tradersync_sample.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/trades">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trades
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Trades</h1>
          <p className="text-gray-600 mt-1">Import trades from CSV files</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Import Type Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Import Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                importType === 'tradersync'
                  ? 'border-blue-500 bg-blue-50 text-gray-900'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50 text-gray-900'
              }`}
            >
              <input
                type="radio"
                name="importType"
                value="tradersync"
                checked={importType === 'tradersync'}
                onChange={(e) => {
                  setImportType(e.target.value as any);
                  setTosPreview(null);
                  setShowPreview(false);
                }}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <div>
                <div className="font-semibold">Tradersync CSV</div>
                <div className="text-sm text-gray-600">Import from Tradersync export</div>
              </div>
            </label>

            <label
              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                importType === 'thinkorswim'
                  ? 'border-blue-500 bg-blue-50 text-gray-900'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50 text-gray-900'
              }`}
            >
              <input
                type="radio"
                name="importType"
                value="thinkorswim"
                checked={importType === 'thinkorswim'}
                onChange={(e) => {
                  setImportType(e.target.value as any);
                  setImportResult(null);
                }}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <div>
                <div className="font-semibold">ThinkOrSwim</div>
                <div className="text-sm text-gray-600">Import from Account Statement</div>
              </div>
            </label>
          </div>
        </Card>

        {/* Portfolio Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Portfolio *
              </label>
              <select
                value={portfolioId}
                onChange={(e) => setPortfolioId(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900"
                required
              >
                <option value="">Select Portfolio</option>
                {portfolios.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name} {portfolio.isDefault && '(Default)'}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                All imported trades will be added to this portfolio
              </p>
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload File</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800">File selected: {selectedFile.name}</span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {importType === 'thinkorswim' ? (
                <Button
                  onClick={handleTOSPreview}
                  disabled={!selectedFile || !portfolioId || loading}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {loading ? 'Loading Preview...' : 'Preview Trades'}
                </Button>
              ) : (
                <Button
                  onClick={handleTradersyncImport}
                  disabled={!selectedFile || !portfolioId || loading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {loading ? 'Importing...' : 'Import Trades'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={downloadSample}
                className="flex items-center gap-2"
                disabled={importType === 'thinkorswim'}
              >
                <FileText className="h-4 w-4" />
                Download Sample
              </Button>
            </div>
          </div>
        </Card>

        {/* TOS Preview Table */}
        {showPreview && tosPreview && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Preview: {tosPreview.totalTrades} Trade(s) Found</h2>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="text-sm text-blue-600">Total Trades</div>
                <div className="text-2xl font-bold text-blue-900">{tosPreview.totalTrades}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="text-sm text-green-600">Valid Trades</div>
                <div className="text-2xl font-bold text-green-900">{tosPreview.validTrades}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="text-sm text-red-600">Invalid Trades</div>
                <div className="text-2xl font-bold text-red-900">{tosPreview.invalidTrades}</div>
              </div>
            </div>

            {/* Errors and Warnings */}
            {tosPreview.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <p className="font-medium text-red-800 mb-2">Errors:</p>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  {tosPreview.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {tosPreview.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                <p className="font-medium text-yellow-800 mb-2">Warnings:</p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {tosPreview.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trades Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tosPreview.trades.map((trade, index) => (
                    <tr key={index} className={!trade.validation.valid ? 'bg-red-50' : ''}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trade.ticker}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{trade.side}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{trade.type}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{trade.size}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {trade.entryPrice ? `$${trade.entryPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(trade.openDate)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {trade.validation.valid ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Valid
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Invalid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Confirm Button */}
            <div className="mt-6 flex gap-4">
              <Button
                onClick={handleTOSConfirm}
                disabled={loading || tosPreview.validTrades === 0}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {loading ? 'Importing...' : `Import ${tosPreview.validTrades} Valid Trade(s)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setTosPreview(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Import Instructions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Import Instructions</h2>
          <div className="space-y-4">
            {importType === 'tradersync' ? (
              <>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Tradersync CSV Format</h3>
                  <p className="text-gray-600 mb-2">
                    Your CSV file should contain the following columns (case-sensitive):
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li><strong>Date</strong> - Trade date (YYYY-MM-DD format)</li>
                    <li><strong>Time</strong> - Trade time (HH:MM:SS format)</li>
                    <li><strong>Symbol</strong> - Stock symbol (e.g., AAPL)</li>
                    <li><strong>Quantity</strong> - Number of shares/contracts</li>
                    <li><strong>Price</strong> - Price per share/contract</li>
                    <li><strong>Side</strong> - BUY or SELL</li>
                    <li><strong>Type</strong> - SHARE or OPTION</li>
                    <li><strong>Commission</strong> - Commission paid (optional)</li>
                    <li><strong>Fees</strong> - Additional fees (optional)</li>
                    <li><strong>Notes</strong> - Trade notes (optional)</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">ThinkOrSwim Account Statement Format</h3>
                  <p className="text-gray-600 mb-2">
                    Export your Account Statement CSV from ThinkOrSwim:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Log into ThinkOrSwim platform</li>
                    <li>Go to Monitor → Account Statement</li>
                    <li>Select date range for your trades</li>
                    <li>Export as CSV file</li>
                    <li>Upload the complete Account Statement file here</li>
                  </ul>
                  <p className="text-gray-600 mt-3">
                    The system will automatically extract trades from the "Account Trade History" section.
                  </p>
                </div>
              </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                {importType === 'tradersync' ? (
                  <>
                    <li>• Trades will be automatically grouped by symbol and date</li>
                    <li>• Multiple executions on the same day will be combined into a single trade</li>
                    <li>• You can manually edit trades after import to add setup/mistake tags</li>
                    <li>• Missing required fields will be highlighted for manual completion</li>
                  </>
                ) : (
                  <>
                    <li>• Preview your trades before importing to verify accuracy</li>
                    <li>• Only valid trades will be imported</li>
                    <li>• Each execution is imported as a separate trade</li>
                    <li>• Symbols with "/" will be converted to "." (e.g., BRK/B → BRK.B)</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </Card>

        {/* Import Results */}
        {importResult && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Import Results</h2>
            <div className={`p-4 rounded ${
              importResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                {importResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <span className={`font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.message}
                </span>
              </div>

              {importResult.success && (
                <p className="text-green-700">
                  Successfully created {importResult.tradesCreated} trade(s).
                </p>
              )}

              {importResult.warnings && importResult.warnings.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-yellow-800 mb-2">Warnings:</p>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-red-800 mb-2">Errors encountered:</p>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.unmatchedTags && importResult.unmatchedTags.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-blue-800 mb-2">
                    {importResult.unmatchedTags.length} unmatched tag(s) found:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {importResult.unmatchedTags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowUnmatchedDialog(true)}
                    className="mt-3"
                  >
                    Create Missing Tags
                  </Button>
                </div>
              )}
            </div>

            {importResult.success && (
              <div className="mt-4">
                <Link href="/trades">
                  <Button>View Trades</Button>
                </Link>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Unmatched Tags Dialog */}
      <UnmatchedTagsDialog
        open={showUnmatchedDialog}
        onOpenChange={setShowUnmatchedDialog}
        unmatchedTags={unmatchedTags}
        onComplete={() => {
          // Clear unmatched tags after creation
          setUnmatchedTags([]);
        }}
      />
    </div>
  );
}
