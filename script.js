const employees = [

{
    id:1,
    initials:"SN",
    name:"Sibongile Nkosi",
    role:"Software Engineer",
    department:"Development",
    avatarColor:"green",

    stats:{
        present:22,
        absent:2,
        late:2,
        leave:1
    },

    attendance:[
        "weekend","present","present","present","late","present","weekend",
        "present","present","present","present","present","weekend","weekend",
        "present","late","present","present","present","weekend","weekend",
        "present","leave","present","present","present","weekend","weekend",
        "present","present"
    ]
},

{
    id:2,
    initials:"LM",
    name:"Lungile Moyo",
    role:"HR Manager",
    department:"HR",
    avatarColor:"pink",

    stats:{
        present:21,
        absent:1,
        late:3,
        leave:1
    },

    attendance:[
        "weekend","present","present","late","present","present","weekend",
        "present","present","present","absent","present","weekend","weekend",
        "leave","present","present","late","present","weekend","weekend",
        "present","present","present","present","present","weekend","weekend",
        "present","present"
    ]
},

{
    id:3,
    initials:"TM",
    name:"Thabo Molefe",
    role:"Quality Analyst",
    department:"QA",
    avatarColor:"blue",

    stats:{
        present:23,
        absent:1,
        late:1,
        leave:1
    },

    attendance:[
        "weekend","present","present","present","present","present","weekend",
        "late","present","present","present","present","weekend","weekend",
        "present","present","present","leave","present","weekend","weekend",
        "present","present","present","present","absent","weekend","weekend",
        "present","present"
    ]
},

{
    id:4,
    initials:"KN",
    name:"Keshav Naidoo",
    role:"Sales Representative",
    department:"Sales",
    avatarColor:"orange",

    stats:{
        present:20,
        absent:3,
        late:2,
        leave:1
    },

    attendance:[
        "weekend","present","late","present","present","absent","weekend",
        "present","present","present","present","present","weekend","weekend",
        "leave","present","present","present","present","weekend","weekend",
        "present","absent","present","present","present","weekend","weekend",
        "late","present"
    ]
},

{
    id:5,
    initials:"ZK",
    name:"Zanele Khumalo",
    role:"Marketing Specialist",
    department:"Marketing",
    avatarColor:"purple",

    stats:{
        present:22,
        absent:1,
        late:2,
        leave:1
    },

    attendance:[
        "weekend","present","present","present","late","present","weekend",
        "present","present","present","present","present","weekend","weekend",
        "leave","present","present","present","late","weekend","weekend",
        "present","present","present","absent","present","weekend","weekend",
        "present","present"
    ]
},

{
    id:6,
    initials:"SZ",
    name:"Sipho Zulu",
    role:"UI/UX Designer",
    department:"Design",
    avatarColor:"yellow",

    stats:{
        present:21,
        absent:2,
        late:2,
        leave:1
    },

    attendance:[
        "weekend","present","present","late","present","present","weekend",
        "present","present","present","present","absent","weekend","weekend",
        "present","leave","present","present","present","weekend","weekend",
        "present","late","present","present","present","weekend","weekend",
        "present","present"
    ]
},

{
    id:7,
    initials:"NM",
    name:"Naledi Moeketsi",
    role:"DevOps Engineer",
    department:"IT",
    avatarColor:"cyan",

    stats:{
        present:23,
        absent:1,
        late:1,
        leave:1
    },

    attendance:[
        "weekend","present","present","present","present","present","weekend",
        "late","present","present","present","present","weekend","weekend",
        "leave","present","present","present","present","weekend","weekend",
        "present","present","present","present","absent","weekend","weekend",
        "present","present"
    ]
},

{
    id:8,
    initials:"FG",
    name:"Farai Gumbo",
    role:"Content Strategist",
    department:"Marketing",
    avatarColor:"green",

    stats:{
        present:20,
        absent:2,
        late:3,
        leave:2
    },

    attendance:[
        "weekend","present","late","present","present","present","weekend",
        "present","present","present","absent","present","weekend","weekend",
        "leave","present","present","late","present","weekend","weekend",
        "present","present","present","present","present","weekend","weekend",
        "leave","present"
    ]
},

{
    id:9,
    initials:"KD",
    name:"Karabo Dlamini",
    role:"Accountant",
    department:"Finance",
    avatarColor:"blue",

    stats:{
        present:22,
        absent:1,
        late:2,
        leave:1
    },

    attendance:[
        "weekend","present","present","present","late","present","weekend",
        "present","present","present","present","present","weekend","weekend",
        "leave","present","present","present","late","weekend","weekend",
        "present","present","present","absent","present","weekend","weekend",
        "present","present"
    ]
},

{
    id:10,
    initials:"FP",
    name:"Fatima Patel",
    role:"Customer Support Lead",
    department:"Support",
    avatarColor:"pink",

    stats:{
        present:21,
        absent:2,
        late:2,
        leave:1
    },

    attendance:[
        "weekend","present","present","late","present","present","weekend",
        "present","present","present","absent","present","weekend","weekend",
        "present","leave","present","present","present","weekend","weekend",
        "present","late","present","present","present","weekend","weekend",
        "present","present"
    ]
}

];

