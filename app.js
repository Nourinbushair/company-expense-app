// ============================================
// COMPANY EXPENSE APP
// ============================================

// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL =
    "https://kdabddhuxypcihlbubzi.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nkJMnNS4PSIQlNfGvXh7Gg_k9C7X9TA";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ============================================
// SETTINGS
// ============================================

const CURRENCY = "SAR";


// ============================================
// HELPER FUNCTIONS
// ============================================

function formatAmount(amount) {
    return CURRENCY + " " +
        Number(amount || 0).toFixed(2);
}


function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function todayDate() {
    return new Date()
        .toISOString()
        .split("T")[0];
}


// ============================================
// GET CURRENT USER
// ============================================

async function getCurrentUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        console.error(
            "Get user error:",
            error
        );

        return null;
    }

    return data.user;
}


// ============================================
// SIGNUP
// ============================================

function setupSignup() {

    const signupForm =
        document.getElementById("signupForm");

    if (!signupForm) {
        return;
    }

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const department =
                document
                    .getElementById("department")
                    .value
                    .trim();

            const message =
                document.getElementById("message");

            if (!name || !email || !password) {

                if (message) {
                    message.textContent =
                        "Please fill in all required fields.";
                }

                return;
            }

            if (message) {
                message.textContent =
                    "Creating account...";
            }

            try {

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


                if (!data.user) {

                    if (message) {
                        message.textContent =
                            "Account creation failed.";
                    }

                    return;
                }


                if (message) {

                    if (
                        data.session
                    ) {

                        message.textContent =
                            "Account created successfully!";

                    } else {

                        message.textContent =
                            "Account created. Please verify your email before logging in.";

                    }

                }


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    1800
                );


            } catch (error) {

                console.error(
                    "Signup exception:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message ||
                        "Unable to create account.";
                }

            }

        }
    );

}


// ============================================
// LOGIN
// ============================================

