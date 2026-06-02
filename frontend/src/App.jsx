import { useState, useEffect, useCallback } from "react";
import { getExpenses } from "./api";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import FilterBar from "./components/FilterBar";
import Summary from "./components/Summary";
import Insights from "./components/Insights";
import MonthCompare from "./components/MonthCompare";

function App() {
  const [isLanding, setIsLanding] = useState(true);
  const [showHelp, setShowHelp]   = useState(false);
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
    { id: "home",     label: "Activity",     icon: <HomeIcon /> },
    { id: "insights", label: "Analytics",    icon: <InsightsIcon /> },
    { id: "compare",  label: "Comparison",   icon: <CompareIcon /> },
  ];

  const pageInfo = {
    home:     { title: "Activity Ledger",      sub: "Real-time overview of current period transactions" },
    insights: { title: "Analytics Suite",      sub: "Advanced breakdown of category volumes and behaviors" },
    compare:  { title: "Period Comparison",    sub: "Analyze changes in output and budget deviations across periods" },
  };

  if (isLanding) {
    return (
      <div style={landingStyles.container}>
        <div style={landingStyles.gridBackground} />
        <div style={landingStyles.card}>
          <div style={landingStyles.logo}>R</div>
          <h1 style={landingStyles.title}>Raify Expense Tracker</h1>
          <p style={landingStyles.subtitle}>
            A premium, high-contrast personal finance ledger and analytics engine built for modern asset control.
          </p>
          <div style={landingStyles.featuresGrid}>
            <div style={landingStyles.feature}>
              <div style={landingStyles.featureIcon}>💳</div>
              <div style={landingStyles.featureTitle}>Ledger Flow</div>
              <p style={landingStyles.featureText}>Record and classify transactions in a real-time activity ledger.</p>
            </div>
            <div style={landingStyles.feature}>
              <div style={landingStyles.featureIcon}>📊</div>
              <div style={landingStyles.featureTitle}>Analytics Suite</div>
              <p style={landingStyles.featureText}>Toggle day, week, or month trends with high-fidelity visuals.</p>
            </div>
            <div style={landingStyles.feature}>
              <div style={landingStyles.featureIcon}>⚖️</div>
              <div style={landingStyles.featureTitle}>Variance Compare</div>
              <p style={landingStyles.featureText}>Compare two calendar periods and analyze budget deviations side-by-side.</p>
            </div>
            <div style={landingStyles.feature}>
              <div style={landingStyles.featureIcon}>🎯</div>
              <div style={landingStyles.featureTitle}>Budget Control</div>
              <p style={landingStyles.featureText}>Set user-defined monthly limits with coaching recommendations.</p>
            </div>
          </div>
          <button onClick={() => setIsLanding(false)} style={landingStyles.button}>
            Enter Dashboard
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
        <div style={landingStyles.footer}>
          System Core v1.0.0 • Matte Black & Emerald Design System
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Expense Tracker</h1>
          <p>Platform Engine v1.0.0</p>
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
          System Core v1.0.0
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <h2>{pageInfo[activeTab].title}</h2>
            <p>{pageInfo[activeTab].sub}</p>
          </div>
          <button
            onClick={() => setShowHelp(prev => !prev)}
            style={helpStyles.infoBtn(showHelp)}
            title="Help & Info"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>

        {showHelp && (
          <div style={helpStyles.accordionCard}>
            <div style={helpStyles.accordionHeader}>
              <h4 style={helpStyles.accordionTitle}>Help & Quick Guide</h4>
              <button onClick={() => setShowHelp(false)} style={helpStyles.closeBtn}>&times;</button>
            </div>
            <div style={helpStyles.accordionBody}>
              <p style={{ margin: "0 0 0.75rem", fontSize: 13, color: "#71717a" }}>
                <strong>Overview:</strong> {helpContent[activeTab].description}
              </p>
              <h5 style={helpStyles.subHeading}>How to Use:</h5>
              <ul style={helpStyles.list}>
                {helpContent[activeTab].steps.map((step, idx) => (
                  <li key={idx} style={helpStyles.listItem}>{step}</li>
                ))}
              </ul>
              <div style={helpStyles.tipBox}>
                <span style={{ fontWeight: 700, marginRight: 6 }}>💡 Pro Tip:</span>
                {helpContent[activeTab].tip}
              </div>
            </div>
          </div>
        )}

        <div className="page-body">

          {activeTab === "home" && (
            <>
              <div className="section-card">
                <div className="section-title">
                  {editTarget ? "Modify Entry" : "Post Transaction"}
                </div>
                <ExpenseForm
                  editTarget={editTarget}
                  onSave={(msg) => { setEditTarget(null); loadExpenses(); showSnackbar(msg || "Transaction recorded"); }}
                />
              </div>

              <div className="section-card">
                <div className="section-title">
                  Filters {activeFilterCount > 0 && (
                    <span style={{
                      background: "#10b981", color: "#fff", borderRadius: 10,
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
                  Transaction Ledger {expenses.length > 0 && (
                    <span style={{
                      background: "#e5e7eb", color: "#4b5563", borderRadius: 10,
                      padding: "1px 8px", fontSize: 11, marginLeft: 8, fontWeight: 600,
                      letterSpacing: 0
                    }}>
                      {expenses.length} {expenses.length === 1 ? "record" : "records"}
                    </span>
                  )}
                </div>
                {loading ? (
                  <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem 0" }}>Loading...</p>
                ) : (
                  <ExpenseList
                    expenses={expenses}
                    onEdit={(exp) => { setEditTarget(exp); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    onDelete={() => { loadExpenses(); showSnackbar("Record removed"); }}
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

const landingStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#09090b",
    color: "#ffffff",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif"
  },
  gridBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
    backgroundSize: "24px 24px",
    opacity: 0.25,
    zIndex: 1
  },
  card: {
    width: "100%",
    maxWidth: "800px",
    textAlign: "center",
    zIndex: 2,
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "3rem 2rem",
    backdropFilter: "blur(8px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)"
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    background: "#10b981",
    color: "#09090b",
    fontSize: "28px",
    fontWeight: 800,
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)"
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    marginBottom: "1rem",
    color: "#ffffff"
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#a1a1aa",
    maxWidth: "600px",
    margin: "0 auto 2.5rem",
    lineHeight: 1.5
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "1.25rem",
    marginBottom: "3rem",
    textAlign: "left"
  },
  feature: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "10px",
    padding: "1.25rem",
    transition: "border-color 0.15s ease"
  },
  featureIcon: {
    fontSize: "20px",
    marginBottom: "0.5rem"
  },
  featureTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: "0.25rem"
  },
  featureText: {
    fontSize: "12px",
    color: "#71717a",
    lineHeight: 1.4
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.8rem 2rem",
    background: "#10b981",
    color: "#09090b",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
    transition: "transform 0.15s ease, opacity 0.15s ease"
  },
  footer: {
    position: "absolute",
    bottom: "1.5rem",
    fontSize: "12px",
    color: "#52525b",
    zIndex: 2
  }
};

const helpContent = {
  home: {
    description: "Your primary financial ledger. Post, edit, filter, and track individual transaction records.",
    steps: [
      "Use 'Post Transaction' to log a merchant name, value, category, date, and note.",
      "Filter the ledger view by writing a keyword or selecting category/date ranges in the filter bar.",
      "Review the category Pie Chart at the bottom to visualize your spending breakdown."
    ],
    tip: "You can click the 'Edit' button next to any transaction to instantly load its contents into the form for correction."
  },
  insights: {
    description: "Advanced analytics suite featuring transaction stats, trend timelines, and target budget tracking.",
    steps: [
      "Establish a Monthly Budget Limit to activate the visual tracker.",
      "Switch between Day, Week, and Month views to trace short-term vs long-term spending patterns.",
      "Review the Budget Alerts and Finance Coach suggestions to maintain healthy cash flow habits."
    ],
    tip: "Set your budget goal to reflect realistic targets; our coach recommends keeping individual categories below 40% of total spend."
  },
  compare: {
    description: "Period comparison dashboard. Track variance and category budget deviations between any two months.",
    steps: [
      "Select Month A and Month B using the date inputs at the top.",
      "Review the total variance indicators to check if your outflows increased or decreased.",
      "Analyze the Category Outflow Comparison bar chart to trace which areas diverged the most."
    ],
    tip: "Emerald columns represent Month A spend, while Zinc columns represent Month B spend, making differences visible at a glance."
  }
};

const helpStyles = {
  infoBtn: (active) => ({
    background: active ? "rgba(16, 185, 129, 0.1)" : "#ffffff",
    border: `1px solid ${active ? "#10b981" : "#e4e4e7"}`,
    color: active ? "#10b981" : "#71717a",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
  }),
  accordionCard: {
    background: "#fafafa",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    borderLeft: "4px solid #10b981",
    padding: "1.25rem",
    marginBottom: "1.5rem",
    animation: "fadeIn 0.2s ease-out"
  },
  accordionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    borderBottom: "1px solid #f0f2f5",
    paddingBottom: "0.5rem"
  },
  accordionTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#09090b",
    margin: 0
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#a1a1aa",
    cursor: "pointer",
    lineHeight: 1
  },
  accordionBody: {
    fontSize: "13px",
    color: "#27272a"
  },
  subHeading: {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    color: "#71717a",
    margin: "0.75rem 0 0.4rem"
  },
  list: {
    paddingLeft: "1.25rem",
    margin: "0 0 0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem"
  },
  listItem: {
    fontSize: "13px",
    color: "#374151"
  },
  tipBox: {
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: "6px",
    padding: "0.65rem 0.75rem",
    fontSize: "12px",
    color: "#18181b",
    display: "flex",
    alignItems: "center"
  }
};

export default App;
