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
        document.getElementById("department")?.value.trim();

    const message =
        document.getElementById("signupMessage") ||
        document.getElementById("message");


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


    const { data, error } =
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


    if (data.session) {

        if (message) {
            message.textContent =
                "Account created successfully. Redirecting...";
        }

        setTimeout(() => {
            window.location.href =
                "dashboard.html";
        }, 1000);

    } else {

        if (message) {
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
        document.getElementById("loginEmail")?.value.trim();

    const password =
        document.getElementById("loginPassword")?.value;

    const message =
        document.getElementById("loginMessage");


    console.log("Login function started");


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


    try {

        const { data, error } =
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
            "Login successful:",
            data.user
        );


        if (message) {
            message.textContent =
                "Login successful. Redirecting...";
        }


        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "Unexpected login error:",
            error
        );

        if (message) {
            message.textContent =
                "Something went wrong. Please try again.";
        }

    }

}


// ========================================
// LOGIN FORM INITIALIZATION
// ========================================

function initializeLoginPage() {

    const loginForm =
        document.getElementById("loginForm");


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            event.stopPropagation();

            await login();

        }
    );


    console.log(
        "Login form ready."
    );

}


// ========================================
// SIGNUP FORM INITIALIZATION
// ========================================

function initializeSignupPage() {

    const signupForm =
        document.getElementById("signupForm");


    if (!signupForm) {
        return;
    }


    signupForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            event.stopPropagation();

            await signup();

        }
    );


    console.log(
        "Signup form ready."
    );

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    const { error } =
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
        data: { user },
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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ========================================
// DASHBOARD STATISTICS
// ========================================

async function loadDashboardStats() {

    const {
        data: { user },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

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
            .select("amount, expense_type");


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


    expenses.forEach(expense => {

        const amount =
            Number(expense.amount) || 0;


        totalAmount += amount;


        if (expense.expense_type === "Company") {
            companyAmount += amount;
        }


        if (expense.expense_type === "Personal") {
            personalAmount += amount;
        }


        if (expense.expense_type === "Room Expense") {
            roomAmount += amount;
        }

    });


    document.getElementById("totalAmount").textContent =
        CURRENCY + " " + totalAmount.toFixed(2);

    document.getElementById("companyAmount").textContent =
        CURRENCY + " " + companyAmount.toFixed(2);

    document.getElementById("personalAmount").textContent =
        CURRENCY + " " + personalAmount.toFixed(2);

    document.getElementById("roomAmount").textContent =
        CURRENCY + " " + roomAmount.toFixed(2);

}


// ========================================
// ADD EXPENSE
// ========================================

async function addExpense() {

    const source =
        document.getElementById("source")?.value.trim();

    const amount =
        document.getElementById("amount")?.value;

    const forWhat =
        document.getElementById("forWhat")?.value.trim();

    const expenseType =
        document.getElementById("expenseType")?.value;

    const expenseDate =
        document.getElementById("expenseDate")?.value;

    const message =
        document.getElementById("expenseMessage");

    const saveButton =
        document.getElementById("saveExpenseButton");


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


    if (!allowedTypes.includes(expenseType)) {

        if (message) {
            message.textContent =
                "Invalid expense type.";
        }

        return;
    }


    const {
        data: { user },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

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


    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }


    if (message) {
        message.textContent =
            "Saving expense...";
    }


    const { data, error } =
        await supabaseClient
            .from("expenses")
            .insert([{

                user_id: user.id,

                source: source,

                amount: numericAmount,

                for_what: forWhat,

                expense_type: expenseType,

                expense_date: expenseDate

            }])
            .select()
            .single();


    if (error) {

        console.error(
            "Add expense error:",
            error
        );

        if (message) {
            message.textContent =
                "Error: " + error.message;
        }

        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent =
                "Save Expense";
        }

        return;
    }


    console.log(
        "Expense added:",
        data
    );


    if (message) {
        message.textContent =
            "Expense added successfully!";
    }


    setTimeout(() => {
        window.location.href =
            "dashboard.html";
    }, 1000);

}


// ========================================
// SET TODAY DATE
// ========================================

function setTodayDate() {

    const expenseDate =
        document.getElementById("expenseDate");


    if (!expenseDate) {
        return;
    }


    const now = new Date();


    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");


    expenseDate.value =
        `${year}-${month}-${day}`;

}


