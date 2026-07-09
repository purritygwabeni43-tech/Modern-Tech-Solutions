/*
leave.js — Apply for Leave page
Handles the leave form: counts the days, validates the input,
and adds each submitted request to the "Recent requests" list.
================================================================= */

const $ = (id) => document.getElementById(id);

const TYPE_COLORS = {
  "Annual Leave": "#2563eb",
  "Sick Leave": "#10b981",
  "Family Responsibility": "#7c3aed",
  "Maternity / Paternity": "#ec4899",
  "Study Leave": "#0891b2",
  "Unpaid Leave": "#ef4444"
};

let requests = loadRequests();

function parseDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function countDays(start, end) {
  const s = parseDate(start);
  const e = parseDate(end);

  if (!s || !e) return 0;

  const diff = (e - s) / (1000 * 60 * 60 * 24);
  return diff < 0 ? 0 : diff + 1;
}

function showMessage(text, ok) {
  const box = $("formMsg");
  if (!box) return;
  box.textContent = text;
  box.hidden = !text;
  box.className = `form-msg ${ok ? "success" : "error"}`;
}

function clearMessage() {
  showMessage("", true);
}

function formatDate(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function renderRequests() {
  const list = $("requestList");
  if (!list) return;

  if (requests.length === 0) {
    list.innerHTML = '<p class="empty">No leave requests yet. Your next request will appear here.</p>';
    return;
  }

  list.innerHTML = requests.map((r) => `
    <div class="request-item">
      <div class="request-top">
        <div>
          <strong>${r.name}</strong>
          <div class="request-meta">${r.dept || "Unassigned"}</div>
        </div>
        <span class="request-status ${String(r.status || "Pending").toLowerCase()}">${r.status || "Pending"}</span>
      </div>
      <span class="request-type" style="background:${TYPE_COLORS[r.type] || "#64748b"}">${r.type}</span>
      <div class="request-dates">${formatDate(r.start)} → ${formatDate(r.end)} · ${r.days} day(s)</div>
      ${r.reason ? `<div class="request-reason">${r.reason}</div>` : ""}
      <div class="request-actions">
        <button class="btn-approve" data-action="approve" data-index="${requests.indexOf(r)}">Approve</button>
        <button class="btn-deny" data-action="deny" data-index="${requests.indexOf(r)}">Deny</button>
      </div>
    </div>
  `).join("");
}

function updateRequestStatus(index, status) {
  if (!requests[index]) return;
  requests[index].status = status;
  saveRequests();
  renderRequests();
}

function updateDays() {
  const daysField = $("days");
  const start = $("startDate").value;
  const end = $("endDate").value;
  const days = countDays(start, end);

  if (daysField) {
    daysField.value = days;
  }

  if (start && end && days === 0 && end < start) {
    showMessage("The end date must be on or after the start date.", false);
  }
}

function saveRequests() {
  try {
    localStorage.setItem("mt-leave-requests", JSON.stringify(requests));
  } catch (err) {
    console.warn("Unable to save leave requests", err);
  }
}

function loadRequests() {
  try {
    const saved = JSON.parse(localStorage.getItem("mt-leave-requests"));
    if (Array.isArray(saved)) return saved;
  } catch (err) {
    console.warn("Unable to load leave requests", err);
  }

  return [
    { name: "Thabo Molefe", dept: "Engineering", type: "Annual Leave", start: "2025-06-16", end: "2025-06-20", days: 5, reason: "Family trip", status: "Approved" },
    { name: "Zanele Khumalo", dept: "Marketing", type: "Sick Leave", start: "2025-06-09", end: "2025-06-09", days: 1, reason: "Doctor's appointment", status: "Pending" }
  ];
}

function initLeavePage() {
  const form = $("leaveForm");
  const startDate = $("startDate");
  const endDate = $("endDate");

  if (!form || !startDate || !endDate) return;

  updateDays();
  renderRequests();

  startDate.addEventListener("change", updateDays);
  endDate.addEventListener("change", updateDays);

  ["input", "change"].forEach((eventName) => {
    [$("empName"), $("department"), $("leaveType"), $("reason"), startDate, endDate].forEach((field) => {
      if (field) field.addEventListener(eventName, clearMessage);
    });
  });

  $("requestList").addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;
    updateRequestStatus(index, action === "approve" ? "Approved" : "Denied");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = $("empName").value.trim();
    const dept = $("department").value;
    const type = $("leaveType").value;
    const start = $("startDate").value;
    const end = $("endDate").value;
    const reason = $("reason").value.trim();
    const days = countDays(start, end);

    if (!name || !dept || !type || !start || !end) {
      showMessage("Please fill in all the required fields.", false);
      return;
    }

    if (days <= 0) {
      showMessage("The end date must be on or after the start date.", false);
      return;
    }

    requests.unshift({ name, dept, type, start, end, days, reason, status: "Pending" });
    saveRequests();
    renderRequests();

    showMessage(`Leave request submitted for ${name} (${days} day(s)).`, true);
    form.reset();
    updateDays();
  });
}

document.addEventListener("DOMContentLoaded", initLeavePage);