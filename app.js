// ========================================
// COMPANY EXPENSE APP
// ========================================


// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://kdabddhuxypcihlbubzi.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nkJMnNS4PSIQlNfGvXh7Gg_k9C7X9TA";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ========================================
// CURRENCY
// ========================================

const CURRENCY = "SAR";


// ========================================
// SIGN UP
// ========================================

async function signup() {

    const name =
        document.getElementById("name")?.value.trim();

    const email =
        document.getElementById("email")?.value.trim();

    const password =
        document.getElementById("password")?.value;

    const department =
        document
            .getElementById("department")
            ?.value.trim();

    const message =
        document.getElementById("signupMessage");


    if (!name || !email || !password) {

        if (message) {

            message.textContent =
                "Please fill in all required fields.";

        }

        return;
    }


    if (password.length < 6) {

        if (message) {

            message.textContent =
                "Password must be at least 6 characters.";

        }

        return;
    }


    if (message) {

        message.textContent =
            "Creating account...";

    }


    const {
        data,
        error
    } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {

                    name: name,

                    department: department

                }

            }

        });


    if (error) {

        console.error(
            "Signup error:",
            error
        );

        if (message) {

            message.textContent =
                error.message;

        }

        return;
    }


    if (message) {

        if (data.session) {

            message.textContent =
                "Account created successfully. Redirecting...";


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1000);

        } else {

            message.textContent =
                "Account created. Please verify your email before logging in.";

        }

    }

}


// ========================================
// LOGIN
// ========================================

async function login() {

    const email =
        document
            .getElementById("email")
            ?.value.trim();

    const password =
        document
            .getElementById("password")
            ?.value;

    const message =
        document.getElementById("loginMessage");


    if (!email || !password) {

        if (message) {

            message.textContent =
                "Please enter your email and password.";

        }

        return;
    }


    if (message) {

        message.textContent =
            "Logging in...";

    }


    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        console.error(
            "Login error:",
            error
        );

        if (message) {

            message.textContent =
                error.message;

        }

        return;
    }


    console.log(
        "Logged in:",
        data.user
    );


    if (message) {

        message.textContent =
            "Login successful. Redirecting...";

    }


    setTimeout(() => {

        window.location.href =
            "dashboard.html";

    }, 500);

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Logout error:",
            error
        );

        return;
    }


    window.location.href =
        "index.html";

}


// ========================================
// LOAD CURRENT USER
// ========================================

async function loadUser() {

    const {
        data: {
            user
        },
        error
    } =
        await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "index.html";

        return null;

    }


    console.log(
        "Logged in user:",
        user
    );


    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


    if (profileError) {

        console.error(
            "Profile error:",
            profileError
        );

        return user;

    }


    console.log(
        "Profile:",
        profile
    );


    const userInfo =
        document.getElementById("userInfo");


    if (userInfo) {

        userInfo.innerHTML = `

            <h2>
                ${escapeHtml(profile.name)}
            </h2>

            <p>
                <strong>Employee ID:</strong>
                ${escapeHtml(profile.employee_id)}
            </p>

            <p>
                <strong>Department:</strong>
                ${escapeHtml(
                    profile.department ||
                    "Not specified"
                )}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHtml(profile.email)}
            </p>

        `;

    }


    return user;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// DASHBOARD STATISTICS
// ========================================

async function loadDashboardStats() {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !user
    ) {

        window.location.href =
            "index.html";

        return;

    }


    const {
        data: expenses,
        error
    } =
        await supabaseClient
            .from("expenses")
            .select(
                "amount, expense_type"
            );


    if (error) {

        console.error(
            "Dashboard expenses error:",
            error
        );

        return;

    }


    let totalAmount = 0;

    let companyAmount = 0;

    let personalAmount = 0;

    let roomAmount = 0;


    expenses.forEach(
        expense => {

            const amount =
                Number(
                    expense.amount
                ) || 0;


            totalAmount += amount;


            if (
                expense.expense_type ===
                "Company"
            ) {

                companyAmount += amount;

            }


            if (
                expense.expense_type ===
                "Personal"
            ) {

                personalAmount += amount;

            }


            if (
                expense.expense_type ===
                "Room Expense"
            ) {

                roomAmount += amount;

            }

        }
    );


    const totalAmountEl =
        document.getElementById(
            "totalAmount"
        );


    const companyAmountEl =
        document.getElementById(
            "companyAmount"
        );


    const personalAmountEl =
        document.getElementById(
            "personalAmount"
        );


    const roomAmountEl =
        document.getElementById(
            "roomAmount"
        );


    if (totalAmountEl) {

        totalAmountEl.textContent =
            CURRENCY +
            " " +
            totalAmount.toFixed(2);

    }


    if (companyAmountEl) {

        companyAmountEl.textContent =
            CURRENCY +
            " " +
            companyAmount.toFixed(2);

    }


    if (personalAmountEl) {

        personalAmountEl.textContent =
            CURRENCY +
            " " +
            personalAmount.toFixed(2);

    }


    if (roomAmountEl) {

        roomAmountEl.textContent =
            CURRENCY +
            " " +
            roomAmount.toFixed(2);

    }

}


