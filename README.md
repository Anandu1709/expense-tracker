# Expense Tracker

A personal expense tracking web app built with Flask + React + Vite.

## How to run

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                   # runs on http://localhost:3000
```

### Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Stack choices

| Layer | Choice | Why |
|---|---|---|
| Backend | Flask + SQLite | Minimal setup, stdlib DB, no extra process |
| CORS | flask-cors | One line to unblock React dev server |
| Frontend | React + Vite | Fast HMR, clean component model, no boilerplate |
| Charts | Recharts | React-native, no CDN hacks, works with live data |

## What's done

- Add, edit, delete expenses (title, amount, category, date, note)
- View all expenses sorted by date (most recent first)
- Filter by category, date range, and title (partial match)
- Monthly summary with total spend + category breakdown
- Pie chart visualisation with percentage breakdown
- Input validation on both frontend and backend
- Edge cases: empty states, confirm on delete, invalid date range warning, amount > 0 enforced at DB level

## What was skipped (and why)

- **Authentication** — not required per spec
- **Deployment** — demo runs locally, no infra needed
- **Test suite** — prioritised working features within 2hr limit
- **Pagination** — not needed at demo scale

## Known rough edges

- No optimistic UI updates — always re-fetches after mutation
- Pie chart colours are fixed, not user-themed
- No mobile responsive layout (works best on laptop)

## Project structure

```
expense-tracker/
  backend/
    app.py              # Flask API — all 6 routes
    expenses.db         # SQLite DB (auto-created)
    requirements.txt    # flask, flask-cors
  frontend/
    src/
      App.jsx           # Root state, layout
      api.js            # All fetch calls
      components/
        ExpenseForm.jsx # Add + edit form
        ExpenseList.jsx # Expense table
        FilterBar.jsx   # Filters
        Summary.jsx     # Monthly summary + pie chart
```
