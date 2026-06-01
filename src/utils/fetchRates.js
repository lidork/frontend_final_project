// fetchRates.js - Fetches currency exchange rates from a JSON endpoint.
// All rates are relative to 1 USD: {USD:1, GBP:0.6, EURO:0.7, ILS:3.4}

// Default rates URL — served from the same deployment as the app.
const DEFAULT_RATES_URL = '/rates.json';

// Fetches exchange rates from the given URL, falling back to the default.
// url - Optional custom URL. Uses the default if omitted.
// Returns a rates object e.g. {USD:1, GBP:0.6, EURO:0.7, ILS:3.4}.
const REQUIRED_CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

async function fetchRates(url) {
  // Fall back to the default URL when no custom URL is provided, satisfying the
  // requirement that the app works without user configuration of a rates endpoint.
  const endpoint = url || DEFAULT_RATES_URL;

  // Abort the request after 8 seconds so the UI doesn't hang on an unreachable server.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let response;
  try {
    response = await fetch(endpoint, { signal: controller.signal });
  } catch (e) {
    // AbortError means the timeout fired; any other error means network failure.
    throw new Error(e.name === 'AbortError' ? 'Request timed out. Check your connection or URL.' : 'Network error. Could not reach the rates server.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch rates from ${endpoint}: ${response.status}`);
  }

  // Guard against non-JSON responses (e.g. an HTML error page from a misconfigured server).
  let rates;
  try {
    rates = await response.json();
  } catch {
    throw new Error(`Rates endpoint did not return valid JSON.`);
  }

  // Guard against valid JSON that is not a plain object (e.g. null, array, string).
  if (typeof rates !== 'object' || rates === null || Array.isArray(rates)) {
    throw new Error('Rates response must be a JSON object.');
  }

  // Guard against a JSON response that is missing expected currency keys — silently
  // falling back to 1:1 would produce wrong totals with no visible warning.
  const missing = REQUIRED_CURRENCIES.filter((c) => typeof rates[c] !== 'number');
  if (missing.length > 0) {
    throw new Error(`Rates response is missing currencies: ${missing.join(', ')}.`);
  }

  // Guard against zero or negative rates — zero causes division by Infinity,
  // negative values produce inverted totals, both silently corrupt results.
  const invalid = REQUIRED_CURRENCIES.filter((c) => rates[c] <= 0);
  if (invalid.length > 0) {
    throw new Error(`Rates response has invalid values for: ${invalid.join(', ')}.`);
  }

  return rates;
}

export { fetchRates, DEFAULT_RATES_URL };