// ========================================
// ADD EXPENSE
// ========================================

async function addExpense() {

    console.log(
        "addExpense() started"
    );


    const source =
        document
            .getElementById("source")
            ?.value.trim();


    const amount =
        document
            .getElementById("amount")
            ?.value;


    const forWhat =
        document
            .getElementById("forWhat")
            ?.value.trim();


    const expenseType =
        document
            .getElementById("expenseType")
            ?.value;


    const expenseDate =
        document
            .getElementById("expenseDate")
            ?.value;


    const message =
        document.getElementById(
            "expenseMessage"
        );


    const saveButton =
        document.getElementById(
            "saveExpenseButton"
        );


    // ====================================
    // VALIDATION
    // ====================================

    if (
        !source ||
        !amount ||
        !forWhat ||
        !expenseType ||
        !expenseDate
    ) {

        if (message) {

            message.textContent =
                "Please fill in all fields.";

        }

        return;

    }


    const numericAmount =
        Number(amount);


    if (
        isNaN(numericAmount) ||
        numericAmount <= 0
    ) {

        if (message) {

            message.textContent =
                "Please enter a valid amount.";

        }

        return;

    }


    const allowedTypes = [

        "Company",

        "Personal",

        "Room Expense"

    ];


    if (
        !allowedTypes.includes(
            expenseType
        )
    ) {

        if (message) {

            message.textContent =
                "Invalid expense type.";

        }

        return;

    }


    // ====================================
    // GET LOGGED-IN USER
    // ====================================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !user
    ) {

        if (message) {

            message.textContent =
                "Your session has expired. Please login again.";

        }


        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1500);


        return;

    }


    // ====================================
    // DISABLE BUTTON
    // ====================================

    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Saving...";

    }


    if (message) {

        message.textContent =
            "Saving expense...";

    }


    // ====================================
    // INSERT EXPENSE
    // ====================================

    const {
        data,
        error
    } =
        await supabaseClient
            .from("expenses")
            .insert([{

                user_id:
                    user.id,

                source:
                    source,

                amount:
                    numericAmount,

                for_what:
                    forWhat,

                expense_type:
                    expenseType,

                expense_date:
                    expenseDate

            }])
            .select()
            .single();


    // ====================================
    // ERROR
    // ====================================

    if (error) {

        console.error(
            "Add expense error:",
            error
        );


        if (message) {

            message.textContent =
                "Error: " +
                error.message;

        }


        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Expense";

        }


        return;

    }


    console.log(
        "Expense added:",
        data
    );


    // ====================================
    // SUCCESS
    // ====================================

    if (message) {

        message.textContent =
            "Expense added successfully!";

    }


    // Clear form

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (form) {

        form.reset();

    }


    // ====================================
    // REDIRECT
    // ====================================

    setTimeout(() => {

        window.location.href =
            "dashboard.html";

    }, 1000);

}


// ========================================
// LOAD ALL EXPENSES
// ========================================

