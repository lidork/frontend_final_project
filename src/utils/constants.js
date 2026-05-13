// Shared constants used across multiple components.
// Centralised here so adding a currency or month name only requires one change.

const CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Short labels used by BarChart (one per month, 12-bar view).
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Last 10 years, newest first — used by month/year selectors.
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export { CURRENCIES, MONTHS, MONTH_LABELS, YEARS };
