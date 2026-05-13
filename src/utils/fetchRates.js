// fetchRates.js - Fetches currency exchange rates from a JSON endpoint.
// All rates are relative to 1 USD: {USD:1, GBP:0.6, EURO:0.7, ILS:3.4}

// Default rates URL — served from the same deployment as the app.
const DEFAULT_RATES_URL = '/rates.json';

// Fetches exchange rates from the given URL, falling back to the default.
// url - Optional custom URL. Uses the default if omitted.
// Returns a rates object e.g. {USD:1, GBP:0.6, EURO:0.7, ILS:3.4}.
async function fetchRates(url) {
  // Fall back to the default URL when no custom URL is provided, satisfying the
  // requirement that the app works without user configuration of a rates endpoint.
  const endpoint = url || DEFAULT_RATES_URL;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch rates from ${endpoint}: ${response.status}`);
  }
  return response.json();
}

export { fetchRates, DEFAULT_RATES_URL };
