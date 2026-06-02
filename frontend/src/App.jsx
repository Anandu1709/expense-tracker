import { useState, useEffect, useCallback } from "react";
import { getExpenses } from "./api";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import FilterBar from "./components/FilterBar";
import Summary from "./components/Summary";
import Insights from "./components/Insights";
import MonthCompare from "./components/MonthCompare";

function App() {
  const [expenses, setExpenses]     = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState("home");
  const [snackbar, setSnackbar]     = useState(null);
  const [filters, setFilters]       = useState({
    category: "", from: "", to: "", search: ""
  });

  const showSnackbar = useCallback((message, type = "success") => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar(null), 3000);
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    const clean = Object.fromEntries(Object.entries(filters).filter(([,v]) => v));
    const data = await getExpenses(clean);
    setExpenses(data);
    setLoading(false);
  };

  useEffect(() => { loadExpenses(); }, [filters]);

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  const tabs = [
    { id: "home",     label: "Home",     icon: <HomeIcon /> },
    { id: "insights", label: "Insights", icon: <InsightsIcon /> },
    { id: "compare",  label: "Compare",  icon: <CompareIcon /> },
  ];

  const pageInfo = {
    home:     { title: "Dashboard",       sub: "Manage and track your daily expenses" },
    insights: { title: "Smart Insights",  sub: "Spending analytics and patterns" },
    compare:  { title: "Month Compare",   sub: "This month vs last month spending" },
  };

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Expense Tracker</h1>
          <p>Personal Finance</p>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          Built with Flask + React
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="page-header">
          <h2>{pageInfo[activeTab].title}</h2>
          <p>{pageInfo[activeTab].sub}</p>
        </div>

        <div className="page-body">

          {activeTab === "home" && (
            <>
              <div className="section-card">
                <div className="section-title">
                  {editTarget ? "Edit Expense" : "New Expense"}
                </div>
                <ExpenseForm
                  editTarget={editTarget}
                  onSave={(msg) => { setEditTarget(null); loadExpenses(); showSnackbar(msg || "Expense saved successfully"); }}
                />
              </div>

              <div className="section-card">
                <div className="section-title">
                  Filters {activeFilterCount > 0 && (
                    <span style={{
                      background: "#2563eb", color: "#fff", borderRadius: 10,
                      padding: "1px 8px", fontSize: 11, marginLeft: 8, fontWeight: 700,
                      letterSpacing: 0
                    }}>
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <FilterBar filters={filters} setFilters={setFilters} />
              </div>

              <div className="section-card">
                <div className="section-title">
                  Expenses {expenses.length > 0 && (
                    <span style={{
                      background: "#e5e7eb", color: "#4b5563", borderRadius: 10,
                      padding: "1px 8px", fontSize: 11, marginLeft: 8, fontWeight: 600,
                      letterSpacing: 0
                    }}>
                      {expenses.length} {expenses.length === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>
                {loading ? (
                  <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0" }}>Loading...</p>
                ) : (
                  <ExpenseList
                    expenses={expenses}
                    onEdit={(exp) => { setEditTarget(exp); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    onDelete={() => { loadExpenses(); showSnackbar("Expense deleted"); }}
                  />
                )}
              </div>

              <div className="section-card">
                <div className="section-title">Monthly Summary</div>
                <Summary expenses={expenses} />
              </div>
            </>
          )}

          {activeTab === "insights" && (
            <div className="section-card">
              <div className="section-title">Spending Insights</div>
              <Insights expenses={expenses} />
            </div>
          )}

          {activeTab === "compare" && (
            <div className="section-card">
              <div className="section-title">This Month vs Last Month</div>
              <MonthCompare expenses={expenses} />
            </div>
          )}

        </div>
      </main>

      {/* Snackbar */}
      {snackbar && (
        <div className={`snackbar snackbar-${snackbar.type}`}>
          {snackbar.type === "success" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {snackbar.message}
        </div>
      )}

    </div>
  );
}

/* ── Simple SVG Icons ── */
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export default App;
