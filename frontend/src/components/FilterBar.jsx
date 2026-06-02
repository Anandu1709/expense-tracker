const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

export default function FilterBar({ filters, setFilters }) {
  const set = (field) => (e) => setFilters({ ...filters, [field]: e.target.value });

  const clear = () => setFilters({ category: "", from: "", to: "", search: "" });

  const dateError = filters.from && filters.to && filters.from > filters.to;
  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div>
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select value={filters.category} onChange={set("category")} style={styles.input}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>From</label>
          <input
            type="date"
            value={filters.from}
            onChange={set("from")}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>To</label>
          <input
            type="date"
            value={filters.to}
            onChange={set("to")}
            style={{ ...styles.input, borderColor: dateError ? "#ef4444" : "#d1d5db" }}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Search title</label>
          <input
            type="text"
            value={filters.search}
            onChange={set("search")}
            placeholder="e.g. Swiggy"
            style={styles.input}
          />
        </div>

        {hasFilters && (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={clear} style={styles.clearBtn}>Clear all</button>
          </div>
        )}
      </div>

      {dateError && (
        <p style={styles.error}>
          "From" date cannot be after "To" date.
        </p>
      )}
    </div>
  );
}

const styles = {
  row: {
    display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end"
  },
  field: { display: "flex", flexDirection: "column", gap: 4, minWidth: 150, flex: 1 },
  label: { fontSize: 12, fontWeight: 500, color: "#6b7280" },
  input: {
    padding: "0.5rem 0.75rem", borderRadius: 8,
    border: "1px solid #d1d5db", fontSize: 14, background: "#fafafa",
    boxSizing: "border-box", width: "100%"
  },
  clearBtn: {
    padding: "0.5rem 1rem", background: "#fff",
    border: "1px solid #d1d5db", borderRadius: 8,
    cursor: "pointer", fontSize: 13, whiteSpace: "nowrap",
    color: "#6b7280", fontWeight: 500
  },
  error: {
    color: "#dc2626", fontSize: 13, fontWeight: 500,
    margin: "0.75rem 0 0", padding: "0.4rem 0.75rem",
    background: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca"
  },
};
