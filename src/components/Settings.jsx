import { useState } from 'react';
import toast from 'react-hot-toast';
import './components.css';

function Settings({ customRatesUrl, onSave }) {
  const [url, setUrl] = useState(customRatesUrl);
  function handleSave(e) {
    e.preventDefault();
    const trimmed = url.trim();

    // If a URL is provided it must look like a valid http(s) URL
    if (trimmed && !/^https?:\/\/.+/.test(trimmed)) {
      toast.error('URL must start with http:// or https://');
      return;
    }

    onSave(trimmed);
    toast.success('Settings saved.');
  }

  function handleChange(e) {
    setUrl(e.target.value);
  }

  return (
    <div>
      <h2 className="section-title">Settings</h2>

      {/* Max-width container keeps the form from stretching too wide on large screens */}
      <form onSubmit={handleSave} style={{ maxWidth: 520 }}>
        <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label" htmlFor="rates-url">
            Custom exchange rates URL
          </label>
          <input
            id="rates-url"
            className="form-input"
            type="text"
            placeholder="https://example.com/rates.json"
            value={url}
            onChange={handleChange}
          />
          {/* Helper text describes the expected JSON shape for the rates endpoint */}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
            Leave empty to use the default rates. The URL must return JSON in the format{' '}
            <code style={{ fontSize: 12 }}>{"{"}"USD":1, "GBP":0.6, "EURO":0.7, "ILS":3.4{"}"}</code>.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" className="btn-primary" style={{ marginTop: 0 }}>Save</button>
          {/* Reset button only appears when there is a custom URL to clear */}
          {url && (
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: 0, background: 'var(--border)', color: 'var(--text)' }}
              onClick={() => { setUrl(''); onSave(''); toast.success('Reset to default rates.'); }}
            >
              Reset to default
            </button>
          )}
        </div>
      </form>

      {/* Read-only status strip shows the currently active rates source */}
      <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text)' }}>Active rates source</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
          {customRatesUrl || '/rates.json (default)'}
        </p>
      </div>
    </div>
  );
}

export default Settings;
