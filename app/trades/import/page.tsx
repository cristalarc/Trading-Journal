"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
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
    }
  };

  const handleImport = async () => {
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
    // Create a sample CSV file for Tradersync format
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
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importType"
                  value="tradersync"
                  checked={importType === 'tradersync'}
                  onChange={(e) => setImportType(e.target.value as any)}
                  className="mr-2"
                />
                <span>Tradersync CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importType"
                  value="thinkorswim"
                  checked={importType === 'thinkorswim'}
                  onChange={(e) => setImportType(e.target.value as any)}
                  className="mr-2"
                />
                <span>ThinkorSwim (Coming Soon)</span>
              </label>
            </div>
            {importType === 'thinkorswim' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">ThinkorSwim import is not yet implemented.</span>
                </div>
              </div>
            )}
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
              <Button 
                onClick={handleImport} 
                disabled={!selectedFile || loading || importType === 'thinkorswim'}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {loading ? 'Importing...' : 'Import Trades'}
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadSample}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download Sample
              </Button>
            </div>
          </div>
        </Card>

        {/* Import Instructions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Import Instructions</h2>
          <div className="space-y-4">
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
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Trades will be automatically grouped by symbol and date</li>
                <li>• Multiple executions on the same day will be combined into a single trade</li>
                <li>• You can manually edit trades after import to add setup/mistake tags</li>
                <li>• Missing required fields will be highlighted for manual completion</li>
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

