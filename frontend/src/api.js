const BASE = "http://localhost:3000";

export const getExpenses = (filters = {}) =>
  fetch(`${BASE}/expenses?${new URLSearchParams(filters)}`).then(r => r.json());

export const addExpense = (data) =>
  fetch(`${BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const editExpense = (id, data) =>
  fetch(`${BASE}/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const delExpense = (id) =>
  fetch(`${BASE}/expenses/${id}`, { method: "DELETE" }).then(r => r.json());

export const getSummary = (month) =>
  fetch(`${BASE}/summary?month=${month}`).then(r => r.json());

export const getInsights = (month) =>
  fetch(`${BASE}/insights?month=${month}`).then(r => r.json());

export const getCompare = (monthA, monthB) =>
  fetch(`${BASE}/compare?month_a=${monthA}&month_b=${monthB}`).then(r => r.json());
