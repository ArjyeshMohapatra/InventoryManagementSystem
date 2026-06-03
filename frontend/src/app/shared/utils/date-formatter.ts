/**
 * Formats a date string, object, or timestamp into: "DD Wed Jun YYYY"
 * Example output: "03 Wed Jun 2026"
 */
export function formatTransactionDate(dateInput: string | Date | number, type: string): string {
  const date = new Date(dateInput);
  
  // Guard against invalid dates
  if (isNaN(date.getTime())) {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    weekday: 'short',
    month: 'short',
    year: 'numeric'
  });

  const parts = formatter.formatToParts(date);
  
  const day = parts.find(p => p.type === 'day')?.value || '';
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const monthNumber = String(date.getMonth() + 1).padStart(2, '0');
  const year = parts.find(p => p.type === 'year')?.value || '';
  
  if (type === 'long') return `${weekday} ${day} ${month} ${year}`;
  else return `${day}/${monthNumber}/${year}`
}