function setupLogin() {

    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            const message =
                document.getElementById(
                    "loginMessage"
                );

            if (!email || !password) {

                if (message) {
                    message.textContent =
                        "Please enter email and password.";
                }

                return;
            }

            if (message) {
                message.textContent =
                    "Logging in...";
            }

            try {

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

                    if (message) {
                        message.textContent =
                            error.message;
                    }

                    return;
                }


                if (!data.user) {

                    if (message) {
                        message.textContent =
                            "Login failed.";
                    }

                    return;
                }


                if (message) {
                    message.textContent =
                        "Login successful!";
                }


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login exception:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message ||
                        "Unable to login.";
                }

            }

        }
    );

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

        const userInfo =
            document.getElementById(
                "userInfo"
            );

        if (userInfo) {

            userInfo.innerHTML = `
                <p class="error-message">
                    Unable to load your profile.
                </p>
            `;

        }

        return null;
    }


    const userInfo =
        document.getElementById(
            "userInfo"
        );


    if (userInfo) {

        userInfo.innerHTML = `

            <h3>
                Welcome, ${escapeHTML(
                    profile.name
                )}
            </h3>

            <p>
                Employee ID:
                <strong>
                    ${escapeHTML(
                        profile.employee_id
                    )}
                </strong>
            </p>

            <p>
                Department:
                ${escapeHTML(
                    profile.department ||
                    "Not specified"
                )}
            </p>

            <p>
                Email:
                ${escapeHTML(
                    profile.email
                )}
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

        console.error(
            "Dashboard expenses error:",
            error
        );

        return;
    }


    let total = 0;

    let company = 0;

    let personal = 0;

    let room = 0;


    expenses.forEach(
        function (expense) {

            const amount =
                Number(
                    expense.amount || 0
                );


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

function setupAddExpense() {

    const expenseForm =
        document.getElementById(
            "expenseForm"
        );


    if (!expenseForm) {
        return;
    }


    const expenseDate =
        document.getElementById(
            "expenseDate"
        );


    if (
        expenseDate &&
        !expenseDate.value
    ) {

        expenseDate.value =
            todayDate();

    }


    expenseForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                await getCurrentUser();


            if (!user) {

                window.location.href =
                    "index.html";

                return;
            }


            const source =
                document
                    .getElementById("source")
                    .value
                    .trim();


            const amount =
                Number(
                    document
                        .getElementById("amount")
                        .value
                );


            const forWhat =
                document
                    .getElementById("forWhat")
                    .value
                    .trim();


            const expenseType =
                document
                    .getElementById("expenseType")
                    .value;


            const selectedDate =
                document
                    .getElementById("expenseDate")
                    .value;


            const message =
                document.getElementById(
                    "expenseMessage"
                );


            if (
                !source ||
                !amount ||
                amount <= 0 ||
                !forWhat ||
                !expenseType ||
                !selectedDate
            ) {

                if (message) {
                    message.textContent =
                        "Please fill all fields correctly.";
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Saving expense...";
            }


            try {

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

                    console.error(
                        "Add expense error:",
                        error
                    );

                    if (message) {
                        message.textContent =
                            error.message;
                    }

                    return;
                }


                if (message) {
                    message.textContent =
                        "Expense saved successfully!";
                }


                expenseForm.reset();


                if (expenseDate) {

                    expenseDate.value =
                        todayDate();

                }


            } catch (error) {

                console.error(
                    "Add expense exception:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message ||
                        "Unable to save expense.";
                }

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


    const table =
        document.getElementById(
            "expenseTable"
        );

    const message =
        document.getElementById(
            "expensesMessage"
        );


    if (!table) {
        return;
    }


    if (message) {
        message.textContent =
            "Loading expenses...";
    }


    try {

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
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        const {
            data: profiles,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, employee_id, name"
                );


        if (profileError) {
            throw profileError;
        }


        table.innerHTML = "";


        if (
            !expenses ||
            expenses.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        No expenses found.
                    </td>
                </tr>
            `;

            if (message) {
                message.textContent = "";
            }

            return;
        }


        expenses.forEach(
            function (expense) {

                const profile =
                    profiles.find(
                        function (item) {

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
                                ? escapeHTML(
                                    profile.employee_id
                                )
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
                        ${escapeHTML(
                            expense.expense_type
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.expense_date
                        )}
                    </td>

                `;


                table.appendChild(row);

            }
        );


        if (message) {
            message.textContent = "";
        }


    } catch (error) {

        console.error(
            "All Expenses Error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load expenses.
                </td>
            </tr>
        `;


        if (message) {

            message.textContent =
                error.message ||
                "Unable to load expenses.";

        }

    }

}


// ============================================
// MY EXPENSES
// Shows ALL expenses created by logged-in user
// ============================================

async function loadMyExpenses() {

    const tableBody =
        document.getElementById(
            "myExpensesTableBody"
        );

    const message =
        document.getElementById(
            "myExpensesMessage"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="7">
                Loading your expenses...
            </td>
        </tr>
    `;


    try {

        const user =
            await getCurrentUser();


        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        console.log(
            "Logged-in user ID:",
            user.id
        );


        // ========================================
        // IMPORTANT:
        // ONLY FILTER BY USER ID
        // This shows Company, Personal,
        // and Room Expense.
        // ========================================

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
                    updated_at
                `)
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "expense_date",
                    {
                        ascending: false
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        console.log(
            "My expenses:",
            expenses
        );


        if (
            !expenses ||
            expenses.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        You have not added any expenses yet.
                    </td>
                </tr>
            `;

            if (message) {
                message.textContent = "";
            }

            return;
        }


        tableBody.innerHTML =
            expenses
                .map(
                    function (expense) {

                        const amount =
                            Number(
                                expense.amount || 0
                            ).toFixed(2);


                        const createdDate =
                            expense.created_at
                                ? new Date(
                                    expense.created_at
                                ).toLocaleString()
                                : "-";


                        return `

                            <tr>

                                <td>
                                    ${escapeHTML(
                                        expense.expense_date ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        expense.source ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        expense.for_what ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        expense.expense_type ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    <strong>
                                        ${CURRENCY}
                                        ${amount}
                                    </strong>
                                </td>

                                <td>
                                    ${escapeHTML(
                                        createdDate
                                    )}
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        class="edit-button"
                                        onclick="openEditModal(${Number(
                                            expense.id
                                        )})"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        class="delete-button"
                                        onclick="deleteExpense(${Number(
                                            expense.id
                                        )})"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");


        if (message) {
            message.textContent = "";
        }


    } catch (error) {

        console.error(
            "My Expenses Error:",
            error
        );


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
                    ${escapeHTML(
                        error.message ||
                        "Unable to load your expenses."
                    )}
                </p>
            `;

        }

    }

}


// ============================================
// DELETE EXPENSE
// ============================================

async function deleteExpense(id) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this expense?"
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


    try {

        const {
            error
        } =
            await supabaseClient
                .from("expenses")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "user_id",
                    user.id
                );


        if (error) {
            throw error;
        }


        await loadMyExpenses();


        // Update dashboard if
        // dashboard elements exist.
        if (
            document.getElementById(
                "totalAmount"
            )
        ) {

            await loadDashboard();

        }


    } catch (error) {

        console.error(
            "Delete expense error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete expense."
        );

    }

}


// ============================================
// OPEN EDIT MODAL
// ============================================

async function openEditModal(
    expenseId
) {

    try {

        const user =
            await getCurrentUser();


        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        // ========================================
        // SECURITY:
        // Get ONLY the logged-in user's expense
        // ========================================

        const {
            data: expense,
            error
        } =
            await supabaseClient
                .from("expenses")
                .select("*")
                .eq(
                    "id",
                    expenseId
                )
                .eq(
                    "user_id",
                    user.id
                )
                .single();


        if (error) {
            throw error;
        }


        if (!expense) {

            alert(
                "Expense not found."
            );

            return;
        }


        const editId =
            document.getElementById(
                "editExpenseId"
            );

        const editSource =
            document.getElementById(
                "editSource"
            );

        const editAmount =
            document.getElementById(
                "editAmount"
            );

        const editForWhat =
            document.getElementById(
                "editForWhat"
            );

        const editExpenseType =
            document.getElementById(
                "editExpenseType"
            );

        const editExpenseDate =
            document.getElementById(
                "editExpenseDate"
            );

        const editMessage =
            document.getElementById(
                "editExpenseMessage"
            );

        const modal =
            document.getElementById(
                "editExpenseModal"
            );


        if (
            !editId ||
            !editSource ||
            !editAmount ||
            !editForWhat ||
            !editExpenseType ||
            !editExpenseDate ||
            !modal
        ) {

            alert(
                "Edit form elements are missing from my-expenses.html."
            );

            return;
        }


        editId.value =
            expense.id;


        editSource.value =
            expense.source || "";


        editAmount.value =
            expense.amount || "";


        editForWhat.value =
            expense.for_what || "";


        editExpenseType.value =
            expense.expense_type ||
            "Company";


        editExpenseDate.value =
            expense.expense_date ||
            "";


        if (editMessage) {
            editMessage.textContent = "";
        }


        modal.classList.add(
            "show"
        );


    } catch (error) {

        console.error(
            "Edit Expense Error:",
            error
        );

        alert(
            error.message ||
            "Unable to load this expense."
        );

    }

}


// ============================================
// CLOSE EDIT MODAL
// ============================================

function closeEditModal() {

    const modal =
        document.getElementById(
            "editExpenseModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ============================================
// SAVE EDITED EXPENSE
// ============================================

function setupEditExpense() {

    const editForm =
        document.getElementById(
            "editExpenseForm"
        );


    if (!editForm) {
        return;
    }


    editForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const message =
                document.getElementById(
                    "editExpenseMessage"
                );


            const saveButton =
                editForm.querySelector(
                    ".save-changes-button"
                );


            const expenseId =
                document
                    .getElementById(
                        "editExpenseId"
                    )
                    .value;


            const source =
                document
                    .getElementById(
                        "editSource"
                    )
                    .value
                    .trim();


            const amount =
                Number(
                    document
                        .getElementById(
                            "editAmount"
                        )
                        .value
                );


            const forWhat =
                document
                    .getElementById(
                        "editForWhat"
                    )
                    .value
                    .trim();


            const expenseType =
                document
                    .getElementById(
                        "editExpenseType"
                    )
                    .value;


            const expenseDate =
                document
                    .getElementById(
                        "editExpenseDate"
                    )
                    .value;


            if (
                !expenseId ||
                !source ||
                !amount ||
                amount <= 0 ||
                !forWhat ||
                !expenseType ||
                !expenseDate
            ) {

                if (message) {
                    message.textContent =
                        "Please fill in all fields correctly.";
                }

                return;
            }


            try {

                if (saveButton) {

                    saveButton.disabled =
                        true;

                    saveButton.textContent =
                        "Saving...";

                }


                if (message) {
                    message.textContent = "";
                }


                const user =
                    await getCurrentUser();


                if (!user) {

                    window.location.href =
                        "index.html";

                    return;
                }


                // ====================================
                // SECURITY:
                // Update only current user's expense
                // ====================================

                const {
                    error
                } =
                    await supabaseClient
                        .from("expenses")
                        .update({

                            source:
                                source,

                            amount:
                                amount,

                            for_what:
                                forWhat,

                            expense_type:
                                expenseType,

                            expense_date:
                                expenseDate,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            expenseId
                        )
                        .eq(
                            "user_id",
                            user.id
                        );


                if (error) {
                    throw error;
                }


                if (message) {
                    message.textContent =
                        "Expense updated successfully.";
                }


                setTimeout(
                    async function () {

                        closeEditModal();

                        await loadMyExpenses();

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Save Expense Error:",
                    error
                );


                if (message) {

                    message.textContent =
                        error.message ||
                        "Unable to update expense.";

                }

            } finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save Changes";

                }

            }

        }
    );

}


// ============================================
// LOGOUT
// ============================================

async function logout() {

    try {

        const {
            error
        } =
            await supabaseClient.auth
                .signOut();


        if (error) {

            alert(
                error.message
            );

            return;
        }


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            error.message ||
            "Unable to logout."
        );

    }

}


// ============================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ============================================

function setupModalEvents() {

    const modal =
        document.getElementById(
            "editExpenseModal"
        );


    if (!modal) {
        return;
    }


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                closeEditModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeEditModal();

            }

        }
    );

}


// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Company Expense App loaded."
        );


        // ----------------------------------------
        // Login
        // ----------------------------------------

        setupLogin();


        // ----------------------------------------
        // Signup
        // ----------------------------------------

        setupSignup();


        // ----------------------------------------
        // Add Expense
        // ----------------------------------------

        setupAddExpense();


        // ----------------------------------------
        // Edit Expense
        // ----------------------------------------

        setupEditExpense();


        // ----------------------------------------
        // Modal
        // ----------------------------------------

        setupModalEvents();


        // ----------------------------------------
        // Dashboard
        // ----------------------------------------

        if (
            document.getElementById(
                "userInfo"
            )
        ) {

            await loadDashboard();

        }


        // ----------------------------------------
        // All Expenses
        // ----------------------------------------

        if (
            document.getElementById(
                "expenseTable"
            )
        ) {

            await loadAllExpenses();

        }


        // ----------------------------------------
        // My Expenses
        // ----------------------------------------

        if (
            document.getElementById(
                "myExpensesTableBody"
            )
        ) {

            await loadMyExpenses();

        }

    }
);


// ============================================
// END OF APP.JS
// ============================================