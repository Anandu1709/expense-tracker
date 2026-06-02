import { useState, useEffect } from "react";
import { getInsights } from "../api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = [
  "#09090b",
  "#10b981",
  "#3f3f46",
  "#059669",
  "#71717a",
  "#a1a1aa"
];

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Insights({ expenses }) {
  const [month, setMonth]     = useState(thisMonth());
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [trendMode, setTrendMode] = useState("day"); // "day", "week", "month"

  const [budget, setBudget] = useState(
    Number(localStorage.getItem("monthlyBudget")) || 0
  );
  const [budgetInput, setBudgetInput] = useState("");

  const saveBudget = () => {
    const value = Number(budgetInput);
    if (!value || value <= 0) {
      alert("Please enter a valid monthly budget limit.");
      return;
    }
    localStorage.setItem("monthlyBudget", value);
    setBudget(value);
  };

  const spent = data?.empty ? 0 : (data?.total || 0);
  const remaining = Math.max(budget - spent, 0);
  const exceeded = Math.max(spent - budget, 0);
  const percentage = budget ? (spent / budget) * 100 : 0;
  const isOverBudget = spent > budget;

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

      {!loading && (
        <>
          {/* Budget setup or display card */}
          {budget === 0 ? (
            <div style={styles.setupCard}>
              <h3 style={{ ...styles.chartTitle, borderBottom: "none", paddingBottom: 0, marginBottom: "0.75rem" }}>Establish Monthly Budget Target</h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  placeholder="Enter Target Amount (₹)"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  style={styles.setupInput}
                />
                <button onClick={saveBudget} style={styles.setupBtn}>
                  Save Budget
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.budgetCard}>
              <div style={styles.budgetHeader}>
                <div>
                  <p style={styles.budgetLabel}>Monthly Budget Limit</p>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: "#09090b", margin: "0.2rem 0 0" }}>
                    ₹{budget.toLocaleString()}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    const newBudget = prompt("Enter new monthly budget target:", budget);
                    if (!newBudget || isNaN(newBudget) || Number(newBudget) <= 0) return;
                    localStorage.setItem("monthlyBudget", newBudget);
                    setBudget(Number(newBudget));
                  }}
                  style={styles.editBudgetBtn}
                >
                  ✏️ Edit
                </button>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min(percentage, 100)}%`,
                    background: isOverBudget ? "#ef4444" : "#10b981"
                  }}
                />
              </div>

              <div style={styles.budgetStats}>
                <div>
                  Spent: <strong style={{ color: "#09090b" }}>₹{spent.toLocaleString()}</strong>
                </div>
                {!isOverBudget ? (
                  <div>
                    Remaining: <strong style={{ color: "#10b981" }}>₹{remaining.toLocaleString()}</strong>
                  </div>
                ) : (
                  <div>
                    Exceeded: <strong style={{ color: "#ef4444" }}>₹{exceeded.toLocaleString()}</strong>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#71717a" }}>{percentage.toFixed(1)}% Used</span>
                <span style={{ color: isOverBudget ? "#ef4444" : "#10b981" }}>
                  {isOverBudget ? "🚨 Over Budget" : "✅ On Track"}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && data?.empty && (
        <div style={styles.empty}>
          <p style={{ fontWeight: 500, color: "#6b7280" }}>Insufficient Data Pool</p>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>No financial records detected for the selected billing cycle.</p>
        </div>
      )}

      {!loading && data && !data.empty && (
        <>
          {/* Top: Statistic cards */}
          <div style={styles.grid}>
            <InsightCard
              color="#09090b"
              label="Volume Concentration"
              value={`${data.top_category.name} — ₹${data.top_category.amount.toFixed(2)}`}
              sub={`${data.top_category.pct}% of total outflows`}
            />
            <InsightCard
              color="#10b981"
              label="Mean Transaction Size"
              value={`₹${data.avg.toFixed(2)}`}
              sub={`Calculated across ${data.count} posted record${data.count !== 1 ? "s" : ""}`}
            />
            <InsightCard
              color="#71717a"
              label="Peak Transaction Outflow"
              value={`₹${data.top_expense.amount.toFixed(2)}`}
              sub={data.top_expense.title}
            />
            <InsightCard
              color="#a1a1aa"
              label="Outflow Frequency Leader"
              value={data.freq_category}
              sub="Categorized volume density peak"
            />
          </div>

          {/* Middle: Charts */}
          <div style={styles.chartGrid}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Category Distribution</h3>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.category_breakdown}
                      dataKey="amount"
                      nameKey="name"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.category_breakdown.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val) => `₹${val.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.chartCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "2px solid #f0f2f5", paddingBottom: "0.5rem" }}>
                <h3 style={{ ...styles.chartTitle, marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>Spending Trend</h3>
                <div style={styles.toggleRow}>
                  <button onClick={() => setTrendMode("day")} style={styles.toggleBtn(trendMode === "day")}>Day</button>
                  <button onClick={() => setTrendMode("week")} style={styles.toggleBtn(trendMode === "week")}>Week</button>
                  <button onClick={() => setTrendMode("month")} style={styles.toggleBtn(trendMode === "month")}>Month</button>
                </div>
              </div>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={
                    trendMode === "day"
                      ? data.daily_spending
                      : trendMode === "week"
                      ? data.weekly_spending
                      : data.monthly_spending
                  }>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey={trendMode === "day" ? "day" : trendMode === "week" ? "week" : "month"}
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                    <RechartsTooltip formatter={(val) => `₹${val.toFixed(2)}`} />
                    <Bar
                      dataKey="amount"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Budget Alerts Box */}
          {budget > 0 && (
            <div style={{
              ...styles.alertCard,
              background: isOverBudget ? "#fef2f2" : percentage >= 90 ? "#fff7ed" : "#f0fdf4",
              borderColor: isOverBudget ? "#fecaca" : percentage >= 90 ? "#ffedd5" : "#dcfce7",
              color: isOverBudget ? "#991b1b" : percentage >= 90 ? "#9a3412" : "#166534"
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 0.5rem" }}>Budget Alerts</h3>
              {percentage < 50 && (
                <p style={{ margin: 0, fontSize: "13px" }}>✅ Spending is under control. Keep up the healthy habits!</p>
              )}
              {percentage >= 50 && percentage < 90 && (
                <p style={{ margin: 0, fontSize: "13px" }}>📊 Budget usage is healthy. Plan remaining purchases carefully.</p>
              )}
              {percentage >= 90 && percentage <= 100 && (
                <p style={{ margin: 0, fontSize: "13px" }}>⚠️ Warning: You have utilized more than 90% of your current period budget.</p>
              )}
              {percentage > 100 && (
                <p style={{ margin: 0, fontSize: "13px" }}>🚨 Limit exceeded! Outflows are ₹{exceeded.toFixed(2)} above your target monthly budget.</p>
              )}
            </div>
          )}

          {/* Bottom: Smart Insights Box */}
          <div style={styles.smartBox}>
            <h3 style={styles.chartTitle}>Narrative Intelligence</h3>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <strong>Volume Concentration:</strong> Category <strong>{data.top_category.name}</strong> represents the largest share of outflows at {data.top_category.pct}%.
              </li>
              <li style={styles.listItem}>
                <strong>Peak Outflow:</strong> Your single largest transaction was logged under "{data.top_expense.title}" at <strong>₹{data.top_expense.amount.toFixed(2)}</strong>.
              </li>
              <li style={styles.listItem}>
                <strong>Mean Transaction:</strong> The average transaction size for this period is settled at <strong>₹{data.avg.toFixed(2)}</strong>.
              </li>
              <li style={styles.listItem}>
                <strong>Frequency Leader:</strong> Transactions classified as <strong>{data.freq_category}</strong> occurred with the highest volume.
              </li>
            </ul>
          </div>

          {/* Finance Coach Recommendations */}
          {budget > 0 && (
            <div style={styles.coachCard}>
              <h3 style={styles.chartTitle}>Finance Coach Recommendations</h3>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  Concentration alert: <strong>{data.top_category.name}</strong> accounts for <strong>{data.top_category.pct}%</strong> of total spending.
                </li>
                <li style={styles.listItem}>
                  Peak Outflow: <strong>{data.top_expense.title}</strong> represents the single largest debit at <strong>₹{data.top_expense.amount.toFixed(2)}</strong>.
                </li>
                <li style={styles.listItem}>
                  Budget Target: Current limit allocation is utilized at <strong>{percentage.toFixed(1)}%</strong>.
                </li>
                <li style={styles.listItem}>
                  Best Practice: Try keeping any single category allocation below 40% of total target limits.
                </li>
              </ul>
            </div>
          )}
        </>
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
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
    marginTop: "1.5rem"
  },
  chartCard: {
    background: "#fafafa",
    borderRadius: "10px",
    padding: "1.25rem",
    border: "1px solid #e5e7eb"
  },
  chartTitle: {
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6b7280",
    marginBottom: "1rem",
    borderBottom: "2px solid #f0f2f5",
    paddingBottom: "0.5rem"
  },
  smartBox: {
    marginTop: "1.5rem",
    background: "#fafafa",
    borderRadius: "10px",
    padding: "1.25rem",
    border: "1px solid #e5e7eb"
  },
  list: {
    paddingLeft: "1.25rem",
    marginTop: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  listItem: {
    fontSize: "14px",
    color: "#374151"
  },
  toggleRow: {
    display: "flex",
    gap: "0.25rem",
    background: "#f4f4f5",
    padding: "2px",
    borderRadius: "6px",
    alignItems: "center"
  },
  toggleBtn: (active) => ({
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: 600,
    borderRadius: "4px",
    border: "none",
    background: active ? "#ffffff" : "transparent",
    color: active ? "#09090b" : "#71717a",
    cursor: "pointer",
    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
    transition: "all 0.15s ease"
  }),
  setupCard: {
    background: "#fafafa",
    padding: "1.25rem",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    marginBottom: "1.5rem"
  },
  setupInput: {
    padding: "0.5rem 0.75rem",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#ffffff",
    width: "100%",
    maxWidth: "200px",
    boxSizing: "border-box"
  },
  setupBtn: {
    padding: "0.5rem 1rem",
    background: "#09090b",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13
  },
  budgetCard: {
    background: "#fafafa",
    padding: "1.25rem",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    marginBottom: "1.5rem"
  },
  budgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  budgetLabel: {
    color: "#71717a",
    fontSize: "13px",
    fontWeight: 500,
    margin: 0
  },
  editBudgetBtn: {
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    color: "#27272a",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer",
    transition: "background 0.15s ease"
  },
  progressTrack: {
    width: "100%",
    height: "8px",
    background: "#e4e4e7",
    borderRadius: "999px",
    overflow: "hidden",
    marginTop: "1rem"
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease"
  },
  budgetStats: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
    fontSize: "13px",
    color: "#71717a"
  },
  alertCard: {
    borderRadius: "10px",
    borderWidth: "1px",
    borderStyle: "solid",
    padding: "1.25rem",
    marginTop: "1.5rem"
  },
  coachCard: {
    background: "#fafafa",
    borderRadius: "10px",
    padding: "1.25rem",
    border: "1px solid #e5e7eb",
    marginTop: "1.5rem"
  }
};
