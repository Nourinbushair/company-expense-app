// ========================================
// COMPANY EXPENSE APP
// ========================================

// Supabase configuration

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
// SIGNUP
// ========================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

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

        }
    );
}


// ========================================
// LOGIN
// ========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail")
                    .value.trim();

            const password =
                document.getElementById("loginPassword")
                    .value;

            const message =
                document.getElementById("loginMessage");

            message.textContent =
                "Logging in...";


            const { error } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            if (error) {

                message.textContent =
                    error.message;

                return;
            }


            window.location.href =
                "dashboard.html";

        }
    );
}


// ========================================
// GET CURRENT USER
// ========================================

async function getCurrentUser() {

    const {
        data: {
            user
        },
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Authentication error:",
            error
        );

        return null;
    }


    return user;
}


// ========================================
// LOAD USER PROFILE
// ========================================

async function loadUser() {

    const userInfo =
        document.getElementById("userInfo");


    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "index.html";

        return;
    }


    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, employee_id, name, email, department, role"
            )
            .eq(
                "id",
                user.id
            )
            .single();


    if (error) {

        console.error(
            "Profile error:",
            error
        );


        if (userInfo) {

            userInfo.innerHTML = `
                <p>
                    Profile could not be loaded.
                </p>
            `;

        }

        return;
    }


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

}


// ========================================
// LOAD DASHBOARD STATISTICS
// ========================================

async function loadDashboardStats() {

    console.log(
        "Loading dashboard statistics..."
    );


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
            "Dashboard expense error:",
            error
        );


        const total =
            document.getElementById(
                "totalAmount"
            );

        if (total) {

            total.textContent =
                "Error";

        }

        return;
    }


    console.log(
        "Expenses received:",
        expenses
    );


    let totalAmount = 0;

    let companyAmount = 0;

    let personalAmount = 0;

    let roomAmount = 0;


    expenses.forEach(
        function (expense) {

            const amount =
                Number(expense.amount) || 0;


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
            "₹" +
            totalAmount.toFixed(2);

    }


    if (companyAmountEl) {

        companyAmountEl.textContent =
            "₹" +
            companyAmount.toFixed(2);

    }


    if (personalAmountEl) {

        personalAmountEl.textContent =
            "₹" +
            personalAmount.toFixed(2);

    }


    if (roomAmountEl) {

        roomAmountEl.textContent =
            "₹" +
            roomAmount.toFixed(2);

    }

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    const { error } =
        await supabaseClient.auth.signOut();


    if (error) {

        alert(
            error.message
        );

        return;
    }


    window.location.href =
        "index.html";

}


// ========================================
// ADD EXPENSE
// ========================================

const expenseForm =
    document.getElementById("expenseForm");


if (expenseForm) {

    const dateInput =
        document.getElementById(
            "expenseDate"
        );


    if (dateInput) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

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


            const expenseDate =
                document.getElementById(
                    "expenseDate"
                ).value;


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
                            expenseDate

                    });


            const message =
                document.getElementById(
                    "expenseMessage"
                );


            if (error) {

                console.error(
                    "Save expense error:",
                    error
                );


                message.textContent =
                    error.message;

                return;
            }


            message.textContent =
                "Expense saved successfully!";


            expenseForm.reset();


            if (dateInput) {

                dateInput.value =
                    new Date()
                        .toISOString()
                        .split("T")[0];

            }

        }
    );

}


// ========================================
// LOAD ALL EXPENSES
// ========================================

async function loadExpenses() {

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
            .select(`
                id,
                user_id,
                source,
                amount,
                for_what,
                expense_type,
                expense_date
            `)
            .order(
                "expense_date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Load expenses error:",
            error
        );


        const message =
            document.getElementById(
                "expensesMessage"
            );


        if (message) {

            message.textContent =
                error.message;

        }

        return;
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

        console.error(
            "Profiles error:",
            profileError
        );

        return;
    }


    const table =
        document.getElementById(
            "expenseTable"
        );


    if (!table) {

        return;
    }


    table.innerHTML = "";


    expenses.forEach(
        function (expense) {

            const profile =
                profiles.find(
                    function (profile) {

                        return profile.id ===
                            expense.user_id;

                    }
                );


            const row =
                document.createElement(
                    "tr"
                );


            const employeeCell =
                document.createElement(
                    "td"
                );

            employeeCell.textContent =
                profile
                    ? profile.employee_id
                    : "Unknown";


            const sourceCell =
                document.createElement(
                    "td"
                );

            sourceCell.textContent =
                expense.source;


            const amountCell =
                document.createElement(
                    "td"
                );

            amountCell.textContent =
                "₹" +
                Number(
                    expense.amount
                ).toFixed(2);


            const forWhatCell =
                document.createElement(
                    "td"
                );

            forWhatCell.textContent =
                expense.for_what;


            const typeCell =
                document.createElement(
                    "td"
                );

            typeCell.textContent =
                expense.expense_type;


            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.textContent =
                expense.expense_date;


            row.appendChild(
                employeeCell
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


            table.appendChild(
                row
            );

        }
    );

}


// ========================================
// DASHBOARD
// ========================================

if (
    document.getElementById(
        "userInfo"
    )
) {

    loadUser();

    loadDashboardStats();

}


// ========================================
// ALL EXPENSES PAGE
// ========================================

if (
    document.getElementById(
        "expenseTable"
    )
) {

    loadExpenses();

}
// ========================================
// MY EXPENSES
// ========================================