// ========================================
// ADD EXPENSE INITIALIZATION
// ========================================

function initializeAddExpensePage() {

    setTodayDate();


    const expenseForm =
        document.getElementById("expenseForm");


    if (!expenseForm) {
        return;
    }


    expenseForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            event.stopPropagation();

            await addExpense();

        }
    );

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "N/A";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
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
// FORMAT DATE + TIME
// ========================================

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "N/A";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
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
// LOAD ALL EXPENSES
// ========================================

async function loadAllExpenses() {

    const {
        data: { user },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

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
                { ascending: false }
            );


    if (error) {

        console.error(
            "All expenses error:",
            error
        );

        return;
    }


    const tableBody =
        document.getElementById("expenseTable");


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (!expenses || expenses.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No expenses found.
                </td>
            </tr>
        `;

        return;
    }


    expenses.forEach(expense => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    expense.profiles?.employee_id ||
                    "N/A"
                )}
            </td>

            <td>
                ${escapeHtml(
                    expense.profiles?.name ||
                    "Unknown"
                )}
            </td>

            <td>
                ${escapeHtml(expense.source)}
            </td>

            <td>
                ${CURRENCY}
                ${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                ${escapeHtml(expense.for_what)}
            </td>

            <td>
                ${escapeHtml(expense.expense_type)}
            </td>

            <td>
                ${formatDate(
                    expense.expense_date ||
                    expense.created_at
                )}
            </td>

            <td>
                ${formatDateTime(
                    expense.created_at
                )}
            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ========================================
// LOAD MY EXPENSES
// ========================================

async function loadMyExpenses() {

    const {
        data: { user },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

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
            .eq("user_id", user.id)
            .order(
                "created_at",
                { ascending: false }
            );


    if (error) {

        console.error(
            "My expenses error:",
            error
        );

        return;
    }


    const tableBody =
        document.getElementById("myExpenseTable");


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (!expenses || expenses.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No expenses found.
                </td>
            </tr>
        `;

        return;
    }


    expenses.forEach(expense => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(expense.source)}
            </td>

            <td>
                ${CURRENCY}
                ${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                ${escapeHtml(expense.for_what)}
            </td>

            <td>
                ${escapeHtml(expense.expense_type)}
            </td>

            <td>
                ${formatDate(
                    expense.expense_date ||
                    expense.created_at
                )}
            </td>

            <td>

                <button
                    class="header-button"
                    onclick="editExpense(${expense.id})"
                >
                    Edit
                </button>

                <button
                    class="logout-button"
                    onclick="deleteExpense(${expense.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ========================================
// EDIT EXPENSE
// ========================================

async function editExpense(expenseId) {

    const {
        data: expense,
        error: fetchError
    } =
        await supabaseClient
            .from("expenses")
            .select("*")
            .eq("id", expenseId)
            .single();


    if (fetchError || !expense) {

        alert(
            "Unable to load expense."
        );

        return;
    }


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


    if (newExpenseType === null) {
        return;
    }


    const numericAmount =
        Number(newAmount);


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


    if (!allowedTypes.includes(newExpenseType)) {

        alert(
            "Expense Type must be Company, Personal, or Room Expense."
        );

        return;
    }


    const { error } =
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
                expenseId
            );


    if (error) {

        console.error(
            "Update expense error:",
            error
        );

        alert(error.message);

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

async function deleteExpense(expenseId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {
        return;
    }


    const { error } =
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

        alert(error.message);

        return;
    }


    alert(
        "Expense deleted successfully."
    );


    loadMyExpenses();

}


// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const path =
            window.location.pathname;


        // LOGIN

        if (
            path.endsWith("index.html") ||
            path.endsWith("/")
        ) {

            initializeLoginPage();

        }


        // SIGNUP

        if (
            path.endsWith("signup.html")
        ) {

            initializeSignupPage();

        }


        // DASHBOARD

        if (
            path.endsWith("dashboard.html")
        ) {

            loadUser();

            loadDashboardStats();

        }


        // ADD EXPENSE

        if (
            path.endsWith("add-expense.html")
        ) {

            initializeAddExpensePage();

        }


        // ALL EXPENSES

        if (
            path.endsWith("expenses.html")
        ) {

            loadAllExpenses();

        }


        // MY EXPENSES

        if (
            path.endsWith("my-expenses.html")
        ) {

            loadMyExpenses();

        }

    }
);