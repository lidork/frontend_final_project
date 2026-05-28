// db.js - Cost Manager database library (ES module version for React)
// Wraps localStorage to store and retrieve cost items.
// This file is currently unused and serves as an example of implementing localstorage.
// This project's requirements demanded the db to be global as in the new db.js.

const DB_KEY_PREFIX = 'costsdb_';

// Opens (or creates) a named costs database backed by localStorage.
// databaseName - Logical name for the database.
// databaseVersion - Version number (reserved for future migrations).
// Returns an object with addCost and getReport methods.
function openCostsDB(databaseName, databaseVersion) {
  const storageKey = `${DB_KEY_PREFIX}${databaseName}_v${databaseVersion}`;

  // Reads all cost items from localStorage; returns an empty array when none exist.
  function readAll() {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  // Persists the full items array back to localStorage.
  function writeAll(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  // Adds a new cost item to the database.
  // cost must include: sum (number), currency (string), category (string), description (string).
  // Returns the saved cost item including its date.
  function addCost(cost) {
    const items = readAll();
    const now = new Date();
    // Use a caller-supplied date if provided, otherwise default to today.
    const newItem = {
      sum: cost.sum,
      currency: cost.currency,
      category: cost.category,
      description: cost.description,
      date: cost.date ?? {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    };
    items.push(newItem);
    writeAll(items);
    return newItem;
  }

  // Returns a Promise that resolves to a monthly report.
  // Costs are returned in their original currency; conversion happens at the call site.
  // currency - Target currency for the total (e.g. 'USD').
  // year - Defaults to current year. month - Defaults to current month (1-based).
  // rates - Exchange rates object e.g. {USD:1, GBP:0.6, EURO:0.7, ILS:3.4}.
  async function getReport(currency, year, month, rates) {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth() + 1;

    const allItems = readAll();
    // Attach the global array index so callers can delete specific items by position.
    const filtered = allItems
      .map((item, i) => ({ ...item, _index: i }))
      .filter((item) => item.date.year === targetYear && item.date.month === targetMonth);

    // Convert each item's sum to the target currency using provided rates.
    // If no rates are provided, totals are calculated without conversion (assumes 1:1).
    let totalSum = 0;
    if (rates) {
      filtered.forEach((item) => {
        // Two-step normalization: all rates are relative to 1 USD, so dividing by the
        // item's currency rate gives the equivalent in USD, then multiplying by the
        // target currency rate converts from USD to the requested currency.
        // e.g. 120 GBP → 120/0.6 = 200 USD → 200*1 = 200 USD
        // e.g. 120 GBP → 120/0.6 = 200 USD → 200*3.4 = 680 ILS
        const inUSD = item.sum / (rates[item.currency] ?? 1);
        totalSum += inUSD * (rates[currency] ?? 1);
      });
    } else {
      filtered.forEach((item) => {
        totalSum += item.sum;
      });
    }

    return {
      year: targetYear,
      month: targetMonth,
      costs: filtered,
      total: {
        currency,
        // Multiply by 100, round to integer, divide by 100 — avoids floating-point
        // artifacts like 200.00000000000003 that arise from IEEE 754 arithmetic.
        sum: Math.round(totalSum * 100) / 100,
      },
    };
  }

  // Removes the cost item at the given global index in the stored array.
  // index - the position returned alongside each item by getReport.
  function removeCostAtIndex(index) {
    const items = readAll();
    items.splice(index, 1);
    writeAll(items);
  }

  return { addCost, getReport, removeCostAtIndex };
}

export { openCostsDB };
