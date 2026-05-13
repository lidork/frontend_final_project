import { useState } from 'react';
import { openCostsDB } from '../db/db';
import { fetchRates } from '../utils/fetchRates';
import './components.css';

const db = openCostsDB('costsdb', 1);

// Admin/testing panel — not part of the submitted product.
// Provides shortcuts for seeding data, inspecting localStorage, and verifying
// core db.js behaviour without opening DevTools.
function AdminPanel({ customRatesUrl }) {
  const [log, setLog] = useState([]);
  const [rawData, setRawData] = useState(null);

  function append(msg, type = 'info') {
    setLog((prev) => [...prev, { msg, type, ts: new Date().toLocaleTimeString() }]);
  }

  // ── Seed ──────────────────────────────────────────────────────────────────
  function seedData() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const samples = [
      { sum: 120, currency: 'GBP', category: 'Education', description: 'Zoom License' },
      { sum: 200, currency: 'USD', category: 'Food', description: 'Supermarket' },
      { sum: 500, currency: 'ILS', category: 'Housing', description: 'Electricity bill' },
      { sum: 45,  currency: 'EURO', category: 'Entertainment', description: 'Netflix' },
      { sum: 80,  currency: 'USD', category: 'Transport', description: 'Fuel' },
    ];

    samples.forEach((item) => db.addCost(item));
    append(`Seeded ${samples.length} cost items for ${month}/${year}`, 'success');
  }

  // ── Inspect localStorage ──────────────────────────────────────────────────
  function inspectStorage() {
    // Key format mirrors the one derived by openCostsDB('costsdb', 1).
    const key = 'costsdb_costsdb_v1';
    const raw = localStorage.getItem(key);
    if (!raw) {
      setRawData(null);
      append('localStorage key not found — no items saved yet.', 'error');
      return;
    }
    const parsed = JSON.parse(raw);
    setRawData(parsed);
    append(`Found ${parsed.length} item(s) in localStorage.`, 'info');
  }

  // ── Clear localStorage ────────────────────────────────────────────────────
  function clearStorage() {
    localStorage.removeItem('costsdb_costsdb_v1');
    setRawData(null);
    append('localStorage cleared.', 'info');
  }

  // ── Test getReport ────────────────────────────────────────────────────────
  async function testGetReport() {
    const now = new Date();
    try {
      const rates = await fetchRates(customRatesUrl || undefined);
      append(`Rates fetched: ${JSON.stringify(rates)}`, 'success');
      const report = await db.getReport('USD', now.getFullYear(), now.getMonth() + 1, rates);
      append(`getReport → ${report.costs.length} cost(s), total: ${report.total.sum} USD`, 'success');
    } catch (err) {
      append(`getReport failed: ${err.message}`, 'error');
    }
  }

  // ── Test addCost return value ─────────────────────────────────────────────
  function testAddCost() {
    const item = db.addCost({ sum: 99, currency: 'USD', category: 'Test', description: 'addCost smoke test' });
    if (item && item.sum === 99 && item.date && item.date.day) {
      append(`addCost returned: ${JSON.stringify(item)}`, 'success');
    } else {
      append(`addCost returned unexpected value: ${JSON.stringify(item)}`, 'error');
    }
  }

  // ── Test openCostsDB ─────────────────────────────────────────────────────
  function testOpenDB() {
    const testDb = openCostsDB('costsdb', 1);
    if (testDb && typeof testDb.addCost === 'function' && typeof testDb.getReport === 'function') {
      append('openCostsDB returned valid db object with addCost and getReport.', 'success');
    } else {
      append('openCostsDB returned unexpected value.', 'error');
    }
  }

  return (
    <div>
      <h2 className="section-title">Admin / Testing</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>
        Testing utilities — not part of the final submission.
      </p>

      {/* Action buttons — each maps to one test or utility function */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <button className="btn-primary" style={{ marginTop: 0 }} onClick={seedData}>Seed sample data</button>
        <button className="btn-primary" style={{ marginTop: 0 }} onClick={testAddCost}>Test addCost</button>
        <button className="btn-primary" style={{ marginTop: 0 }} onClick={testOpenDB}>Test openCostsDB</button>
        <button className="btn-primary" style={{ marginTop: 0 }} onClick={testGetReport}>Test getReport</button>
        <button className="btn-primary" style={{ marginTop: 0 }} onClick={inspectStorage}>Inspect localStorage</button>
        <button
          className="btn-primary"
          style={{ marginTop: 0, background: 'var(--error-bg)', color: 'var(--error-text)' }}
          onClick={clearStorage}
        >
          Clear localStorage
        </button>
      </div>

      {/* Output log */}
      {log.length > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>Output</p>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 'var(--space-3)', fontFamily: 'ui-monospace, monospace', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', maxHeight: 240, overflowY: 'auto' }}>
            {log.map((entry, i) => (
              // Color-code each log line by severity: success=green, error=red, info=default
              <div key={i} style={{ color: entry.type === 'success' ? 'var(--success-text)' : entry.type === 'error' ? 'var(--error-text)' : 'var(--text)' }}>
                <span style={{ color: 'var(--text-muted)' }}>[{entry.ts}]</span> {entry.msg}
              </div>
            ))}
          </div>
          <button
            style={{ marginTop: 'var(--space-2)', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setLog([])}
          >
            Clear log
          </button>
        </div>
      )}

      {/* Raw localStorage dump */}
      {rawData && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>localStorage dump ({rawData.length} items)</p>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 'var(--space-3)', fontFamily: 'ui-monospace, monospace', fontSize: 12, maxHeight: 320, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--text)' }}>
            {JSON.stringify(rawData, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
