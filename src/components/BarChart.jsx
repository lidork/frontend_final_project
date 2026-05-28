import { useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../db/db';
import { fetchRates } from '../utils/fetchRates';
import { CURRENCIES, MONTH_LABELS, YEARS } from '../utils/constants';
import './components.css';

function BarChart({ customRatesUrl }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [currency, setCurrency] = useState('USD');
  const [data, setData] = useState(null);

  async function handleGenerate() {
    setData(null);
    try {
      const rates = await fetchRates(customRatesUrl || undefined);
      const reports = MONTH_LABELS.map((_, i) => db.getReport(currency, year, i + 1, rates));
      setData(reports.map((r, i) => ({ month: MONTH_LABELS[i], total: r.total.sum })));
    } catch {
      toast.error('Failed to fetch exchange rates. Check your connection or settings.');
    }
  }

  return (
    <div>
      <h2 className="section-title">Monthly Totals</h2>

      {/* Controls: year selector and display currency — no month picker because the chart shows all 12 */}
      <div className="controls-row">
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

      {data && (
        // ResponsiveContainer stretches the chart to the panel width.
        <ResponsiveContainer width="100%" height={320}>
          <RechartsBar data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            {/* Axis tick styles reference CSS vars so they match the app theme */}
            <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-body)', fontSize: 13, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontFamily: 'var(--font-body)', fontSize: 13, fill: 'var(--text-muted)' }} />
            <Tooltip
              formatter={(v) => [`${v} ${currency}`, 'Total']}
              contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 13, border: '1px solid var(--border)', borderRadius: 6 }}
            />
            {/* radius applies rounded top corners; bottom corners stay square against the x-axis */}
            <Bar dataKey="total" fill="var(--accent)" radius={[3, 3, 0, 0]} />
          </RechartsBar>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BarChart;
