'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Tx } from '@/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartsProps {
  transactions: Tx[];
  onCategoryClick: (categoryParent: string) => void;
}

export default function Charts({ transactions, onCategoryClick }: ChartsProps) {
  const { expenseData, incomeData } = useMemo(() => {
    const expensesByCategory = new Map<string, number>();
    const incomesByCategory = new Map<string, number>();

    transactions.forEach(tx => {
      if (tx.amount < 0) {
        const current = expensesByCategory.get(tx.categoryParent) || 0;
        expensesByCategory.set(tx.categoryParent, current + Math.abs(tx.amount));
      } else {
        const current = incomesByCategory.get(tx.categoryParent) || 0;
        incomesByCategory.set(tx.categoryParent, current + tx.amount);
      }
    });

    const expenseEntries = Array.from(expensesByCategory.entries())
      .sort((a, b) => b[1] - a[1]);
    const incomeEntries = Array.from(incomesByCategory.entries())
      .sort((a, b) => b[1] - a[1]);

    return {
      expenseData: {
        labels: expenseEntries.map(([category]) => category),
        datasets: [{
          label: 'Expenses (€)',
          data: expenseEntries.map(([, amount]) => amount),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        }],
      },
      incomeData: {
        labels: incomeEntries.map(([category]) => category),
        datasets: [{
          label: 'Income (€)',
          data: incomeEntries.map(([, amount]) => amount),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        }],
      },
    };
  }, [transactions]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + value.toLocaleString('fr-FR');
          },
        },
      },
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const isExpenseChart = elements[0].datasetIndex === 0;
        const category = isExpenseChart
          ? expenseData.labels[elementIndex]
          : incomeData.labels[elementIndex];
        onCategoryClick(category);
      }
    },
  };

  return (
    <div className="space-y-8">
      {/* Top Categories Callouts */}
      {(expenseData.labels.length > 0 || incomeData.labels.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {expenseData.labels.length > 0 && (
            <button
              className="px-3 py-1 rounded-full text-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              onClick={() => onCategoryClick(expenseData.labels[0])}
            >
              Top Outflow: {expenseData.labels[0]} (€{(expenseData.datasets[0] as any).data[0].toLocaleString('fr-FR')})
            </button>
          )}
          {incomeData.labels.length > 0 && (
            <button
              className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
              onClick={() => onCategoryClick(incomeData.labels[0])}
            >
              Top Inflow: {incomeData.labels[0]} (€{(incomeData.datasets[0] as any).data[0].toLocaleString('fr-FR')})
            </button>
          )}
        </div>
      )}
      {expenseData.labels.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-red-600">
            Expenses by Category
          </h3>
          <div style={{ height: '400px' }}>
            <Bar data={expenseData} options={chartOptions} />
          </div>
        </div>
      )}

      {incomeData.labels.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-green-600">
            Income by Category
          </h3>
          <div style={{ height: '400px' }}>
            <Bar data={incomeData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
        💡 <strong>Tip:</strong> Click on any bar to filter the drilldown table by that category
      </div>
    </div>
  );
}
