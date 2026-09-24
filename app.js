// ========================================
// COMPANY EXPENSE APP
// Supabase Configuration
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


            console.log(
                "New user:",
                data.user.id
            );

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


            const { data, error } =
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


            message.textContent =
                "Login successful!";


            window.location.href =
                "dashboard.html";

        }
    );
}


// ========================================
// LOAD USER
// ========================================

async function loadUser() {

    const userInfo =
        document.getElementById("userInfo");


    try {

        // Get logged-in user

        const {
            data: {
                user
            },
            error: userError

        } = await supabaseClient.auth.getUser();


        if (userError) {

            console.error(
                "User error:",
                userError
            );

            if (userInfo) {

                userInfo.innerHTML =
                    "<p>Unable to load user.</p>";

            }

            return;
        }


        // No logged-in user

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        console.log(
            "Logged-in user:",
            user.id
        );


        // Get profile

        const {
            data: profile,
            error: profileError

        } = await supabaseClient

            .from("profiles")

            .select(
                "id, employee_id, name, email, department, role"
            )

            .eq(
                "id",
                user.id
            )

            .single();


        if (profileError) {

            console.error(
                "Profile error:",
                profileError
            );


            if (userInfo) {

                userInfo.innerHTML = `
                    <h3>Profile not found</h3>

                    <p>
                        Logged in as:
                        <strong>${user.email}</strong>
                    </p>

                    <p>
                        Your account exists, but your
                        employee profile has not been created yet.
                    </p>
                `;

            }

            return;
        }


        // Display profile

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

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        if (userInfo) {

            userInfo.innerHTML = `
                <p>
                    Error loading user.
                </p>
            `;

        }

    }

}


// ========================================
// RUN LOAD USER ON DASHBOARD
// ========================================

if (
    document.getElementById("userInfo")
) {

    loadUser();

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

    // Set today's date

    document.getElementById(
        "expenseDate"
    ).value =
        new Date()
            .toISOString()
            .split("T")[0];


    expenseForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const {
                data: {
                    user
                }
            } =
                await supabaseClient.auth
                    .getUser();


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
                parseFloat(
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

                message.textContent =
                    error.message;

                return;
            }


            message.textContent =
                "Expense saved successfully!";


            expenseForm.reset();


            document.getElementById(
                "expenseDate"
            ).value =
                new Date()
                    .toISOString()
                    .split("T")[0];

        }
    );

}


// ========================================
// LOAD ALL EXPENSES
// ========================================

async function loadExpenses() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth
            .getUser();


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

        document.getElementById(
            "expensesMessage"
        ).textContent =
            error.message;

        return;
    }


    const {
        data: profiles,
        error: profilesError
    } =
        await supabaseClient

            .from("profiles")

            .select(
                "id, employee_id, name"
            );


    if (profilesError) {

        document.getElementById(
            "expensesMessage"
        ).textContent =
            profilesError.message;

        return;
    }


    const table =
        document.getElementById(
            "expenseTable"
        );


    table.innerHTML = "";


    expenses.forEach(
        function (expense) {

            const profile =
                profiles.find(
                    function (p) {

                        return p.id ===
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
// RUN LOAD EXPENSES
// ========================================

if (
    document.getElementById("userInfo")
) {

    loadUser();

    loadDashboardStats();

}
// ========================================
// LOAD DASHBOARD EXPENSE STATISTICS
// ========================================

async function loadDashboardStats() {

    try {

        const {
            data: expenses,
            error
        } = await supabaseClient
            .from("expenses")
            .select("amount, expense_type");


        if (error) {

            console.error(
                "Expense statistics error:",
                error
            );

            return;
        }


        // Starting values

        let totalAmount = 0;
        let companyAmount = 0;
        let personalAmount = 0;
        let roomAmount = 0;


        // Calculate totals

        expenses.forEach(function (expense) {

            const amount =
                Number(expense.amount) || 0;


            // Total

            totalAmount += amount;


            // Company

            if (
                expense.expense_type === "Company"
            ) {

                companyAmount += amount;

            }


            // Personal

            if (
                expense.expense_type === "Personal"
            ) {

                personalAmount += amount;

            }


            // Room Expense

            if (
                expense.expense_type === "Room Expense"
            ) {

                roomAmount += amount;

            }

        });


        // Display totals

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


    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

    }

}