async function loadAllExpenses() {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !user
    ) {

        window.location.href =
            "index.html";

        return;

    }


    const {
        data: expenses,
        error
    } =
        await supabaseClient
            .from("expenses")
            .select(`
                id,
                user_id,
                source,
                amount,
                for_what,
                expense_type,
                expense_date,
                created_at,
                profiles (
                    employee_id,
                    name
                )
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "All expenses error:",
            error
        );

        return;

    }


    const tableBody =
        document.getElementById(
            "expensesTableBody"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    if (
        !expenses ||
        expenses.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;"
                >
                    No expenses found.
                </td>

            </tr>

        `;

        return;

    }


    expenses.forEach(
        expense => {

            const row =
                document.createElement(
                    "tr"
                );


            // Employee ID

            const employeeCell =
                document.createElement(
                    "td"
                );

            employeeCell.textContent =
                expense.profiles?.employee_id ||
                "N/A";


            // Name

            const nameCell =
                document.createElement(
                    "td"
                );

            nameCell.textContent =
                expense.profiles?.name ||
                "Unknown";


            // Source

            const sourceCell =
                document.createElement(
                    "td"
                );

            sourceCell.textContent =
                expense.source;


            // Amount

            const amountCell =
                document.createElement(
                    "td"
                );

            amountCell.textContent =
                CURRENCY +
                " " +
                Number(
                    expense.amount
                ).toFixed(2);


            // For What

            const forWhatCell =
                document.createElement(
                    "td"
                );

            forWhatCell.textContent =
                expense.for_what;


            // Expense Type

            const typeCell =
                document.createElement(
                    "td"
                );

            typeCell.textContent =
                expense.expense_type;


            // Date

            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.textContent =
                formatDate(
                    expense.expense_date ||
                    expense.created_at
                );


            // Created Time

            const createdCell =
                document.createElement(
                    "td"
                );

            createdCell.textContent =
                formatDateTime(
                    expense.created_at
                );


            row.appendChild(
                employeeCell
            );

            row.appendChild(
                nameCell
            );

            row.appendChild(
                sourceCell
            );

            row.appendChild(
                amountCell
            );

            row.appendChild(
                forWhatCell
            );

            row.appendChild(
                typeCell
            );

            row.appendChild(
                dateCell
            );

            row.appendChild(
                createdCell
            );


            tableBody.appendChild(
                row
            );

        }
    );

}


// ========================================
// LOAD MY EXPENSES
// ========================================

