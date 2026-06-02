# Platform Ledger & Analytics Suite

A premium, high-performance personal finance management engine and activity ledger built with **Flask**, **React**, and **Vite**.

Designed with a high-contrast minimalist interface featuring a **Matte Black (`#09090b`)** design system and **Emerald Green (`#10b981`)** success highlights.

---

## 🚀 Key Visual & Feature Upgrades

* **Matte Black & Emerald Design System**: Refined UI featuring glassmorphism, responsive container borders, and high-fidelity typography.
* **Interactive Analytics Suite (Bar & Pie Charts)**:
  - **Dynamic Spending Trends**: Integrates a responsive Recharts bar graph.
  - **Granular Toggles**: Instantly switch trends between **Day** (daily transaction flow), **Week** (relative billing periods), and **Month** (6-month historical overview).
  - **Narrative Intelligence**: Generates automated narrative sentences summarizing outliers, average tickets, and top outflow categories.
* **Period Comparison Engine**:
  - Compare transaction balances across any two selected calendar periods.
  - Features a side-by-side **Category Outflow Variance Bar Chart** color-coded with Emerald Green (selected period) and Zinc Gray (comparative period).

---

## 🛠️ Technology Stack Choices

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Backend API** | Flask + SQLite | Ultra-lightweight, zero-config relational SQL database. |
| **Cross-Origin** | Flask-CORS | Securely connects the local React dev server. |
| **Frontend UI** | React + Vite | Fast Hot Module Replacement (HMR) and modular architecture. |
| **Visualization**| Recharts | Highly performant, declarative SVG-based chart library. |

---

## 🗄️ System Architecture & Directories

```text
expense-tracker/
├── backend/
│   ├── app.py              # Single-file Flask API service (8 routes)
│   ├── expenses.db         # SQLite instance
│   └── requirements.txt    # Flask backend dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx           # Activity Dashboard layout, view routing, & state coordination
    │   ├── api.js            # Standard Fetch utility wrappers
    │   ├── index.css         # Custom utility tokens & design system styles
    │   └── components/
    │       ├── ExpenseForm.jsx   # Dynamic transaction logger (Post/Edit actions)
    │       ├── ExpenseList.jsx   # Transaction history tabular ledger
    │       ├── FilterBar.jsx     # Parametric query selectors
    │       ├── Summary.jsx       # Period spent summary + Pie Chart distribution
    │       ├── Insights.jsx      # Analytics Suite, Bar Chart & smart summaries
    │       └── MonthCompare.jsx  # Period Comparison & category variance charts
```

---

## 🏁 Quickstart Setup Guide

### 1. Launch the Backend API
```bash
cd backend
python -m venv venv
# Windows shell activation:
# venv\Scripts\activate
# Unix/macOS shell activation:
# source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*API engine starts automatically at `http://localhost:3000`.*

### 2. Launch the Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
*Vite web application loads at `http://localhost:5173`.*

---

## 🔌 API Route Schema Reference

* `GET /expenses` — Lists transactions. Filters: `category`, `from`, `to`, `search`.
* `POST /expenses` — Posts a new transaction. Requires: `title`, `amount`, `category`, `date`.
* `PUT /expenses/<id>` — Updates a transaction record.
* `DELETE /expenses/<id>` — Permanently deletes a transaction.
* `GET /summary` — Aggregates period outflow and category distribution.
* `GET /insights` — Generates transaction counts, peaks, daily/weekly/monthly spending arrays.
* `GET /compare` — Aggregates two comparative periods for variance calculations.
