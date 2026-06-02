import { useState, useEffect } from "react";
import { getSummary } from "../api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#f97316","#3b82f6","#a855f7","#ef4444","#10b981","#6b7280"];

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Summary({ expenses }) {
  const [month, setMonth]       = useState(thisMonth());
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getSummary(month);
      setData(res);
      setLoading(false);
    };
    load();
  }, [month, expenses]);

  const chartData = data?.breakdown?.map(b => ({
    name: b.category,
    value: parseFloat(b.total.toFixed(2))
  })) || [];

  return (
    <div>
      <div style={styles.header}>
        <div>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={styles.monthPicker}
          />
        </div>
      </div>

      {loading && <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0" }}>Loading...</p>}

      {!loading && data && (
        <>
          <div style={styles.totalCard}>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Total spent</span>
            <span style={styles.totalAmount}>₹{parseFloat(data.total).toFixed(2)}</span>
          </div>

          {chartData.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontWeight: 500, color: "#6b7280" }}>No expenses recorded for this month</p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Add expenses to see your spending breakdown</p>
            </div>
          ) : (
            <div style={styles.content}>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `₹${val.toFixed(2)}`}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Category</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => (
                    <tr key={row.name} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={styles.td}>
                        <span style={{
                          display: "inline-block", width: 10, height: 10,
                          borderRadius: 3, background: COLORS[i % COLORS.length],
                          marginRight: 10
                        }} />
                        {row.name}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 600 }}>
                        ₹{row.value.toFixed(2)}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right", color: "#6b7280" }}>
                        {data.total > 0
                          ? ((row.value / data.total) * 100).toFixed(1) + "%"
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
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
  totalCard: {
    display: "flex", flexDirection: "column", gap: 4,
    background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
    border: "1px solid #bfdbfe",
    borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem"
  },
  totalAmount: {
    fontSize: 28, fontWeight: 700, color: "#1e40af",
    letterSpacing: "-0.02em"
  },
  empty: { textAlign: "center", padding: "2.5rem 1rem" },
  content: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.65rem 0.75rem", fontSize: 12, color: "#6b7280",
    fontWeight: 600, textAlign: "left", textTransform: "uppercase",
    letterSpacing: "0.04em", borderBottom: "2px solid #f0f2f5", background: "#fafafa"
  },
  td: { padding: "0.65rem 0.75rem", fontSize: 14, borderBottom: "1px solid #f3f4f6" },
};
