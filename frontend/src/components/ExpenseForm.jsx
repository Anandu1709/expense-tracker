import { useState, useEffect } from "react";
import { addExpense, editExpense } from "../api";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];
const today = () => new Date().toISOString().split("T")[0];

export default function ExpenseForm({ editTarget, onSave }) {
  const [form, setForm] = useState({
    title: "", amount: "", category: "Food", date: today(), note: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editTarget) {
      setForm({
        title:    editTarget.title,
        amount:   editTarget.amount,
        category: editTarget.category,
        date:     editTarget.date,
        note:     editTarget.note || ""
      });
    } else {
      setForm({ title: "", amount: "", category: "Food", date: today(), note: "" });
    }
    setError("");
  }, [editTarget]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title.trim())        return setError("Title is required.");
    if (!form.amount || parseFloat(form.amount) <= 0)
                                   return setError("Amount must be greater than 0.");
    if (!form.date)                return setError("Date is required.");

    const payload = { ...form, amount: parseFloat(form.amount) };
    if (editTarget) {
      await editExpense(editTarget.id, payload);
      onSave("Expense updated successfully");
    } else {
      await addExpense(payload);
      onSave("Expense added successfully");
    }
    setError("");
  };

  return (
    <div>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        <div style={styles.field}>
          <label>Merchant / Description <span style={styles.req}>*</span></label>
          <input
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Amazon Web Services, Uber"
            style={styles.input}
            maxLength={100}
          />
        </div>

        <div style={styles.field}>
          <label>Value (INR) <span style={styles.req}>*</span></label>
          <input
            type="number"
            value={form.amount}
            onChange={set("amount")}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Category <span style={styles.req}>*</span></label>
          <select value={form.category} onChange={set("category")} style={styles.input}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={styles.field}>
          <label>Transaction Date <span style={styles.req}>*</span></label>
          <input
            type="date"
            value={form.date}
            onChange={set("date")}
            style={styles.input}
          />
        </div>
      </div>

      <div style={{ ...styles.field, marginTop: "1rem" }}>
        <label>Memo / Reference <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
        <textarea
          value={form.note}
          onChange={set("note")}
          placeholder="Add accounting notes, receipt reference, or comments..."
          rows={2}
          style={{ ...styles.input, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
        <button onClick={handleSubmit} style={styles.btnPrimary}>
          {editTarget ? "Update Record" : "Post Transaction"}
        </button>
        {editTarget && (
          <button onClick={onSave} style={styles.btnSecondary}>
            Abort
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "1rem"
  },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  req: { color: "#ef4444", fontSize: 13 },
  input: {
    padding: "0.55rem 0.75rem", borderRadius: 8,
    border: "1px solid #d1d5db", fontSize: 14, width: "100%",
    boxSizing: "border-box", background: "#fafafa"
  },
  error: {
    color: "#c0392b", background: "#fef2f2",
    padding: "0.5rem 0.75rem", borderRadius: 8, marginBottom: "1rem",
    fontSize: 13, fontWeight: 500, border: "1px solid #fecaca"
  },
  btnPrimary: {
    padding: "0.6rem 1.6rem", background: "#09090b",
    color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
    fontWeight: 600, fontSize: 14
  },
  btnSecondary: {
    padding: "0.6rem 1.4rem", background: "#f3f4f6", color: "#374151",
    border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer",
    fontWeight: 500, fontSize: 14
  },
};
