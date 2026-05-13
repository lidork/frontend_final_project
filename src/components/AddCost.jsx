import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { openCostsDB } from '../db/db';
import { CURRENCIES } from '../utils/constants';
import './components.css';

const CATEGORIES = ['Food', 'Education', 'Health', 'Transport', 'Housing', 'Entertainment', 'Other'];

// Module-scope singleton: openCostsDB only derives a localStorage key and holds
// no connection, so one instance shared across all renders is safe and efficient.
const db = openCostsDB('costsdb', 1);

// Returns today's date as a YYYY-MM-DD string for the date input value and max.
function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function AddCost() {
  const [form, setForm] = useState({ sum: '', currency: 'USD', category: 'Food', description: '' });
  // saved drives the button flash; auto-resets after 1.4 s.
  const [saved, setSaved] = useState(false);
  // showDate controls visibility of the optional date picker.
  const [showDate, setShowDate] = useState(false);
  // closingDate is true during the exit animation; element stays mounted until it finishes.
  const [closingDate, setClosingDate] = useState(false);
  const [date, setDate] = useState(todayString());

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1400);
    return () => clearTimeout(t);
  }, [saved]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleToggleDate() {
    if (showDate) {
      // Start exit animation; remove from DOM after it completes.
      setClosingDate(true);
      setTimeout(() => {
        setShowDate(false);
        setClosingDate(false);
        setDate(todayString());
      }, 200);
    } else {
      setShowDate(true);
    }
  }

  function handleDateChange(e) {
    const val = e.target.value;
    // Reject future dates — the max attr prevents most cases but this guards programmatic input.
    if (val > todayString()) {
      toast.error('Date cannot be in the future.');
      return;
    }
    setDate(val);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const sum = parseFloat(form.sum);
    // Validate that sum is a real positive number before saving.
    if (!form.sum || isNaN(sum) || sum <= 0) {
      toast.error('Sum must be a positive number.');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required.');
      return;
    }
    // Parse the chosen date into day/month/year for the db item shape.
    const [year, month, day] = date.split('-').map(Number);
    db.addCost({
      sum,
      currency: form.currency,
      category: form.category,
      description: form.description.trim(),
      date: { day, month, year },
    });
    // Reset form to defaults after a successful save.
    setForm({ sum: '', currency: 'USD', category: 'Food', description: '' });
    setDate(todayString());
    setShowDate(false);
    setSaved(true);
    toast.success('Cost item saved.');
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="section-title">Add Cost Item</h2>

      {/* Two-column grid: sum+currency on one row, category+description on the next */}
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label" htmlFor="sum">Sum</label>
          <input
            id="sum"
            className="form-input"
            name="sum"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={form.sum}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="currency">Currency</label>
          {/* CURRENCIES constant drives the options; adding a currency here auto-populates the list */}
          <select id="currency" className="form-select" name="currency" value={form.currency} onChange={handleChange}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="category">Category</label>
          <select id="category" className="form-select" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="description">Description</label>
          <input
            id="description"
            className="form-input"
            name="description"
            type="text"
            placeholder="e.g. Groceries"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* Optional date field — spans both columns, animates in when revealed */}
        {(showDate || closingDate) && (
          <div className={`form-field form-field-full ${closingDate ? 'date-field-closing' : 'date-field-animated'}`}>
            <label className="form-label" htmlFor="date">Date</label>
            <input
              id="date"
              className="form-input"
              type="date"
              value={date}
              max={todayString()}
              onChange={handleDateChange}
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className={`btn-primary${saved ? ' btn-saved' : ''}`}>
          {saved ? '✓ Saved' : 'Add'}
        </button>
        {/* Toggle button shows the date picker; label reflects current state */}
        <button type="button" className="btn-date-toggle" onClick={handleToggleDate}>
          {showDate ? `📅 ${date}` : 'Pick date'}
        </button>
      </div>
    </form>
  );
}

export default AddCost;
