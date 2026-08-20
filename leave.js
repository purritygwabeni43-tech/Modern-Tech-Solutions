
// ========================================
// CURRENT USER
// ========================================

// Frontend testing only.
// We are pretending that an HR user is logged in.
const currentUser = {
    name: "Lungile Moyo",
    role: "HR"
};

const API_BASE_URL = window.location.origin;


// ========================================
// EMPLOYEE DATA
// ========================================

let employees = [
    {
         employee_id: 1,
        name: "Sibongile Nkosi",
        position: "Software Engineer",
        initials: "SN"
    },
    {
        employee_id: 2,
        name: "Lungile Moyo",
        position: "HR Manager",
        initials: "LM"
    },
    {
        employee_id: 3,
        name: "Thabo Molefe",
        position: "Quality Analyst",
        initials: "TM"
    },
    {
        employee_id: 4,
        name: "Keshav Naidoo",
        position: "Sales Representative",
        initials: "KN"
    },
    {
        employee_id: 5,
        name: "Zanele Khumalo",
        position: "Marketing Specialist",
        initials: "ZK"
    },
    {
        employee_id: 6,
        name: "Sipho Zulu",
        position: "UI/UX Designer",
        initials: "SZ"
    },
    {
        employee_id: 7,
        name: "Naledi Moeketsi",
        position: "DevOps Engineer",
        initials: "NM"
    },
    {
        employee_id: 8,
        name: "Farai Gumbo",
        position: "Project Manager",
        initials: "FG"
    },
    {
        employee_id: 9,
        name: "Amanda Dlamini",
        position: "Financial Analyst",
        initials: "AD"
    },
    {
        employee_id: 10,
        name: "Mpho Ndlovu",
        position: "Backend Developer",
        initials: "MN"
    }
];


// ========================================
// ELEMENTS
// ========================================

const employeeSearch =
    document.getElementById("employeeSearch");

const employeeResults =
    document.getElementById("employeeResults");

const selectedEmployee =
    document.getElementById("selectedEmployee");

const requestSearch =
    document.getElementById("requestSearch");

const statusFilter =
    document.getElementById("statusFilter");

const leaveTableBody =
    document.getElementById("leaveTableBody");

const resultCount =
    document.getElementById("resultCount");

const leaveForm =
    document.getElementById("leaveForm");

