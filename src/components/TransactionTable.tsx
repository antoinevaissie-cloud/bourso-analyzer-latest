'use client';

import { useState, useMemo } from 'react';
import { Tx } from '@/types/transaction';
import { FilterState } from './FilterControls';
import { isEssential } from '@/data/categoryGroups';
import { getAnnotationForTx, upsertAnnotationForTx, isFlagged, getNote, getAnnotationKeyForTx } from '@/utils/annotations';

interface TransactionTableProps {
  transactions: Tx[];
  filters: FilterState;
}

type SortField = keyof Tx;
type SortDirection = 'asc' | 'desc';

export default function TransactionTable({ transactions, filters }: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('dateOp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

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
      if (filters.searchText) {
        const q = filters.searchText.toLowerCase();
        const inLabel = tx.label.toLowerCase().includes(q);
        const inSupplier = (tx.supplierFound || '').toLowerCase().includes(q);
        const inComment = (tx.comment || '').toLowerCase().includes(q);
        const inNote = getNote(tx).toLowerCase().includes(q);
        if (!(inLabel || inSupplier || inComment || inNote)) return false;
      }

      // Category filter
      if (filters.selectedCategoryParent && tx.categoryParent !== filters.selectedCategoryParent) {
        return false;
      }

      // Category mode filter
      if (filters.categoryMode === 'essentials' && !isEssential(tx.categoryParent)) return false;
      if (filters.categoryMode === 'nonEssentials' && isEssential(tx.categoryParent)) return false;

      // Selected category list (optional)
      if (filters.selectedCategoryParents && filters.selectedCategoryParents.length > 0) {
        if (!filters.selectedCategoryParents.includes(tx.categoryParent)) return false;
      }

      // Flagged-only filter
      if (filters.showFlaggedOnly && !isFlagged(tx)) return false;

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

  const perAccountTotals = useMemo(() => {
    const byAccount: Record<string, { expenses: number; income: number; net: number }> = {};
    for (const tx of filteredAndSortedTransactions) {
      const key = tx.accountLabel;
      if (!byAccount[key]) byAccount[key] = { expenses: 0, income: 0, net: 0 };
      if (tx.amount < 0) byAccount[key].expenses += Math.abs(tx.amount);
      else byAccount[key].income += tx.amount;
      byAccount[key].net = byAccount[key].income - byAccount[key].expenses;
    }
    return byAccount;
  }, [filteredAndSortedTransactions]);

  const essentialsVsNon = useMemo(() => {
    let essentials = 0;
    let nonEssentials = 0;
    for (const tx of filteredAndSortedTransactions) {
      if (tx.amount < 0) {
        if (isEssential(tx.categoryParent)) essentials += Math.abs(tx.amount);
        else nonEssentials += Math.abs(tx.amount);
      }
    }
    return { essentials, nonEssentials };
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

        {/* Essentials vs Non-essentials badges */}
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="px-3 py-1 rounded-full text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
            Essentials spend: €{essentialsVsNon.essentials.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </span>
          <span className="px-3 py-1 rounded-full text-sm bg-amber-50 text-amber-700 border border-amber-200">
            Non‑essentials spend: €{essentialsVsNon.nonEssentials.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Per-account summaries */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(perAccountTotals).map(([account, totals]) => (
            <div key={account} className="border rounded p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">{account}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-red-700">€{totals.expenses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
                <div className="text-green-700">€{totals.income.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
                <div className={totals.net >= 0 ? 'text-green-700' : 'text-red-700'}>€{totals.net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3"></th>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedTransactions.map((tx, index) => (
              <tr key={`${tx.dateOp}-${tx.label}-${tx.amount}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    title={isFlagged(tx) ? 'Unflag' : 'Flag'}
                    onClick={() => {
                      upsertAnnotationForTx(tx, { flagged: !isFlagged(tx) });
                      // Force rerender by updating draft state slightly
                      setNoteDraft(prev => ({ ...prev }));
                    }}
                    className={`text-lg ${isFlagged(tx) ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-500'}`}
                  >
                    ★
                  </button>
                </td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(() => {
                    const txKey = getAnnotationKeyForTx(tx);
                    const value = noteDraft[txKey] ?? getAnnotationForTx(tx)?.note ?? '';
                    return (
                      <input
                        type="text"
                        placeholder="Add note"
                        value={value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoteDraft(prev => ({ ...prev, [txKey]: val }));
                        }}
                        onBlur={(e) => {
                          upsertAnnotationForTx(tx, { note: e.target.value });
                        }}
                        className="w-56 px-2 py-1 border border-gray-300 rounded"
                      />
                    );
                  })()}
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
