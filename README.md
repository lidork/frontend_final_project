# Cost Manager

A front-end expense tracking application built with React and MUI.

## Team

| Name | Role |
|---|---|
| Lidor Kalfon | Team Manager |
| Dana Mund | Member |
| Shaked Avdar| Member | 

## Goal

Allow users to log personal expenses, view monthly breakdowns, and visualise spending patterns — all in the browser with no backend required. Data is stored in localStorage and exchange rates are fetched from a configurable JSON endpoint.

## Features

- **Add Cost** — log an expense with sum, currency (USD / ILS / GBP / EURO), category, description, and an optional custom date
- **Monthly Report** — tabular breakdown of all costs for a selected month and year, with totals converted to any supported currency
- **Pie Chart** — spending by category for a selected month, in the currency of your choice
- **Bar Chart** — total spending across all 12 months of a selected year
- **Settings** — override the default exchange rates endpoint with any custom URL
- **Live currency conversion** — rates fetched via the Fetch API; falls back to bundled `/rates.json` if no custom URL is set

## Stack

- React 19 + Vite
- MUI (Material UI) for table and layout primitives
- Recharts for pie and bar charts
- react-hot-toast for non-intrusive notifications
- localStorage as the data store

## Running locally

```bash
npm install
npm run dev
```

## Building for production

```bash
npm run build   # outputs to dist/
```