/* ==========================================================
   CURRENT EMPLOYEE
========================================================== */

let currentEmployee = employees[0];

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const employeeList = document.getElementById("employeeList");

const employeeName = document.getElementById("employeeName");

const employeeRole = document.getElementById("employeeRole");

const employeeAvatar = document.getElementById("employeeAvatar");

const calendar = document.getElementById("calendar");

const presentDays = document.getElementById("presentDays");

const absentDays = document.getElementById("absentDays");

const lateDays = document.getElementById("lateDays");

const leaveDays = document.getElementById("leaveDays");

/* ==========================================================
   PART 2 - RENDER EMPLOYEE LIST
========================================================== */

function renderEmployees() {

    employeeList.innerHTML = "";

    employees.forEach(employee => {

        const card = document.createElement("div");

        card.className =
            employee.id === currentEmployee.id
            ? "employee active"
            : "employee";

        card.innerHTML = `

            <div class="employee-avatar ${employee.avatarColor}">
                ${employee.initials}
            </div>

            <div class="employee-info">

                <h4>${employee.name}</h4>

                <p>${employee.role}</p>

            </div>

        `;

        card.addEventListener("click", () => {

            currentEmployee = employee;

            renderEmployees();

            updateDashboard();

        });

        employeeList.appendChild(card);

    });

}

/* ==========================================================
   UPDATE HEADER
========================================================== */

function updateHeader() {

    employeeName.textContent = currentEmployee.name;

    employeeRole.textContent =
        `${currentEmployee.role} • ${currentEmployee.department}`;

    employeeAvatar.textContent =
        currentEmployee.initials;

    employeeAvatar.className =
        `employee-avatar ${currentEmployee.avatarColor}`;

}

/* ==========================================================
   UPDATE ATTENDANCE CARDS
========================================================== */

function updateStats() {

    presentDays.textContent =
        currentEmployee.stats.present;

    absentDays.textContent =
        currentEmployee.stats.absent;

    lateDays.textContent =
        currentEmployee.stats.late;

    leaveDays.textContent =
        currentEmployee.stats.leave;

}

/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard() {

    updateHeader();

    updateStats();

    renderCalendar();

}

/* ==========================================================
   PART 3 - CALENDAR
========================================================== */

const daysInMonth = 30;

// June 2025 starts on Sunday (index 0)
const firstDay = 0;

function renderCalendar() {

    calendar.innerHTML = "";

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");

        empty.className = "day";

        calendar.appendChild(empty);

    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {

        const cell = document.createElement("div");

        const status =
            currentEmployee.attendance[day - 1];

        cell.className = `day ${status}`;

        cell.textContent = day;

        cell.title =
            `${currentEmployee.name} • ${status
                .charAt(0)
                .toUpperCase() + status.slice(1)}`;

        calendar.appendChild(cell);

    }

}

/* ==========================================================
   OPTIONAL - GET STATUS BY DAY
========================================================== */

function getAttendanceStatus(day) {

    return currentEmployee.attendance[day - 1];

}
/* ==========================================================
   PART 4 - INITIALIZE DASHBOARD
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    renderEmployees();

    updateDashboard();

});

/* ==========================================================
   OPTIONAL - FUTURE FEATURES
========================================================== */

// Placeholder for future functionality
// Examples:
// - Search employees
// - Filter by department
// - Previous/Next month
// - Attendance reports
// - Export to PDF