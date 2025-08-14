'use client';

import { useState, useMemo } from 'react';
import { Tx } from '@/types/transaction';
import { sampleTransactions } from '@/data/sampleData';
import CsvUploader from '@/components/CsvUploader';
import Charts from '@/components/Charts';
import FilterControls, { FilterState } from '@/components/FilterControls';
import TransactionTable from '@/components/TransactionTable';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function HomePage() {
  const [transactions, setTransactions] = useState<Tx[]>(sampleTransactions);

  const { minDate, maxDate, uniqueAccounts } = useMemo(() => {
    const dates = transactions.map(tx => tx.dateOp).sort();
    const accounts = Array.from(new Set(transactions.map(tx => tx.accountLabel)));

    return {
      minDate: dates[0] || '',
      maxDate: dates[dates.length - 1] || '',
      uniqueAccounts: accounts,
    };
  }, [transactions]);

  const [filters, setFilters] = useState<FilterState>({
    dateFrom: minDate,
    dateTo: maxDate,
    selectedAccounts: uniqueAccounts,
    searchText: '',
    selectedCategoryParent: null,
    periodPreset: 'thisMonth',
    categoryMode: 'all',
    selectedCategoryParents: [],
    showFlaggedOnly: false,
  });

  // Update filters when transactions change
  useMemo(() => {
    // If using the default 'thisMonth' preset, set to current month clamped to data
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const clampedFrom = minDate ? (new Date(minDate) > start ? new Date(minDate) : start) : start;
    const clampedTo = maxDate ? (new Date(maxDate) < end ? new Date(maxDate) : end) : end;
    setFilters(prev => ({
      ...prev,
      dateFrom: prev.periodPreset === 'thisMonth' ? format(clampedFrom, 'yyyy-MM-dd') : minDate,
      dateTo: prev.periodPreset === 'thisMonth' ? format(clampedTo, 'yyyy-MM-dd') : maxDate,
      selectedAccounts: uniqueAccounts,
    }));
  }, [minDate, maxDate, uniqueAccounts]);

  const handleDataLoaded = (newTransactions: Tx[]) => {
    setTransactions(newTransactions);
  };

  const handleCategoryClick = (categoryParent: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategoryParent: categoryParent,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Boursorama Finance Analyzer
          </h1>
          <p className="text-gray-600">
            Upload your CSV or explore sample data with interactive charts and filters
          </p>
        </div>

        {/* CSV Upload */}
        <CsvUploader onDataLoaded={handleDataLoaded} />

        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No transaction data available. Please upload a CSV file to get started.</p>
          </div>
        ) : (
          <>
            {/* Sample Data Notice */}
            {transactions === sampleTransactions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      Currently showing sample data. Upload your Boursorama CSV to analyze your real transactions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            <Charts
              transactions={transactions}
              onCategoryClick={handleCategoryClick}
            />

            {/* Filters */}
            <FilterControls
              transactions={transactions}
              filters={filters}
              onFiltersChange={setFilters}
            />

            {/* Transaction Table */}
            <TransactionTable
              transactions={transactions}
              filters={filters}
            />
          </>
        )}
      </div>
    </div>
  );
}
