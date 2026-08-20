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
const previousMonthButton = document.getElementById("previousMonthButton");
const nextMonthButton = document.getElementById("nextMonthButton");
const attendanceTableBody = document.getElementById("attendanceTableBody");
const attendanceModal = document.getElementById("attendanceModal");
const attendanceForm = document.getElementById("attendanceForm");
const attendanceId = document.getElementById("attendanceId");
const attendanceEmployee = document.getElementById("attendanceEmployee");
const attendanceDate = document.getElementById("attendanceDate");
const attendanceStatus = document.getElementById("attendanceStatus");
const attendanceModalTitle = document.getElementById("attendanceModalTitle");
const addAttendanceButton = document.getElementById("addAttendanceButton");

const avatarColors = [
    "green", "pink", "blue", "orange", "purple",
    "yellow", "cyan", "green", "blue", "pink"
];

let employees = [];
let employeeDirectory = [];
let currentEmployee = null;
let displayYear;
let displayMonth;

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
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

function displayStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
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

    return latestDate
        ? new Date(latestDate + "T00:00:00")
        : new Date();
}

function createEmployees(records, directory) {
    const monthDate = attendanceMonth(records);
    displayYear = monthDate.getFullYear();
    displayMonth = monthDate.getMonth();

    const groupedEmployees = new Map();

    directory.forEach((employee, index) => {
        groupedEmployees.set(Number(employee.employee_id), {
            id: Number(employee.employee_id),
            initials: initialsFromName(employee.name),
            name: employee.name,
            role: employee.position,
            avatarColor: avatarColors[index % avatarColors.length],
            records: {}
        });
    });

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
        groupedEmployees.get(id).records[date] = {
            attendanceId: Number(record.attendance_id),
            date,
            status: normaliseStatus(record.status)
        };
    });

    return Array.from(groupedEmployees.values());
}

function employeeStats(employee) {
    const stats = { present: 0, absent: 0, late: 0, leave: 0 };

    Object.values(employee.records).forEach(record => {
        const entryDate = new Date(record.date + "T00:00:00");

        if (
            entryDate.getFullYear() === displayYear &&
            entryDate.getMonth() === displayMonth &&
            Object.hasOwn(stats, record.status)
        ) {
            stats[record.status]++;
        }
    });

    return stats;
}

function renderEmployees() {
    employeeList.innerHTML = "";

    employees.forEach(employee => {
        const card = document.createElement("button");
        card.type = "button";
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
        const record = currentEmployee.records[date];
        const status = record ? record.status : "weekend";

        cell.className = "day " + status;
        cell.textContent = day;
        cell.title = currentEmployee.name + " • " + displayStatus(status);

        calendar.appendChild(cell);
    }
}

function renderAttendanceRecords() {
    const records = Object.values(currentEmployee.records)
        .sort((first, second) => second.date.localeCompare(first.date));

    attendanceTableBody.innerHTML = "";

    if (records.length === 0) {
        attendanceTableBody.innerHTML =
            '<tr><td colspan="3" class="attendance-empty">No records for this employee.</td></tr>';
        return;
    }

    records.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML =
            '<td>' + record.date + '</td>' +
            '<td><span class="attendance-status ' + record.status + '">' +
                displayStatus(record.status) +
            '</span></td>' +
            '<td class="attendance-actions-cell">' +
                '<button type="button" class="attendance-edit-button">Edit</button>' +
                '<button type="button" class="attendance-delete-button">Delete</button>' +
            '</td>';

        row.querySelector(".attendance-edit-button").addEventListener("click", () => {
            openAttendanceModal(record);
        });

        row.querySelector(".attendance-delete-button").addEventListener("click", () => {
            deleteAttendance(record);
        });

        attendanceTableBody.appendChild(row);
    });
}

function updateDashboard() {
    updateHeader();
    updateStats();
    updatePeriod();
    renderCalendar();
    renderAttendanceRecords();
}

function changeMonth(offset) {
    const nextMonth = new Date(displayYear, displayMonth + offset, 1);

    displayYear = nextMonth.getFullYear();
    displayMonth = nextMonth.getMonth();
    updateDashboard();
}

function populateEmployeeOptions(selectedEmployeeId) {
    attendanceEmployee.innerHTML = "";

    employeeDirectory.forEach(employee => {
        const option = document.createElement("option");
        option.value = employee.employee_id;
        option.textContent = employee.name + " — " + employee.position;
        option.selected = Number(employee.employee_id) === Number(selectedEmployeeId);
        attendanceEmployee.appendChild(option);
    });
}

function openAttendanceModal(record) {
    const isEditing = Boolean(record);
    attendanceModalTitle.textContent = isEditing
        ? "Edit Attendance"
        : "Add Attendance";

    attendanceId.value = isEditing ? record.attendanceId : "";
    populateEmployeeOptions(currentEmployee.id);
    attendanceDate.value = isEditing
        ? record.date
        : formatDate(new Date(displayYear, displayMonth, 1));
    attendanceStatus.value = isEditing
        ? displayStatus(record.status)
        : "Present";

    attendanceModal.hidden = false;
    attendanceDate.focus();
}

function closeAttendanceModal() {
    attendanceModal.hidden = true;
    attendanceForm.reset();
}

async function submitAttendance(event) {
    event.preventDefault();

    const recordId = attendanceId.value;
    const payload = {
        employee_id: Number(attendanceEmployee.value),
        attendance_date: attendanceDate.value,
        status: attendanceStatus.value
    };

    try {
        const response = await fetch(
            API_BASE_URL + "/attendance" + (recordId ? "/" + recordId : ""),
            {
                method: recordId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to save attendance");
        }

        const selectedEmployeeId = payload.employee_id;
        closeAttendanceModal();
        await loadAttendance(selectedEmployeeId);
    } catch (error) {
        console.error("Attendance save error:", error);
        alert(error.message || "Failed to save attendance.");
    }
}

async function deleteAttendance(record) {
    const confirmed = window.confirm(
        "Delete the attendance record for " + record.date + "?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            API_BASE_URL + "/attendance/" + record.attendanceId,
            { method: "DELETE" }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete attendance");
        }

        await loadAttendance(currentEmployee.id);
    } catch (error) {
        console.error("Attendance delete error:", error);
        alert(error.message || "Failed to delete attendance.");
    }
}

async function loadAttendance(selectedEmployeeId) {
    try {
        const responses = await Promise.all([
            fetch(API_BASE_URL + "/attendance"),
            fetch(API_BASE_URL + "/employees")
        ]);

        if (!responses[0].ok || !responses[1].ok) {
            throw new Error("Failed to load attendance data");
        }

        const records = await responses[0].json();
        employeeDirectory = await responses[1].json();
        employees = createEmployees(records, employeeDirectory);

        if (employees.length === 0) {
            throw new Error("No employees found");
        }

        currentEmployee = employees.find(employee =>
            employee.id === Number(selectedEmployeeId)
        ) || employees[0];

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

document.addEventListener("DOMContentLoaded", () => {
    addAttendanceButton.addEventListener("click", () => {
        openAttendanceModal();
    });

    previousMonthButton.addEventListener("click", () => {
        changeMonth(-1);
    });

    nextMonthButton.addEventListener("click", () => {
        changeMonth(1);
    });

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", closeAttendanceModal);
    });

    attendanceForm.addEventListener("submit", submitAttendance);
    loadAttendance();
});