async function loadMyExpenses() {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !user
    ) {

        window.location.href =
            "index.html";

        return;

    }


    const {
        data: expenses,
        error
    } =
        await supabaseClient
            .from("expenses")
            .select("*")
            .eq(
                "user_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "My expenses error:",
            error
        );

        return;

    }


    const tableBody =
        document.getElementById(
            "myExpensesTableBody"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    if (
        !expenses ||
        expenses.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    No expenses found.
                </td>

            </tr>

        `;

        return;

    }


    expenses.forEach(
        expense => {

            const row =
                document.createElement(
                    "tr"
                );


            // Source

            const sourceCell =
                document.createElement(
                    "td"
                );

            sourceCell.textContent =
                expense.source;


            // Amount

            const amountCell =
                document.createElement(
                    "td"
                );

            amountCell.textContent =
                CURRENCY +
                " " +
                Number(
                    expense.amount
                ).toFixed(2);


            // For What

            const forWhatCell =
                document.createElement(
                    "td"
                );

            forWhatCell.textContent =
                expense.for_what;


            // Expense Type

            const typeCell =
                document.createElement(
                    "td"
                );

            typeCell.textContent =
                expense.expense_type;


            // Date

            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.textContent =
                formatDate(
                    expense.expense_date ||
                    expense.created_at
                );


            // Edit

            const editCell =
                document.createElement(
                    "td"
                );


            const editButton =
                document.createElement(
                    "button"
                );


            editButton.textContent =
                "Edit";


            editButton.className =
                "header-button";


            editButton.onclick =
                () =>
                    editExpense(
                        expense
                    );


            editCell.appendChild(
                editButton
            );


            // Delete

            const deleteCell =
                document.createElement(
                    "td"
                );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.textContent =
                "Delete";


            deleteButton.className =
                "logout-button";


            deleteButton.onclick =
                () =>
                    deleteExpense(
                        expense.id
                    );


            deleteCell.appendChild(
                deleteButton
            );


            row.appendChild(
                sourceCell
            );

            row.appendChild(
                amountCell
            );

            row.appendChild(
                forWhatCell
            );

            row.appendChild(
                typeCell
            );

            row.appendChild(
                dateCell
            );

            row.appendChild(
                editCell
            );

            row.appendChild(
                deleteCell
            );


            tableBody.appendChild(
                row
            );

        }
    );

}


// ========================================
// EDIT EXPENSE
// ========================================

async function editExpense(
    expense
) {

    const newSource =
        prompt(
            "Source:",
            expense.source
        );


    if (newSource === null) {

        return;

    }


    const newAmount =
        prompt(
            "Amount:",
            expense.amount
        );


    if (newAmount === null) {

        return;

    }


    const newForWhat =
        prompt(
            "For What:",
            expense.for_what
        );


    if (newForWhat === null) {

        return;

    }


    const newExpenseType =
        prompt(
            "Expense Type (Company / Personal / Room Expense):",
            expense.expense_type
        );


    if (
        newExpenseType === null
    ) {

        return;

    }


    const numericAmount =
        Number(
            newAmount
        );


    if (
        isNaN(numericAmount) ||
        numericAmount <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;

    }


    const allowedTypes = [

        "Company",

        "Personal",

        "Room Expense"

    ];


    if (
        !allowedTypes.includes(
            newExpenseType
        )
    ) {

        alert(
            "Expense Type must be Company, Personal, or Room Expense."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("expenses")
            .update({

                source:
                    newSource.trim(),

                amount:
                    numericAmount,

                for_what:
                    newForWhat.trim(),

                expense_type:
                    newExpenseType

            })
            .eq(
                "id",
                expense.id
            );


    if (error) {

        console.error(
            "Update expense error:",
            error
        );

        alert(
            error.message
        );

        return;

    }


    alert(
        "Expense updated successfully."
    );


    loadMyExpenses();

}


// ========================================
// DELETE EXPENSE
// ========================================

async function deleteExpense(
    expenseId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("expenses")
            .delete()
            .eq(
                "id",
                expenseId
            );


    if (error) {

        console.error(
            "Delete expense error:",
            error
        );

        alert(
            error.message
        );

        return;

    }


    alert(
        "Expense deleted successfully."
    );


    loadMyExpenses();

}


// ========================================
// DATE FORMAT
// ========================================

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "N/A";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "N/A";

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            year: "numeric",

            month: "short",

            day: "numeric"

        }
    );

}


// ========================================
// DATE + TIME FORMAT
// ========================================

function formatDateTime(
    dateValue
) {

    if (!dateValue) {

        return "N/A";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "N/A";

    }


    return date.toLocaleString(
        "en-IN",
        {

            year: "numeric",

            month: "short",

            day: "numeric",

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


// ========================================
// SET TODAY'S DATE
// ========================================

function setTodayDate() {

    const expenseDate =
        document.getElementById(
            "expenseDate"
        );


    if (!expenseDate) {

        return;

    }


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    expenseDate.value =
        `${year}-${month}-${day}`;

}


// ========================================
// ADD EXPENSE FORM INITIALIZATION
// ========================================

function initializeAddExpensePage() {

    console.log(
        "Initializing Add Expense page..."
    );


    setTodayDate();


    const expenseForm =
        document.getElementById(
            "expenseForm"
        );


    if (!expenseForm) {

        console.error(
            "expenseForm not found."
        );

        return;

    }


    expenseForm.addEventListener(
        "submit",
        async function(event) {

            // IMPORTANT:
            // Prevent normal browser form submission

            event.preventDefault();

            event.stopPropagation();


            await addExpense();

        }
    );


    console.log(
        "Add Expense form ready."
    );

}


// ========================================
// DASHBOARD INITIALIZATION
// ========================================

if (
    window.location.pathname.endsWith(
        "dashboard.html"
    )
) {

    loadUser();

    loadDashboardStats();

}


// ========================================
// ALL EXPENSES INITIALIZATION
// ========================================

if (
    window.location.pathname.endsWith(
        "expenses.html"
    )
) {

    loadAllExpenses();

}


// ========================================
// MY EXPENSES INITIALIZATION
// ========================================

if (
    window.location.pathname.endsWith(
        "my-expenses.html"
    )
) {

    loadMyExpenses();

}


// ========================================
// ADD EXPENSE INITIALIZATION
// ========================================

if (
    window.location.pathname.endsWith(
        "add-expense.html"
    )
) {

    initializeAddExpensePage();

}