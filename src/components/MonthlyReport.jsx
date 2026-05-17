import { useState } from 'react';
import toast from 'react-hot-toast';
import { openCostsDB } from '../db/db';
import { fetchRates } from '../utils/fetchRates';
import { CURRENCIES, MONTHS, YEARS } from '../utils/constants';
import './components.css';

// Module-scope singleton: openCostsDB only derives a localStorage key and holds
// no connection, so one instance shared across all renders is safe and efficient.
const db = openCostsDB('costsdb', 1);

function MonthlyReport({ customRatesUrl }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [currency, setCurrency] = useState('USD');
  const [report, setReport] = useState(null);

  async function handleGenerate() {
    setReport(null);
    try {
      // Fetch rates first; customRatesUrl comes from Settings (may be empty string → use default).
      const rates = await fetchRates(customRatesUrl || undefined);
      const result = await db.getReport(currency, year, month, rates);
      setReport(result);
    } catch {
      toast.error('Failed to fetch exchange rates. Check your connection or settings.');
    }
  }

  async function handleDelete(globalIndex) {
    try {
      db.removeCostAtIndex(globalIndex);
      // Refresh the report in place so the deleted row disappears immediately.
      const rates = await fetchRates(customRatesUrl || undefined);
      const result = await db.getReport(currency, year, month, rates);
      setReport(result);
      toast.success('Item deleted.');
    } catch {
      toast.error('Failed to delete item.');
    }
  }

  return (
    <div>
      <h2 className="section-title">Monthly Report</h2>

      {/* Filter controls: month, year, and display currency */}
      <div className="controls-row">
        <div className="control-field">
          <label className="control-label">Month</label>
          <select className="control-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="control-field">
          <label className="control-label">Year</label>
          <select className="control-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="control-field">
          <label className="control-label">Currency</label>
          <select className="control-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn-primary" style={{ marginTop: 0 }} onClick={handleGenerate}>Generate</button>
      </div>

      {/* Empty state: report generated but no costs exist for the selected period */}
      {report && report.costs.length === 0 && (
        <div className="empty-state">No costs recorded for {MONTHS[month - 1]} {year}.</div>
      )}

      {report && report.costs.length > 0 && (
        <table className="report-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Category</th>
              <th>Description</th>
              {/* "Original" column shows the amount in the currency it was entered, not converted */}
              <th>Original</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {report.costs.map((item, i) => (
              <tr key={i}>
                <td>{item.date.day}</td>
                <td>{item.category}</td>
                <td>{item.description}</td>
                <td>{item.sum} {item.currency}</td>
                <td>
                  <button className="btn-delete" onClick={() => handleDelete(item._index)}>✕</button>
                </td>
              </tr>
            ))}
            {/* Total row spans all data columns; converted sum uses the selected currency */}
            <tr>
              <td colSpan={4}>Total</td>
              <td>{report.total.sum} {report.total.currency}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MonthlyReport;
