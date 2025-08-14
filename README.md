# Boursorama Finance Analyzer

A local web application for analyzing Boursorama CSV bank statements with interactive charts and filtering capabilities.

## Features

- 📊 **Interactive Charts**: Bar charts showing expenses and income by category
- 🔍 **Advanced Filtering**: Date range, account selection, text search, and category filtering
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🇫🇷 **French Locale Support**: Handles French number formats ("5 926,24" → 5926.24)
- 🚀 **Instant Preview**: Sample data loads immediately for demo purposes
- 📈 **Real-time Totals**: See expenses, income, and net balance as you filter
- 🔄 **Deduplication**: Automatically removes duplicate transactions

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use)

## Usage

### Sample Data
The app loads with sample Boursorama transaction data so you can immediately explore the features.

### CSV Upload
1. Click "Choose CSV File" to upload your Boursorama CSV export
2. The file should have these columns: `dateOp`, `dateVal`, `label`, `category`, `categoryParent`, `supplierFound`, `amount`, `comment`, `accountNum`, `accountLabel`, `accountbalance`
3. French locale amounts (e.g., "5 926,24", "-41,80") are automatically parsed

### Interactive Features
- **Chart Interaction**: Click any bar in the charts to filter transactions by that category
- **Date Filtering**: Set date range with the date pickers
- **Account Selection**: Toggle account labels on/off
- **Text Search**: Search transaction labels
- **Sorting**: Click table headers to sort by any column
- **Clear Filters**: Reset all filters with the "Clear all" button

### Data Requirements
- CSV must contain the required columns listed above
- Amounts should be in French format with comma decimals
- Dates can be in various formats (ISO, etc.)
- `accountNum` is automatically converted to string
- Duplicates based on (dateOp, label, amount, accountNum) are automatically removed

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Chart.js**: Interactive charts
- **PapaParse**: CSV parsing

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/upload-csv/  # CSV upload API endpoint
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/          # React components
│   ├── Charts.tsx       # Chart components
│   ├── CsvUploader.tsx  # File upload
│   ├── FilterControls.tsx # Filter UI
│   └── TransactionTable.tsx # Data table
├── data/
│   └── sampleData.ts    # Sample transactions
├── types/
│   └── transaction.ts   # TypeScript types
└── utils/
    └── parsers.ts       # Parsing utilities
```

## License

MIT