import { useState, useEffect } from "react";
import { getCompare } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const thisMonth = () => new Date().toISOString().slice(0, 7);
const lastMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
};

export default function MonthCompare({ expenses }) {
  const [monthA, setMonthA]   = useState(thisMonth());
  const [monthB, setMonthB]   = useState(lastMonth());
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getCompare(monthA, monthB);
      setData(res);
      setLoading(false);
    };
    load();
  }, [monthA, monthB, expenses]);

  if (loading) return <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0" }}>Loading...</p>;
  if (!data) return null;

  const a = data.month_a;
  const b = data.month_b;
  const increase = data.change_pct > 0;
  const decrease = data.change_pct < 0;
  const noData   = data.change_pct === null;

  const arrow = increase ? "↑" : decrease ? "↓" : "→";
  const color = increase ? "#ef4444" : decrease ? "#10b981" : "#6b7280";
  const label = increase ? "more spent" : decrease ? "less spent" : "no change";

  // merge categories from both months for comparison
  const allCats = new Set([
    ...(a.breakdown || []).map(r => r.category),
    ...(b.breakdown || []).map(r => r.category),
  ]);
  const catRows = [...allCats].map(cat => {
    const aAmt = (a.breakdown || []).find(r => r.category === cat)?.total || 0;
    const bAmt = (b.breakdown || []).find(r => r.category === cat)?.total || 0;
    return { category: cat, a: aAmt, b: bAmt, diff: aAmt - bAmt };
  }).sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));

  return (
    <div>
      {/* Month pickers */}
      <div style={styles.pickerRow}>
        <div style={styles.pickerField}>
          <label style={styles.pickerLabel}>Period A</label>
          <input type="month" value={monthA} onChange={e => setMonthA(e.target.value)} style={styles.monthInput} />
        </div>
        <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 14, alignSelf: "flex-end", paddingBottom: 8 }}>vs</span>
        <div style={styles.pickerField}>
          <label style={styles.pickerLabel}>Period B</label>
          <input type="month" value={monthB} onChange={e => setMonthB(e.target.value)} style={styles.monthInput} />
        </div>
      </div>

      {/* Total comparison cards */}
      <div style={styles.grid}>
        <div style={{ ...styles.card, borderLeft: "4px solid #09090b" }}>
          <p style={styles.cardLabel}>{a.month}</p>
          <p style={styles.cardAmount}>₹{a.total.toFixed(2)}</p>
        </div>

        <div style={styles.middle}>
          {noData ? (
            <p style={{ fontSize: 12, color: "#9ca3af" }}>No comparative data</p>
          ) : (
            <>
              <span style={{ ...styles.arrow, color }}>{arrow}</span>
              <p style={{ ...styles.pct, color }}>{Math.abs(data.change_pct)}%</p>
              <p style={{ ...styles.changeLabel, color }}>{label}</p>
            </>
          )}
        </div>

        <div style={{ ...styles.card, borderLeft: "4px solid #94a3b8" }}>
          <p style={styles.cardLabel}>{b.month}</p>
          <p style={{ ...styles.cardAmount, color: "#64748b" }}>₹{b.total.toFixed(2)}</p>
        </div>
      </div>

      {/* Category comparison side-by-side Bar Chart */}
      {catRows.length > 0 && (
        <div style={styles.bars}>
          <h3 style={styles.chartTitle}>Category Outflow Comparison</h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={catRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <RechartsTooltip formatter={(val) => `₹${val.toFixed(2)}`} />
                <Legend />
                <Bar name={a.month} dataKey="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name={b.month} dataKey="b" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category breakdown comparison */}
      {catRows.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={styles.sectionLabel}>Category Breakdown</p>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category</th>
                <th style={{ ...styles.th, textAlign: "right" }}>{a.month}</th>
                <th style={{ ...styles.th, textAlign: "right" }}>{b.month}</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Variance</th>
              </tr>
            </thead>
            <tbody>
              {catRows.map((row, i) => (
                <tr key={row.category} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={styles.td}>{row.category}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 600 }}>₹{row.a.toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: "#64748b" }}>₹{row.b.toFixed(2)}</td>
                  <td style={{
                    ...styles.td, textAlign: "right", fontWeight: 700,
                    color: row.diff > 0 ? "#ef4444" : row.diff < 0 ? "#10b981" : "#6b7280"
                  }}>
                    {row.diff > 0 ? "+" : ""}{row.diff === 0 ? "—" : `₹${row.diff.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



const styles = {
  pickerRow: {
    display: "flex", gap: "1rem", alignItems: "flex-end",
    marginBottom: "1.5rem", flexWrap: "wrap"
  },
  pickerField: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 140 },
  pickerLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" },
  monthInput: {
    padding: "0.5rem 0.75rem", borderRadius: 8,
    border: "1px solid #d1d5db", fontSize: 14, background: "#fafafa", width: "100%"
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr auto 1fr",
    gap: "1rem", alignItems: "center", marginBottom: "1.5rem"
  },
  card: {
    background: "#fafafa", borderRadius: 10,
    padding: "1.1rem 1.25rem", textAlign: "center"
  },
  cardLabel: {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.05em", color: "#9ca3af", margin: 0
  },
  cardAmount: { fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0.4rem 0 0" },
  middle: { textAlign: "center", padding: "0 0.5rem" },
  arrow: { fontSize: 36, fontWeight: 800, lineHeight: 1 },
  pct: { fontSize: 20, fontWeight: 800, margin: "0.1rem 0 0" },
  changeLabel: { fontSize: 12, fontWeight: 600, margin: 0 },
  bars: { background: "#fafafa", borderRadius: 10, padding: "1.25rem", border: "1px solid #e5e7eb" },
  chartTitle: {
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6b7280",
    marginBottom: "1.25rem",
    borderBottom: "2px solid #f0f2f5",
    paddingBottom: "0.5rem"
  },
  sectionLabel: {
    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.05em", color: "#6b7280", marginBottom: "0.75rem"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.65rem 0.75rem", fontSize: 12, color: "#6b7280",
    fontWeight: 600, textAlign: "left", textTransform: "uppercase",
    letterSpacing: "0.04em", borderBottom: "2px solid #f0f2f5", background: "#fafafa"
  },
  td: { padding: "0.65rem 0.75rem", fontSize: 14, borderBottom: "1px solid #f3f4f6" },
};