async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`);

        if (!response.ok) {
            throw new Error("Failed to fetch employees");
        }

        const employeeData = await response.json();

        employees = employeeData.map(employee => ({
            employee_id: employee.employee_id,
            name: employee.name,
            position: employee.position,
            initials: employee.name
                .split(" ")
                .map(name => name[0])
                .join("")
                .substring(0, 2)
        }));
    } catch (error) {
        console.error("Error loading employees:", error);
    }
}


// ========================================
// EMPLOYEE SEARCH
// ========================================

function displayEmployees(searchTerm = "") {

    employeeResults.innerHTML = "";

    const filteredEmployees = employees.filter(employee =>
        employee.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );


    // No employee found
    if (filteredEmployees.length === 0) {

        employeeResults.innerHTML = `
            <div class="no-results">
                No employee found
            </div>
        `;

        employeeResults.classList.add("show");

        return;
    }


    // Display employees
    filteredEmployees.forEach(employee => {

        const option = document.createElement("div");

        option.classList.add("employee-option");

        option.innerHTML = `
            <div class="employee-option-avatar">
                ${employee.initials}
            </div>

            <div>
                <strong>${employee.name}</strong>
                <small>${employee.position}</small>
            </div>
        `;


        // Select employee
        option.addEventListener("click", () => {

            employeeSearch.value = employee.name;

            selectedEmployee.value = employee.employee_id;

            employeeResults.classList.remove("show");

        });


        employeeResults.appendChild(option);

    });


    employeeResults.classList.add("show");
}


// Search while typing
employeeSearch.addEventListener("input", () => {

    displayEmployees(employeeSearch.value);

});


// Show employees when clicking search box
employeeSearch.addEventListener("focus", () => {

    displayEmployees(employeeSearch.value);

});


// Close employee results when clicking elsewhere
document.addEventListener("click", (event) => {

    if (!event.target.closest(".employee-field")) {

        employeeResults.classList.remove("show");

    }

});


// ========================================
// REQUEST TABLE SEARCH + FILTER
// ========================================

function filterRequests() {

    const searchValue =
        requestSearch.value.toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const rows =
        leaveTableBody.querySelectorAll("tr");

    let visibleRows = 0;


    rows.forEach(row => {

        const rowText =
            row.textContent.toLowerCase();

        const statusElement =
            row.querySelector(".status");

        const rowStatus =
            statusElement
                ? statusElement.textContent.trim()
                : "";


        const matchesSearch =
            rowText.includes(searchValue);

        const matchesStatus =
            selectedStatus === "all" ||
            rowStatus === selectedStatus;


        if (matchesSearch && matchesStatus) {

            row.style.display = "";

            visibleRows++;

        } else {

            row.style.display = "none";

        }

    });


    resultCount.textContent =
        `Showing ${visibleRows} request${visibleRows === 1 ? "" : "s"}`;

}


// Search requests
requestSearch.addEventListener(
    "input",
    filterRequests
);


// Filter by status
statusFilter.addEventListener(
    "change",
    filterRequests
);


// ========================================
// LEAVE FORM
// ========================================

leaveForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const employee =
        selectedEmployee.value;

    const leaveType =
        document.getElementById("leaveType").value;

    const startDate =
        document.getElementById("startDate").value;

    const endDate =
        document.getElementById("endDate").value;

    const reason =
        document.getElementById("reason").value.trim();


    // ====================================
    // VALIDATION
    // ====================================

    if (!employee) {

        alert("Please search for and select an employee.");

        employeeSearch.focus();

        return;
    }


    if (!leaveType) {

        alert("Please select a leave type.");

        return;
    }


    if (!startDate) {

        alert("Please select a start date.");

        return;
    }


    if (!endDate) {

        alert("Please select an end date.");

        return;
    }


    if (endDate < startDate) {

        alert("End date cannot be before the start date.");

        return;
    }


    if (!reason) {

        alert("Please enter a reason for the leave request.");

        return;
    }


// ====================================
// SEND LEAVE REQUEST TO BACKEND
// ====================================

const combinedReason =
    `${leaveType} | End Date: ${endDate} | ${reason}`;

try {

    const response = await fetch(
        `${API_BASE_URL}/leave-requests`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                employee_id: employee,
                leave_date: startDate,
                reason: combinedReason
            })
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.error || "Failed to create leave request"
        );

    }


    alert(
        `Leave request created successfully for ${employee}.`
    );


    // Reset form
    leaveForm.reset();

    selectedEmployee.value = "";

    await loadLeaveRequests();


} catch (error) {

    console.error("Leave request error:", error);

    alert(
        "Failed to create leave request. Please try again."
    );

}

});


// ========================================
// LOAD LEAVE REQUESTS FROM DATABASE
// ========================================

async function loadLeaveRequests() {

    try {

        // Get leave requests
        const leaveResponse = await fetch(
            `${API_BASE_URL}/leave-requests`
        );

        if (!leaveResponse.ok) {
            throw new Error("Failed to fetch leave requests");
        }

        const requests = await leaveResponse.json();


        // Clear current table
        leaveTableBody.innerHTML = "";


        // Create table rows
        requests.forEach(request => {

            // Employee information
            const employeeName =
                request.name || "Unknown Employee";

            const employeePosition =
                request.position || "";


            // Get leave type
            const reasonText = request.reason || "";
            const leaveType = reasonText.split(" | ")[0] || "-";


            // Get end date
            const endDateMatch =
                reasonText.match(/End Date: ([^|]+)/);

            const endDate =
                endDateMatch
                    ? endDateMatch[1].trim()
                    : "-";


            // Get actual reason
            const reasonParts =
                reasonText.split(" | ");

            const actualReason =
                reasonParts.slice(2).join(" | ") || "-";


            // Create row
            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="employee-cell">

                        <div class="employee-avatar blue-avatar">
                            ${employeeName
                                .split(" ")
                                .map(name => name[0])
                                .join("")
                                .substring(0, 2)}
                        </div>

                        <div>

                            <strong>
                                ${employeeName}
                            </strong>

                            <small>
                                ${employeePosition}
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${leaveType}
                </td>


                <td>
                    ${request.leave_date}
                </td>


                <td>
                    ${endDate}
                </td>


                <td>
                    ${actualReason}
                </td>


                <td>

                    <span class="status ${request.status.toLowerCase()}">
                        ${request.status}
                    </span>

                </td>


                <td>${request.leave_date}</td>


                <td class="action-cell">
                    ${request.status === "Pending" && currentUser.role === "HR"
                        ? `<button class="approve-btn" data-status="Approved">\n                            <i class="fa-solid fa-check"></i> Accept\n                           </button>\n                           <button class="decline-btn" data-status="Denied">\n                            <i class="fa-solid fa-xmark"></i> Decline\n                           </button>`
                        : "-"}
                </td>

            `;


            leaveTableBody.appendChild(row);

            row.querySelectorAll("[data-status]").forEach(button => {
                button.addEventListener("click", async () => {
                    await updateLeaveStatus(request.leave_id, button.dataset.status);
                });
            });

        });

        filterRequests();


    } catch (error) {

        console.error(
            "Error loading leave requests:",
            error
        );

    }

}

async function updateLeaveStatus(leaveId, status) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/leave-requests/${leaveId}/status`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to update leave request");
        }

        await loadLeaveRequests();
    } catch (error) {
        console.error("Leave status update error:", error);
        alert("Failed to update the leave request. Please try again.");
    }
}

async function initializeLeavePage() {
    await loadEmployees();
    await loadLeaveRequests();
}

initializeLeavePage();
