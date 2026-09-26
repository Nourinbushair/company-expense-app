// ============================================
// COMPANY EXPENSE APP
// ============================================

// SUPABASE
const SUPABASE_URL =
    "https://kdabddhuxypcihlbubzi.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nkJMnNS4PSIQlNfGvXh7Gg_k9C7X9TA";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// CURRENCY
const CURRENCY = "SAR";


// ============================================
// HELPER
// ============================================

function formatAmount(amount) {

    return CURRENCY + " " +
        Number(amount).toFixed(2);

}


// ============================================
// SIGNUP
// ============================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document.getElementById("name")
                    .value.trim();

            const email =
                document.getElementById("email")
                    .value.trim();

            const password =
                document.getElementById("password")
                    .value;

            const department =
                document.getElementById("department")
                    .value.trim();

            const message =
                document.getElementById("message");

            message.textContent =
                "Creating account...";


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

                            department:
                                department

                        }

                    }

                });


            if (error) {

                console.error(error);

                message.textContent =
                    error.message;

                return;

            }


            if (!data.user) {

                message.textContent =
                    "Account creation failed.";

                return;

            }


            message.textContent =
                "Account created successfully!";


            setTimeout(
                function() {

                    window.location.href =
                        "index.html";

                },
                1500
            );

        }
    );

}


// ============================================
// LOGIN
// ============================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail")
                    .value.trim();

            const password =
                document.getElementById("loginPassword")
                    .value;

            const message =
                document.getElementById(
                    "loginMessage"
                );


            message.textContent =
                "Logging in...";


            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                message.textContent =
                    error.message;

                return;

            }


            if (!data.user) {

                message.textContent =
                    "Login failed.";

                return;

            }


            message.textContent =
                "Login successful!";


            window.location.href =
                "dashboard.html";

        }
    );

}


// ============================================
// GET CURRENT USER
// ============================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth
            .getUser();


    if (error) {

        console.error(error);

        return null;

    }


    return data.user;

}


// ============================================
// LOAD USER PROFILE
// ============================================

async function loadUserProfile() {

    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "index.html";

        return null;

    }


    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return null;

    }


    const userInfo =
        document.getElementById(
            "userInfo"
        );


    if (userInfo) {

        userInfo.innerHTML = `

            <h3>
                Welcome, ${profile.name}
            </h3>

            <p>
                Employee ID:
                <strong>
                    ${profile.employee_id}
                </strong>
            </p>

            <p>
                Department:
                ${profile.department || "Not specified"}
            </p>

            <p>
                Email:
                ${profile.email}
            </p>

        `;

    }


    return profile;

}


// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {

    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "index.html";

        return;

    }


    await loadUserProfile();


    const {
        data: expenses,
        error
    } =
        await supabaseClient
            .from("expenses")
            .select("*");


    if (error) {

        console.error(error);

        return;

    }


    let total = 0;

    let company = 0;

    let personal = 0;

    let room = 0;


    expenses.forEach(
        function(expense) {

            const amount =
                Number(expense.amount);

            total += amount;


            if (
                expense.expense_type ===
                "Company"
            ) {

                company += amount;

            }


            if (
                expense.expense_type ===
                "Personal"
            ) {

                personal += amount;

            }


            if (
                expense.expense_type ===
                "Room Expense"
            ) {

                room += amount;

            }

        }
    );


    const totalElement =
        document.getElementById(
            "totalAmount"
        );

    const companyElement =
        document.getElementById(
            "companyAmount"
        );

    const personalElement =
        document.getElementById(
            "personalAmount"
        );

    const roomElement =
        document.getElementById(
            "roomAmount"
        );


    if (totalElement) {

        totalElement.textContent =
            formatAmount(total);

    }


    if (companyElement) {

        companyElement.textContent =
            formatAmount(company);

    }


    if (personalElement) {

        personalElement.textContent =
            formatAmount(personal);

    }


    if (roomElement) {

        roomElement.textContent =
            formatAmount(room);

    }

}


// ============================================
// ADD EXPENSE
// ============================================

