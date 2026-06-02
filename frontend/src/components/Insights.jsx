import { useState, useEffect } from "react";
import { getInsights } from "../api";

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Insights({ expenses }) {
  const [month, setMonth]     = useState(thisMonth());
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getInsights(month);
      setData(res);
      setLoading(false);
    };
    load();
  }, [month, expenses]);

  return (
    <div>
      <div style={styles.header}>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={styles.monthPicker}
        />
      </div>

      {loading && <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0" }}>Loading...</p>}

      {!loading && data?.empty && (
        <div style={styles.empty}>
          <p style={{ fontWeight: 500, color: "#6b7280" }}>No data for this month yet</p>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Add expenses to see insights</p>
        </div>
      )}

      {!loading && data && !data.empty && (
        <div style={styles.grid}>
          <InsightCard
            color="#2563eb"
            label="Top Category"
            value={`${data.top_category.name} — ₹${data.top_category.amount.toFixed(2)}`}
            sub={`${data.top_category.pct}% of total spending`}
          />
          <InsightCard
            color="#10b981"
            label="Average Expense"
            value={`₹${data.avg.toFixed(2)}`}
            sub={`Across ${data.count} expense${data.count !== 1 ? "s" : ""}`}
          />
          <InsightCard
            color="#f97316"
            label="Highest Expense"
            value={`₹${data.top_expense.amount.toFixed(2)}`}
            sub={data.top_expense.title}
          />
          <InsightCard
            color="#a855f7"
            label="Most Frequent"
            value={data.freq_category}
            sub="You spend on this most often"
          />
        </div>
      )}
    </div>
  );
}

function InsightCard({ label, value, sub, color }) {
  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={styles.cardValue}>{value}</p>
      <p style={styles.cardSub}>{sub}</p>
    </div>
  );
}

const styles = {
  header: {
    display: "flex", justifyContent: "flex-end",
    alignItems: "center", marginBottom: "1rem"
  },
  monthPicker: {
    padding: "0.45rem 0.75rem", borderRadius: 8,
    border: "1px solid #d1d5db", fontSize: 14, background: "#fafafa"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem"
  },
  card: {
    background: "#fafafa", borderRadius: 10,
    padding: "1.1rem 1.25rem", display: "flex", flexDirection: "column",
    transition: "transform 0.15s ease, box-shadow 0.15s ease"
  },
  cardLabel: {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.05em", color: "#9ca3af", margin: "0 0 0.4rem"
  },
  cardValue: {
    fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 0.3rem",
    lineHeight: 1.3
  },
  cardSub: {
    fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.4
  },
  empty: { textAlign: "center", padding: "2rem 1rem" },
};
