const API_BASE_URL = window.location.origin;

const employeeList = document.getElementById("employeeList");
const employeeName = document.getElementById("employeeName");
const employeeRole = document.getElementById("employeeRole");
const employeeAvatar = document.getElementById("employeeAvatar");
const calendar = document.getElementById("calendar");
const presentDays = document.getElementById("presentDays");
const absentDays = document.getElementById("absentDays");
const lateDays = document.getElementById("lateDays");
const leaveDays = document.getElementById("leaveDays");
const attendancePeriod = document.querySelector(".page-header p");
const calendarTitle = document.querySelector(".calendar-title");

const avatarColors = [
    "green", "pink", "blue", "orange", "purple",
    "yellow", "cyan", "green", "blue", "pink"
];

let employees = [];
let currentEmployee = null;
let displayYear;
let displayMonth;

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

function normaliseStatus(status) {
    const value = String(status || "").trim().toLowerCase();

    if (value === "on leave") {
        return "leave";
    }

    return ["present", "absent", "late", "leave"].includes(value)
        ? value
        : "weekend";
}

function initialsFromName(name) {
    return String(name || "")
        .split(" ")
        .filter(Boolean)
        .map(part => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function attendanceMonth(records) {
    const dates = records
        .map(record => String(record.attendance_date || "").slice(0, 10))
        .filter(Boolean)
        .sort();

    const latestDate = dates[dates.length - 1];

    if (!latestDate) {
        return new Date();
    }

    return new Date(latestDate + "T00:00:00");
}

function createEmployees(records) {
    const monthDate = attendanceMonth(records);

    displayYear = monthDate.getFullYear();
    displayMonth = monthDate.getMonth();

    const groupedEmployees = new Map();

    records.forEach(record => {
        const id = Number(record.employee_id);

        if (!groupedEmployees.has(id)) {
            groupedEmployees.set(id, {
                id,
                initials: initialsFromName(record.name),
                name: record.name,
                role: record.position,
                avatarColor: avatarColors[groupedEmployees.size % avatarColors.length],
                records: {}
            });
        }

        const date = String(record.attendance_date || "").slice(0, 10);
        groupedEmployees.get(id).records[date] = normaliseStatus(record.status);
    });

    return Array.from(groupedEmployees.values());
}

function employeeStats(employee) {
    const stats = {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0
    };

    Object.entries(employee.records).forEach(([date, status]) => {
        const entryDate = new Date(date + "T00:00:00");

        if (
            entryDate.getFullYear() === displayYear &&
            entryDate.getMonth() === displayMonth &&
            Object.hasOwn(stats, status)
        ) {
            stats[status]++;
        }
    });

    return stats;
}

function renderEmployees() {
    employeeList.innerHTML = "";

    employees.forEach(employee => {
        const card = document.createElement("div");

        card.className = employee.id === currentEmployee.id
            ? "employee active"
            : "employee";

        card.innerHTML =
            '<div class="employee-avatar ' + employee.avatarColor + '">' +
                employee.initials +
            '</div>' +
            '<div class="employee-info">' +
                '<h4>' + employee.name + '</h4>' +
                '<p>' + employee.role + '</p>' +
            '</div>';

        card.addEventListener("click", () => {
            currentEmployee = employee;
            renderEmployees();
            updateDashboard();
        });

        employeeList.appendChild(card);
    });
}

function updateHeader() {
    employeeName.textContent = currentEmployee.name;
    employeeRole.textContent = currentEmployee.role;
    employeeAvatar.textContent = currentEmployee.initials;
    employeeAvatar.className = "employee-avatar " + currentEmployee.avatarColor;
}

function updateStats() {
    const stats = employeeStats(currentEmployee);

    presentDays.textContent = stats.present;
    absentDays.textContent = stats.absent;
    lateDays.textContent = stats.late;
    leaveDays.textContent = stats.leave;
}

function updatePeriod() {
    const monthDate = new Date(displayYear, displayMonth, 1);
    const label = monthDate.toLocaleDateString("en-ZA", {
        month: "long",
        year: "numeric"
    });

    attendancePeriod.textContent =
        label + " — Tracking " + employees.length + " employee" +
        (employees.length === 1 ? "" : "s");

    calendarTitle.textContent = label.toUpperCase() + " CALENDAR";
}

function renderCalendar() {
    calendar.innerHTML = "";

    const firstDay = new Date(displayYear, displayMonth, 1).getDay();
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

    for (let index = 0; index < firstDay; index++) {
        const empty = document.createElement("div");
        empty.className = "day";
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        const date = formatDate(new Date(displayYear, displayMonth, day));
        const status = currentEmployee.records[date] || "weekend";

        cell.className = "day " + status;
        cell.textContent = day;
        cell.title =
            currentEmployee.name + " • " +
            status.charAt(0).toUpperCase() + status.slice(1);

        calendar.appendChild(cell);
    }
}

function updateDashboard() {
    updateHeader();
    updateStats();
    updatePeriod();
    renderCalendar();
}

async function loadAttendance() {
    try {
        const response = await fetch(API_BASE_URL + "/attendance");

        if (!response.ok) {
            throw new Error("Failed to load attendance");
        }

        const records = await response.json();
        employees = createEmployees(records);

        if (employees.length === 0) {
            throw new Error("No attendance records found");
        }

        currentEmployee = employees[0];
        renderEmployees();
        updateDashboard();
    } catch (error) {
        console.error("Attendance loading error:", error);
        attendancePeriod.textContent =
            "Unable to load attendance records. Start the backend and try again.";
        employeeList.innerHTML =
            '<p class="empty-state">No attendance data available.</p>';
    }
}

document.addEventListener("DOMContentLoaded", loadAttendance);
