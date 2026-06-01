import { useState } from 'react';
import toast from 'react-hot-toast';
import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../db/db';
import { fetchRates } from '../utils/fetchRates';
import { CURRENCIES, MONTHS, YEARS } from '../utils/constants';
import './components.css';

// Seven distinct palette colors — cycles via modulo when there are more than 7 categories.
const COLORS = ['#3b6fd4','#2fa87e','#d4803b','#a03bd4','#d43b5a','#3baed4','#8ea03b'];

function PieChart({ customRatesUrl }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [currency, setCurrency] = useState('USD');
  const [data, setData] = useState(null);

  async function handleGenerate() {
    setData(null);
    try {
      const rates = await fetchRates(customRatesUrl || undefined);
      const report = db.getReport(currency, year, month, rates);

      // Aggregate converted sums per category for the chart slices.
      // Re-applies the two-step USD normalization here (rather than relying on
      // report.total) because the pie needs per-category breakdowns, not a single total.
      const totals = {};
      report.costs.forEach((item) => {
        const inUSD = item.sum / (rates[item.currency] || 1);
        const converted = Math.round(inUSD * (rates[currency] || 1) * 100) / 100;
        totals[item.category] = (totals[item.category] || 0) + converted;
      });

      setData(Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })));
    } catch (e) {
      toast.error(e.message || 'Failed to fetch exchange rates. Check your connection or settings.');
    }
  }

  return (
    <div>
      <h2 className="section-title">Costs by Category</h2>

      {/* Filter controls: pick month, year, and the currency for the converted slice values */}
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

      {/* Empty state: data array is empty when the period has no costs */}
      {data && data.length === 0 && (
        <div className="empty-state">No costs recorded for {MONTHS[month - 1]} {year}.</div>
      )}

      {data && data.length > 0 && (
        // ResponsiveContainer makes the chart fluid-width inside the panel.
        <ResponsiveContainer width="100%" height={340}>
          <RechartsPie>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}
              label={({ name, value }) => `${name}: ${value} ${currency}`}>
              {/* Assign a palette color to each slice, cycling if there are more than 7 categories */}
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${v} ${currency}`} />
            <Legend />
          </RechartsPie>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default PieChart;
