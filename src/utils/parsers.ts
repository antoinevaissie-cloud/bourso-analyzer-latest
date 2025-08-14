// "5 926,24" -> 5926.24 ; "-41,80" -> -41.80 ; "1.234,56" -> 1234.56
export const parseFrAmount = (s: string): number => {
  if (!s || typeof s !== 'string') return 0;

  // Remove spaces first
  let cleaned = s.trim().replace(/\s/g, '');

  // Handle French format: if there's a comma, it's the decimal separator
  // Dots before the comma are thousands separators
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts.length === 2) {
      // Remove dots from the integer part (thousands separators)
      const integerPart = parts[0].replace(/\./g, '');
      const decimalPart = parts[1];
      cleaned = integerPart + '.' + decimalPart;
    }
  } else {
    // If no comma, dots might be thousands separators (no decimals)
    // Only remove dots if they're not the last 3 digits (decimal point)
    const lastDotIndex = cleaned.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      const afterLastDot = cleaned.substring(lastDotIndex + 1);
      if (afterLastDot.length === 3 && !afterLastDot.includes('.')) {
        // Probably thousands separator, remove all dots
        cleaned = cleaned.replace(/\./g, '');
      }
      // Otherwise assume it's a decimal point and leave it
    }
  }

  const result = Number(cleaned);
  return isNaN(result) ? 0 : result;
};

// Parse date from various formats to YYYY-MM-DD
import { parse as parseWithPattern, parseISO, isValid, format } from 'date-fns';

// Parse date from various formats to YYYY-MM-DD
export const parseDate = (dateStr: string): string => {
  if (!dateStr) return '';
  // Try ISO first
  let date = parseISO(dateStr);
  if (!isValid(date)) {
    // Common European formats
    const patterns = ['dd/MM/yyyy', 'dd/MM/yy', 'd/M/yyyy', 'd/M/yy', 'yyyy-MM-dd'];
    for (const pattern of patterns) {
      const candidate = parseWithPattern(dateStr, pattern, new Date());
      if (isValid(candidate)) {
        date = candidate;
        break;
      }
    }
  }
  if (!isValid(date)) {
    // Fallback to Date constructor as last resort
    const fallback = new Date(dateStr);
    if (!isValid(fallback)) return '';
    date = fallback;
  }
  return format(date, 'yyyy-MM-dd');
};

// Generate unique key for deduplication
export const generateTxKey = (dateOp: string, label: string, amount: number, accountNum: string): string => {
  return `${dateOp}-${label}-${amount}-${accountNum}`;
};