const expenseForm =
    document.getElementById(
        "expenseForm"
    );


if (expenseForm) {

    const expenseDate =
        document.getElementById(
            "expenseDate"
        );


    if (expenseDate) {

        expenseDate.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    expenseForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const user =
                await getCurrentUser();


            if (!user) {

                window.location.href =
                    "index.html";

                return;

            }


            const source =
                document.getElementById(
                    "source"
                ).value.trim();


            const amount =
                Number(
                    document.getElementById(
                        "amount"
                    ).value
                );


            const forWhat =
                document.getElementById(
                    "forWhat"
                ).value.trim();


            const expenseType =
                document.getElementById(
                    "expenseType"
                ).value;


            const selectedDate =
                document.getElementById(
                    "expenseDate"
                ).value;


            const message =
                document.getElementById(
                    "expenseMessage"
                );


            if (
                !source ||
                !amount ||
                !forWhat ||
                !expenseType ||
                !selectedDate
            ) {

                message.textContent =
                    "Please fill all fields.";

                return;

            }


            message.textContent =
                "Saving expense...";


            const {
                error
            } =
                await supabaseClient
                    .from("expenses")
                    .insert({

                        user_id:
                            user.id,

                        source:
                            source,

                        amount:
                            amount,

                        for_what:
                            forWhat,

                        expense_type:
                            expenseType,

                        expense_date:
                            selectedDate

                    });


            if (error) {

                console.error(error);

                message.textContent =
                    error.message;

                return;

            }


            message.textContent =
                "Expense saved successfully!";


            expenseForm.reset();


            if (expenseDate) {

                expenseDate.value =
                    new Date()
                        .toISOString()
                        .split("T")[0];

            }

        }
    );

}


// ============================================
// ALL EXPENSES
// ============================================