async function loadMyExpenses() {

    const user = await getCurrentUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    console.log("My Expenses User ID:", user.id);

    const {
        data: expenses,
        error
    } = await supabaseClient
        .from("expenses")
        .select(`
            id,
            user_id,
            source,
            amount,
            for_what,
            expense_type,
            expense_date
        `)
        .eq("user_id", user.id)
        .order("expense_date", {
            ascending: false
        });

    if (error) {

        console.error(
            "MY EXPENSES ERROR:",
            error
        );

        document.getElementById(
            "myExpensesMessage"
        ).textContent = error.message;

        return;
    }

    console.log(
        "My expenses:",
        expenses
    );

    const table =
        document.getElementById(
            "myExpenseTable"
        );

    table.innerHTML = "";


    if (expenses.length === 0) {

        const row =
            document.createElement("tr");

        const cell =
            document.createElement("td");

        cell.colSpan = 6;

        cell.textContent =
            "No expenses found.";

        row.appendChild(cell);

        table.appendChild(row);

        return;
    }


    expenses.forEach(function (expense) {

        const row =
            document.createElement("tr");


        const sourceCell =
            document.createElement("td");

        sourceCell.textContent =
            expense.source;


        const amountCell =
            document.createElement("td");

        amountCell.textContent =
            "₹" +
            Number(expense.amount)
                .toFixed(2);


        const forWhatCell =
            document.createElement("td");

        forWhatCell.textContent =
            expense.for_what;


        const typeCell =
            document.createElement("td");

        typeCell.textContent =
            expense.expense_type;


        const dateCell =
            document.createElement("td");

        dateCell.textContent =
            expense.expense_date;


        const actionsCell =
            document.createElement("td");


        // EDIT

        const editButton =
            document.createElement("button");

        editButton.textContent =
            "Edit";

        editButton.className =
            "primary-button";


        editButton.onclick =
            function () {

                openEditExpense(expense);

            };


        // DELETE

        const deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "Delete";

        deleteButton.style.marginLeft =
            "8px";


        deleteButton.onclick =
            function () {

                deleteMyExpense(
                    expense.id
                );

            };


        actionsCell.appendChild(
            editButton
        );

        actionsCell.appendChild(
            deleteButton
        );


        row.appendChild(sourceCell);
        row.appendChild(amountCell);
        row.appendChild(forWhatCell);
        row.appendChild(typeCell);
        row.appendChild(dateCell);
        row.appendChild(actionsCell);


        table.appendChild(row);

    });

}


// ========================================
// OPEN EDIT FORM
// ========================================

function openEditExpense(expense) {

    document.getElementById(
        "editExpenseSection"
    ).style.display = "block";


    document.getElementById(
        "editExpenseId"
    ).value = expense.id;


    document.getElementById(
        "editSource"
    ).value = expense.source;


    document.getElementById(
        "editAmount"
    ).value = expense.amount;


    document.getElementById(
        "editForWhat"
    ).value = expense.for_what;


    document.getElementById(
        "editExpenseType"
    ).value = expense.expense_type;


    document.getElementById(
        "editExpenseDate"
    ).value = expense.expense_date;


    document.getElementById(
        "editExpenseSection"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


// ========================================
// UPDATE EXPENSE
// ========================================

const editExpenseForm =
    document.getElementById(
        "editExpenseForm"
    );


if (editExpenseForm) {

    editExpenseForm.addEventListener(
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


            const expenseId =
                document.getElementById(
                    "editExpenseId"
                ).value;


            const source =
                document.getElementById(
                    "editSource"
                ).value.trim();


            const amount =
                Number(
                    document.getElementById(
                        "editAmount"
                    ).value
                );


            const forWhat =
                document.getElementById(
                    "editForWhat"
                ).value.trim();


            const expenseType =
                document.getElementById(
                    "editExpenseType"
                ).value;


            const expenseDate =
                document.getElementById(
                    "editExpenseDate"
                ).value;


            const message =
                document.getElementById(
                    "editExpenseMessage"
                );


            message.textContent =
                "Updating expense...";


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("expenses")
                    .update({

                        source: source,

                        amount: amount,

                        for_what: forWhat,

                        expense_type:
                            expenseType,

                        expense_date:
                            expenseDate

                    })
                    .eq(
                        "id",
                        expenseId
                    )
                    .eq(
                        "user_id",
                        user.id
                    )
                    .select();


            if (error) {

                console.error(
                    "UPDATE ERROR:",
                    error
                );


                message.textContent =
                    error.message;

                return;
            }


            console.log(
                "Updated expense:",
                data
            );


            if (
                !data ||
                data.length === 0
            ) {

                message.textContent =
                    "Expense was not updated. Check your permissions.";

                return;
            }


            message.textContent =
                "Expense updated successfully!";


            document.getElementById(
                "editExpenseSection"
            ).style.display = "none";


            await loadMyExpenses();

        }
    );

}


// ========================================
// CANCEL EDIT
// ========================================

const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );


if (cancelEditButton) {

    cancelEditButton.onclick =
        function () {

            document.getElementById(
                "editExpenseSection"
            ).style.display = "none";

        };

}


// ========================================
// DELETE EXPENSE
// ========================================

async function deleteMyExpense(
    expenseId
) {

    const confirmed =
        confirm(
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


    const {
        error
    } =
        await supabaseClient
            .from("expenses")
            .delete()
            .eq(
                "id",
                expenseId
            )
            .eq(
                "user_id",
                user.id
            );


    if (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        alert(
            error.message
        );

        return;
    }


    alert(
        "Expense deleted successfully!"
    );


    await loadMyExpenses();

}


// ========================================
// RUN MY EXPENSES PAGE
// ========================================

if (
    document.getElementById(
        "myExpenseTable"
    )
) {

    loadMyExpenses();

}