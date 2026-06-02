from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)
DB = "expenses.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                title    TEXT NOT NULL,
                amount   REAL NOT NULL CHECK(amount > 0),
                category TEXT NOT NULL,
                date     TEXT NOT NULL,
                note     TEXT DEFAULT ''
            )
        """)

@app.route("/expenses", methods=["GET"])
def list_expenses():
    db = get_db()
    q = "SELECT * FROM expenses WHERE 1=1"
    params = []
    category  = request.args.get("category")
    from_date = request.args.get("from")
    to_date   = request.args.get("to")
    search    = request.args.get("search")
    if category:  q += " AND category = ?";      params.append(category)
    if from_date: q += " AND date >= ?";          params.append(from_date)
    if to_date:   q += " AND date <= ?";          params.append(to_date)
    if search:    q += " AND title LIKE ?";       params.append(f"%{search}%")
    q += " ORDER BY date DESC"
    return jsonify([dict(r) for r in db.execute(q, params).fetchall()])

@app.route("/expenses", methods=["POST"])
def add_expense():
    d = request.json
    if not d.get("title","").strip() or not d.get("category") or not d.get("date"):
        return jsonify({"error": "Missing required fields"}), 400
    if float(d.get("amount", 0)) <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO expenses (title, amount, category, date, note) VALUES (?,?,?,?,?)",
            (d["title"].strip(), float(d["amount"]), d["category"], d["date"], d.get("note","").strip())
        )
    return jsonify({"id": cur.lastrowid}), 201

@app.route("/expenses/<int:eid>", methods=["PUT"])
def update_expense(eid):
    d = request.json
    if not d.get("title","").strip() or not d.get("category") or not d.get("date"):
        return jsonify({"error": "Missing required fields"}), 400
    if float(d.get("amount", 0)) <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400
    with get_db() as conn:
        conn.execute(
            "UPDATE expenses SET title=?, amount=?, category=?, date=?, note=? WHERE id=?",
            (d["title"].strip(), float(d["amount"]), d["category"], d["date"], d.get("note","").strip(), eid)
        )
    return jsonify({"ok": True})

@app.route("/expenses/<int:eid>", methods=["DELETE"])
def delete_expense(eid):
    with get_db() as conn:
        conn.execute("DELETE FROM expenses WHERE id=?", (eid,))
    return jsonify({"ok": True})

@app.route("/summary", methods=["GET"])
def summary():
    from datetime import date
    month = request.args.get("month", date.today().strftime("%Y-%m"))
    db = get_db()
    breakdown = db.execute(
        "SELECT category, SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', date)=? GROUP BY category",
        (month,)
    ).fetchall()
    grand = db.execute(
        "SELECT SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', date)=?",
        (month,)
    ).fetchone()
    return jsonify({"month": month, "total": grand["total"] or 0, "breakdown": [dict(r) for r in breakdown]})

@app.route("/insights", methods=["GET"])
def insights():
    from datetime import date
    month = request.args.get("month", date.today().strftime("%Y-%m"))
    db = get_db()

    rows = db.execute(
        "SELECT * FROM expenses WHERE strftime('%Y-%m', date) = ?", (month,)
    ).fetchall()

    if not rows:
        return jsonify({"empty": True})

    rows = [dict(r) for r in rows]
    total = sum(r["amount"] for r in rows)
    avg   = total / len(rows)

    # highest single expense
    top_expense = max(rows, key=lambda r: r["amount"])

    # top category by total spend
    from collections import defaultdict
    by_cat = defaultdict(float)
    for r in rows:
        by_cat[r["category"]] += r["amount"]
    top_cat     = max(by_cat, key=by_cat.get)
    top_cat_amt = by_cat[top_cat]
    top_cat_pct = (top_cat_amt / total * 100) if total else 0

    # most frequent category
    from collections import Counter
    freq_cat = Counter(r["category"] for r in rows).most_common(1)[0][0]

    category_breakdown = [
        {
            "name": cat,
            "amount": round(amount, 2)
        }
        for cat, amount in by_cat.items()
    ]

    daily_map = defaultdict(float)
    for r in rows:
        day = r["date"][-2:]
        daily_map[day] += r["amount"]

    daily_spending = [
        {
            "day": day,
            "amount": round(amount, 2)
        }
        for day, amount in sorted(daily_map.items())
    ]

    # Weekly trend: W1 (days 1-7), W2 (days 8-14), W3 (days 15-21), W4 (days 22+)
    weekly_map = {"W1": 0.0, "W2": 0.0, "W3": 0.0, "W4": 0.0}
    for r in rows:
        try:
            day_val = int(r["date"][-2:])
        except Exception:
            day_val = 1
        if day_val <= 7:
            weekly_map["W1"] += r["amount"]
        elif day_val <= 14:
            weekly_map["W2"] += r["amount"]
        elif day_val <= 21:
            weekly_map["W3"] += r["amount"]
        else:
            weekly_map["W4"] += r["amount"]

    weekly_spending = [
        {"week": k, "amount": round(v, 2)}
        for k, v in sorted(weekly_map.items())
    ]

    # Monthly trend: past 6 months leading to selected month
    from datetime import datetime
    try:
        sel_date = datetime.strptime(month + "-01", "%Y-%m-%d").date()
    except Exception:
        sel_date = date.today().replace(day=1)

    monthly_spending = []
    for i in range(5, -1, -1):
        m_offset = sel_date.month - i
        y_offset = sel_date.year
        while m_offset <= 0:
            m_offset += 12
            y_offset -= 1
        m_str = f"{y_offset:04d}-{m_offset:02d}"

        m_row = db.execute(
            "SELECT SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', date) = ?", (m_str,)
        ).fetchone()

        # Format month label as YYYY-MM
        monthly_spending.append({
            "month": m_str,
            "amount": round(m_row["total"] or 0, 2)
        })

    return jsonify({
        "empty":         False,
        "total":         round(total, 2),
        "avg":           round(avg, 2),
        "count":         len(rows),
        "top_expense":   { "title": top_expense["title"], "amount": top_expense["amount"] },
        "top_category":  { "name": top_cat, "amount": round(top_cat_amt, 2), "pct": round(top_cat_pct, 1) },
        "freq_category": freq_cat,
        "category_breakdown": category_breakdown,
        "daily_spending": daily_spending,
        "weekly_spending": weekly_spending,
        "monthly_spending": monthly_spending
    })

@app.route("/compare", methods=["GET"])
def compare():
    from datetime import date

    today = date.today()
    default_a = today.strftime("%Y-%m")
    first_of_this = today.replace(day=1)
    last_month_date = first_of_this - __import__('datetime').timedelta(days=1)
    default_b = last_month_date.strftime("%Y-%m")

    month_a = request.args.get("month_a", default_a)
    month_b = request.args.get("month_b", default_b)

    db = get_db()

    def month_data(m):
        total_row = db.execute(
            "SELECT SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', date) = ?", (m,)
        ).fetchone()
        total = round(total_row["total"] or 0, 2)

        breakdown = db.execute(
            "SELECT category, SUM(amount) as total FROM expenses WHERE strftime('%Y-%m', date) = ? GROUP BY category",
            (m,)
        ).fetchall()

        return {
            "month": m,
            "total": total,
            "breakdown": [dict(r) for r in breakdown]
        }

    a = month_data(month_a)
    b = month_data(month_b)

    if b["total"] == 0:
        change_pct = None
    else:
        change_pct = round(((a["total"] - b["total"]) / b["total"]) * 100, 1)

    return jsonify({
        "month_a": a,
        "month_b": b,
        "change_pct": change_pct,
    })

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=3000, host='127.0.0.1')
