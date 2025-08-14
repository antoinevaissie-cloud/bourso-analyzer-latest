'use client';

import { useMemo } from 'react';
import { startOfMonth, endOfMonth, format, subMonths, max as maxDateFn, min as minDateFn } from 'date-fns';
import { Tx } from '@/types/transaction';

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  selectedAccounts: string[];
  searchText: string;
  selectedCategoryParent: string | null;
  periodPreset: 'thisMonth' | 'lastMonth' | 'custom';
  categoryMode: 'all' | 'essentials' | 'nonEssentials';
  selectedCategoryParents?: string[];
  showFlaggedOnly?: boolean;
}

interface FilterControlsProps {
  transactions: Tx[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterControls({
  transactions,
  filters,
  onFiltersChange,
}: FilterControlsProps) {
  const { minDate, maxDate, uniqueAccounts } = useMemo(() => {
    const dates = transactions.map(tx => tx.dateOp).sort();
    const accounts = Array.from(new Set(transactions.map(tx => tx.accountLabel)));

    return {
      minDate: dates[0] || '',
      maxDate: dates[dates.length - 1] || '',
      uniqueAccounts: accounts,
    };
  }, [transactions]);

  const applyPeriodPreset = (preset: 'thisMonth' | 'lastMonth' | 'custom') => {
    if (preset === 'custom') {
      onFiltersChange({ ...filters, periodPreset: 'custom' });
      return;
    }
    const now = new Date();
    const base = preset === 'thisMonth' ? now : subMonths(now, 1);
    const start = startOfMonth(base);
    const end = endOfMonth(base);
    // Clamp to dataset bounds if present
    const dataMin = minDate ? new Date(minDate) : start;
    const dataMax = maxDate ? new Date(maxDate) : end;
    const clampedStart = maxDateFn([start, dataMin]);
    const clampedEnd = minDateFn([end, dataMax]);
    onFiltersChange({
      ...filters,
      periodPreset: preset,
      dateFrom: format(clampedStart, 'yyyy-MM-dd'),
      dateTo: format(clampedEnd, 'yyyy-MM-dd'),
    });
  };

  const quickPreset = (
    preset: 'thisMonth' | 'lastMonth',
    account: 'BoursoBank' | 'BoursoBank (joint)',
    categoryMode: 'essentials' | 'nonEssentials'
  ) => {
    const accountsToUse = uniqueAccounts.includes(account) ? [account] : uniqueAccounts;
    const now = new Date();
    const base = preset === 'thisMonth' ? now : subMonths(now, 1);
    const start = startOfMonth(base);
    const end = endOfMonth(base);
    const dataMin = minDate ? new Date(minDate) : start;
    const dataMax = maxDate ? new Date(maxDate) : end;
    const clampedStart = maxDateFn([start, dataMin]);
    const clampedEnd = minDateFn([end, dataMax]);
    onFiltersChange({
      ...filters,
      periodPreset: preset,
      dateFrom: format(clampedStart, 'yyyy-MM-dd'),
      dateTo: format(clampedEnd, 'yyyy-MM-dd'),
      selectedAccounts: accountsToUse,
      categoryMode,
    });
  };

  const handleAccountToggle = (account: string) => {
    const updated = filters.selectedAccounts.includes(account)
      ? filters.selectedAccounts.filter(a => a !== account)
      : [...filters.selectedAccounts, account];

    onFiltersChange({ ...filters, selectedAccounts: updated });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateFrom: minDate,
      dateTo: maxDate,
      selectedAccounts: uniqueAccounts,
      searchText: '',
      selectedCategoryParent: null,
      periodPreset: 'custom',
      categoryMode: 'all',
      selectedCategoryParents: [],
      showFlaggedOnly: false,
    });
  };

  const hasActiveFilters =
    filters.dateFrom !== minDate ||
    filters.dateTo !== maxDate ||
    filters.selectedAccounts.length !== uniqueAccounts.length ||
    filters.searchText !== '' ||
    filters.selectedCategoryParent !== null;

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Period Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Period:</span>
        {(['thisMonth','lastMonth','custom'] as const).map(preset => (
          <button
            key={preset}
            onClick={() => applyPeriodPreset(preset)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.periodPreset === preset ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {preset === 'thisMonth' ? 'This month' : preset === 'lastMonth' ? 'Last month' : 'Custom'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            min={minDate}
            max={maxDate}
            onChange={(e) => onFiltersChange({ ...filters, periodPreset: 'custom', dateFrom: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo}
            min={minDate}
            max={maxDate}
            onChange={(e) => onFiltersChange({ ...filters, periodPreset: 'custom', dateTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Labels
          </label>
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.searchText}
            onChange={(e) => onFiltersChange({ ...filters, searchText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Filter
          </label>
          {filters.selectedCategoryParent ? (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {filters.selectedCategoryParent}
              </span>
              <button
                onClick={() => onFiltersChange({ ...filters, selectedCategoryParent: null })}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <span className="text-gray-500 text-sm">Click chart to filter</span>
          )}
        </div>
      </div>

      {/* Category Mode */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Spending view:</span>
        {(['all','essentials','nonEssentials'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => onFiltersChange({ ...filters, categoryMode: mode })}
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.categoryMode === mode ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {mode === 'all' ? 'All' : mode === 'essentials' ? 'Essentials' : 'Non‑essentials'}
          </button>
        ))}
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Quick sums:</span>
        <button
          onClick={() => quickPreset('thisMonth', 'BoursoBank (joint)', 'nonEssentials')}
          className="px-3 py-1 rounded-full text-sm border bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
        >
          Joint • Non‑essentials • This month
        </button>
        <button
          onClick={() => quickPreset('thisMonth', 'BoursoBank (joint)', 'essentials')}
          className="px-3 py-1 rounded-full text-sm border bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
        >
          Joint • Essentials • This month
        </button>
      </div>

      {/* Account Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Labels
        </label>
        <div className="flex flex-wrap gap-2">
          {uniqueAccounts.map(account => (
            <button
              key={account}
              onClick={() => handleAccountToggle(account)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filters.selectedAccounts.includes(account)
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {account}
              <span className="ml-1 text-xs">
                ({transactions.filter(tx => tx.accountLabel === account).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Flagged Only Toggle */}
      <div className="flex items-center gap-2">
        <input
          id="flagged-only"
          type="checkbox"
          checked={!!filters.showFlaggedOnly}
          onChange={(e) => onFiltersChange({ ...filters, showFlaggedOnly: e.target.checked })}
        />
        <label htmlFor="flagged-only" className="text-sm text-gray-700">Show only flagged</label>
      </div>
    </div>
  );
}
