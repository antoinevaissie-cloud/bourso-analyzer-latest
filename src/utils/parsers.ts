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
export const parseDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

// Generate unique key for deduplication
export const generateTxKey = (dateOp: string, label: string, amount: number, accountNum: string): string => {
  return `${dateOp}-${label}-${amount}-${accountNum}`;
};