async function loadAllExpenses() {

    const user =
        await getCurrentUser();


    if (!user) {

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
            .order(
                "expense_date",
                {
                    ascending: false
                }
            );


    const table =
        document.getElementById(
            "expenseTable"
        );


    const message =
        document.getElementById(
            "expensesMessage"
        );


    if (error) {

        console.error(error);

        if (message) {

            message.textContent =
                error.message;

        }

        return;

    }


    if (!table) {

        return;

    }


    table.innerHTML = "";


    const {
        data: profiles
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, employee_id, name"
            );


    expenses.forEach(
        function(expense) {

            const profile =
                profiles.find(
                    function(item) {

                        return (
                            item.id ===
                            expense.user_id
                        );

                    }
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${
                        profile
                            ? profile.employee_id
                            : "Unknown"
                    }
                </td>

                <td>
                    ${escapeHTML(
                        expense.source
                    )}
                </td>

                <td>
                    ${formatAmount(
                        expense.amount
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        expense.for_what
                    )}
                </td>

                <td>
                    ${expense.expense_type}
                </td>

                <td>
                    ${expense.expense_date}
                </td>

            `;


            table.appendChild(row);

        }
    );

}


// ============================================
// MY EXPENSES
// ============================================

async function loadMyExpenses() {

    const user =
        await getCurrentUser();


    if (!user) {

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
                "expense_date",
                {
                    ascending: false
                }
            );


    const table =
        document.getElementById(
            "myExpenseTable"
        );


    const message =
        document.getElementById(
            "myExpensesMessage"
        );


    if (error) {

        console.error(error);

        if (message) {

            message.textContent =
                error.message;

        }

        return;

    }


    if (!table) {

        return;

    }


    table.innerHTML = "";


    expenses.forEach(
        function(expense) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        expense.source
                    )}
                </td>

                <td>
                    ${formatAmount(
                        expense.amount
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        expense.for_what
                    )}
                </td>

                <td>
                    ${expense.expense_type}
                </td>

                <td>
                    ${expense.expense_date}
                </td>

                <td>

                    <button
                        class="small-button secondary"
                        onclick="editExpense(${expense.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="small-button danger"
                        onclick="deleteExpense(${expense.id})"
                    >
                        Delete
                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


// ============================================
// DELETE EXPENSE
// ============================================

async function deleteExpense(id) {

    const confirmed =
        confirm(
            "Delete this expense?"
        );


    if (!confirmed) {

        return;

    }


    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "index.html";

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("expenses")
            .delete()
            .eq("id", id)
            .eq(
                "user_id",
                user.id
            );


    if (error) {

        alert(error.message);

        return;

    }


    loadMyExpenses();

    loadDashboard();

}


// ============================================
// EDIT EXPENSE
// ============================================

async function editExpense(id) {

    const {
        data: expense,
        error
    } =
        await supabaseClient
            .from("expenses")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        alert(error.message);

        return;

    }


    const source =
        prompt(
            "Source:",
            expense.source
        );


    if (source === null) {

        return;

    }


    const amount =
        prompt(
            "Amount:",
            expense.amount
        );


    if (amount === null) {

        return;

    }


    const forWhat =
        prompt(
            "For What:",
            expense.for_what
        );


    if (forWhat === null) {

        return;

    }


    const {
        error: updateError
    } =
        await supabaseClient
            .from("expenses")
            .update({

                source:
                    source.trim(),

                amount:
                    Number(amount),

                for_what:
                    forWhat.trim()

            })
            .eq("id", id);


    if (updateError) {

        alert(
            updateError.message
        );

        return;

    }


    alert(
        "Expense updated successfully."
    );


    loadMyExpenses();

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================================
// LOGOUT
// ============================================

async function logout() {

    const {
        error
    } =
        await supabaseClient.auth
            .signOut();


    if (error) {

        alert(error.message);

        return;

    }


    window.location.href =
        "index.html";

}


// ============================================
// PAGE INITIALIZATION
// ============================================

if (
    document.getElementById(
        "userInfo"
    )
) {

    loadDashboard();

}


if (
    document.getElementById(
        "expenseTable"
    )
) {

    loadAllExpenses();

}


if (
    document.getElementById(
        "myExpenseTable"
    )
) {

    loadMyExpenses();

}

// ==========================================
// MY EXPENSES
// Shows ALL expenses created by logged-in user
// ==========================================

async function loadMyExpenses() {

    const tableBody = document.getElementById("myExpensesTableBody");
    const message = document.getElementById("myExpensesMessage");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="7">Loading your expenses...</td>
        </tr>
    `;

    try {

        // Get currently logged-in user
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {

            window.location.href = "index.html";
            return;
        }

        console.log("Logged-in user ID:", user.id);

        // IMPORTANT:
        // Only filter by user_id.
        // DO NOT filter by expense_type.
        const { data: expenses, error } = await supabaseClient
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
                updated_at
            `)
            .eq("user_id", user.id)
            .order("expense_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        console.log("My expenses:", expenses);

        if (!expenses || expenses.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        You have not added any expenses yet.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = expenses.map(expense => {

            const amount = Number(expense.amount || 0).toFixed(2);

            const createdDate = expense.created_at
                ? new Date(expense.created_at).toLocaleString()
                : "-";

            return `
                <tr>

                    <td>
                        ${escapeHtml(expense.expense_date || "-")}
                    </td>

                    <td>
                        ${escapeHtml(expense.source || "-")}
                    </td>

                    <td>
                        ${escapeHtml(expense.for_what || "-")}
                    </td>

                    <td>
                        ${escapeHtml(expense.expense_type || "-")}
                    </td>

                    <td>
                        <strong>SAR ${amount}</strong>
                    </td>

                    <td>
                        ${escapeHtml(createdDate)}
                    </td>

                    <td>

                        <button
                            class="edit-button"
                            onclick="editExpense(${expense.id})">
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteExpense(${expense.id})">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error("My Expenses Error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load your expenses.
                </td>
            </tr>
        `;

        if (message) {
            message.innerHTML = `
                <p class="error-message">
                    ${escapeHtml(error.message)}
                </p>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById("myExpensesTableBody")) {
        loadMyExpenses();
    }

});