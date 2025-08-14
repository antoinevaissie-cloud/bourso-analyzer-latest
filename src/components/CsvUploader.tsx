'use client';

import { useState } from 'react';
import { Tx } from '@/types/transaction';

interface CsvUploaderProps {
  onDataLoaded: (transactions: Tx[]) => void;
}

export default function CsvUploader({ onDataLoaded }: CsvUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    totalProcessed: number;
    duplicatesSkipped: number;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setUploadStats(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Upload failed';
        const details = data.details ? ` Details: ${JSON.stringify(data.details)}` : '';
        throw new Error(errorMessage + details);
      }

      onDataLoaded(data.transactions);
      setUploadStats({
        totalProcessed: data.totalProcessed,
        duplicatesSkipped: data.duplicatesSkipped,
      });

      // Show processing errors if any
      if (data.processingErrors && data.processingErrors.length > 0) {
        console.warn('Some rows had processing errors:', data.processingErrors);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="space-y-4">
        <div>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Upload Boursorama CSV
          </h3>
          <p className="text-gray-500">
            Select your CSV file to analyze transactions
          </p>
        </div>
        <div>
          <label htmlFor="csv-upload" className="cursor-pointer">
            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {isLoading ? 'Processing...' : 'Choose CSV File'}
            </span>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {uploadStats && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm">
            ✅ Successfully processed {uploadStats.totalProcessed} rows
            {uploadStats.duplicatesSkipped > 0 && 
              ` (${uploadStats.duplicatesSkipped} duplicates skipped)`
            }
          </p>
        </div>
      )}
    </div>
  );
}