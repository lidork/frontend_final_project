import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import AddCost from './components/AddCost';
import MonthlyReport from './components/MonthlyReport';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';

const TABS = ['Add Cost', 'Monthly Report', 'Pie Chart', 'Bar Chart', 'Settings', 'Admin'];

function App() {
  const [tab, setTab] = useState(0);
  // customRatesUrl is empty string by default, meaning components use /rates.json.
  const [customRatesUrl, setCustomRatesUrl] = useState('');

  return (
    <div className="app-shell">
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2500,
          className: 'toast-jump',
          style: {
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            fontWeight: 500,
            padding: '14px 22px',
            borderRadius: 10,
            boxShadow: '0 8px 24px oklch(0% 0 0 / 0.14)',
          },
        }}
      />
      <header className="app-header">
        <h1>Cost Manager</h1>
        <p>Track and report your monthly expenses</p>
      </header>

      <nav className="app-tabs">
        {TABS.map((label, i) => (
          <button
            key={label}
            className={`app-tab${tab === i ? " active" : ""}`}
            onClick={() => setTab(i)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="app-panel">
        {/* key=tab causes React to remount the content on every tab switch,
            re-triggering the panel-in CSS animation each time. */}
        <div key={tab} className="panel-content">
          {tab === 0 && <AddCost />}
          {tab === 1 && <MonthlyReport customRatesUrl={customRatesUrl} />}
          {tab === 2 && <PieChart customRatesUrl={customRatesUrl} />}
          {tab === 3 && <BarChart customRatesUrl={customRatesUrl} />}
          {tab === 4 && <Settings customRatesUrl={customRatesUrl} onSave={setCustomRatesUrl} />}
          {tab === 5 && <AdminPanel customRatesUrl={customRatesUrl} />}
        </div>
      </div>
    </div>
  );
}

export default App;
