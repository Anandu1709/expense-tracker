import { delExpense } from "../api";

const CATEGORY_COLORS = {
  Food: "#f97316", Transport: "#3b82f6", Shopping: "#a855f7",
  Bills: "#ef4444", Entertainment: "#10b981", Other: "#6b7280"
};

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>¤</div>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>No expenses found</p>
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Add your first expense using the form above</p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    await delExpense(id);
    onDelete();
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Category</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
            <th style={styles.th}>Note</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, i) => (
            <tr key={exp.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ ...styles.td, color: "#6b7280", fontSize: 13, whiteSpace: "nowrap" }}>
                {exp.date}
              </td>
              <td style={{ ...styles.td, ...styles.titleCell, fontWeight: 500 }}>
                {exp.title}
              </td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  background: (CATEGORY_COLORS[exp.category] || "#6b7280") + "14",
                  color: CATEGORY_COLORS[exp.category] || "#6b7280",
                  border: `1px solid ${(CATEGORY_COLORS[exp.category] || "#6b7280")}30`
                }}>
                  {exp.category}
                </span>
              </td>
              <td style={{ ...styles.td, fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>
                ₹{parseFloat(exp.amount).toFixed(2)}
              </td>
              <td style={{ ...styles.td, color: "#9ca3af", fontSize: 13 }}>
                {exp.note || "—"}
              </td>
              <td style={{ ...styles.td, textAlign: "center", whiteSpace: "nowrap" }}>
                <button onClick={() => onEdit(exp)} style={styles.editBtn}>Edit</button>
                <button onClick={() => handleDelete(exp.id)} style={styles.deleteBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  empty: {
    textAlign: "center", padding: "2.5rem 1rem",
    color: "#6b7280"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.65rem 0.75rem", textAlign: "left",
    fontSize: 12, color: "#6b7280", fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.04em",
    borderBottom: "2px solid #f0f2f5", background: "#fafafa"
  },
  td: { padding: "0.7rem 0.75rem", fontSize: 14, borderBottom: "1px solid #f3f4f6" },
  titleCell: { maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  badge: { padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 },
  editBtn: {
    marginRight: 6, padding: "4px 12px", fontSize: 12,
    background: "#eff6ff", color: "#2563eb",
    border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", fontWeight: 500
  },
  deleteBtn: {
    padding: "4px 12px", fontSize: 12,
    background: "#fef2f2", color: "#dc2626",
    border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontWeight: 500
  },
};
