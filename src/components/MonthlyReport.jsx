import { useState } from 'react';
import toast from 'react-hot-toast';
import { db } from '../db/db';
import { fetchRates } from '../utils/fetchRates';
import { CURRENCIES, MONTHS, YEARS } from '../utils/constants';
import './components.css';

function MonthlyReport({ customRatesUrl }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [currency, setCurrency] = useState('USD');
  const [report, setReport] = useState(null);

  async function handleGenerate() {
    setReport(null);
    try {
      const rates = await fetchRates(customRatesUrl || undefined);
      setReport(db.getReport(currency, year, month, rates));
    } catch (e) {
      toast.error(e.message || 'Failed to fetch exchange rates. Check your connection or settings.');
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
            </tr>
          </thead>
          <tbody>
            {report.costs.map((item, i) => (
              <tr key={i}>
                <td>{item.date.day}</td>
                <td>{item.category}</td>
                <td>{item.description}</td>
                <td>{item.sum} {item.currency}</td>
              </tr>
            ))}
            {/* Total row spans description columns; converted sum uses the selected currency */}
            <tr>
              <td colSpan={3}>Total</td>
              <td>{report.total.sum} {report.total.currency}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MonthlyReport;
