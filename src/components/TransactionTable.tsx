'use client';

import { useState, useMemo } from 'react';
import { Tx } from '@/types/transaction';
import { FilterState } from './FilterControls';

interface TransactionTableProps {
  transactions: Tx[];
  filters: FilterState;
}

type SortField = keyof Tx;
type SortDirection = 'asc' | 'desc';

export default function TransactionTable({ transactions, filters }: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('dateOp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => {
      // Date range filter
      if (tx.dateOp < filters.dateFrom || tx.dateOp > filters.dateTo) {
        return false;
      }

      // Account filter
      if (!filters.selectedAccounts.includes(tx.accountLabel)) {
        return false;
      }

      // Search filter
      if (filters.searchText && !tx.label.toLowerCase().includes(filters.searchText.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.selectedCategoryParent && tx.categoryParent !== filters.selectedCategoryParent) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  }, [transactions, filters, sortField, sortDirection]);

  const totals = useMemo(() => {
    const expenses = filteredAndSortedTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const income = filteredAndSortedTransactions
      .filter(tx => tx.amount >= 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { expenses, income, net: income - expenses };
  }, [filteredAndSortedTransactions]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Summary Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaction Details</h3>
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-3 rounded">
            <div className="text-sm text-red-600 font-medium">Total Expenses</div>
            <div className="text-xl font-semibold text-red-700">
              €{totals.expenses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-green-600 font-medium">Total Income</div>
            <div className="text-xl font-semibold text-green-700">
              €{totals.income.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`p-3 rounded ${totals.net >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="text-sm font-medium text-gray-600">Net Balance</div>
            <div className={`text-xl font-semibold ${totals.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              €{totals.net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-blue-600 font-medium">Transaction Count</div>
            <div className="text-xl font-semibold text-blue-700">
              {filteredAndSortedTransactions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dateOp')}
              >
                Date {getSortIcon('dateOp')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('label')}
              >
                Label {getSortIcon('label')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('categoryParent')}
              >
                Category {getSortIcon('categoryParent')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                Amount {getSortIcon('amount')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('accountLabel')}
              >
                Account {getSortIcon('accountLabel')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedTransactions.map((tx, index) => (
              <tr key={`${tx.dateOp}-${tx.label}-${tx.amount}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(tx.dateOp).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={tx.label}>
                  {tx.label}
                  {tx.supplierFound && (
                    <div className="text-xs text-gray-500">
                      {tx.supplierFound}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-sm text-gray-900">{tx.categoryParent}</div>
                  <div className="text-xs text-gray-500">{tx.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={tx.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {tx.amount < 0 ? '-' : '+'}€{Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.accountLabel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedTransactions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No transactions match your current filters.
        </div>
      )}
    </div>
  );
}