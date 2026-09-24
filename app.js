// ========================================
// SUPABASE CONNECTION
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
// TEST APP
// ========================================

function testApp() {

    alert("Supabase connection setup is ready!");

}
// ========================================
// SIGN UP
// ========================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document.getElementById("name")
                    .value
                    .trim();

            const email =
                document.getElementById("email")
                    .value
                    .trim();

            const password =
                document.getElementById("password")
                    .value;

            const department =
                document.getElementById("department")
                    .value
                    .trim();

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

                            department: department

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


            setTimeout(function() {

                window.location.href =
                    "index.html";

            }, 1500);

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
        async function(event) {

            event.preventDefault();


            const email =
                document.getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document.getElementById("loginPassword")
                    .value;


            const message =
                document.getElementById("loginMessage");


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

                console.error(error);

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


// ========================================
// LOAD USER
// ========================================

async function loadUser() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


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
            .select("*")
            .eq("id", user.id)
            .single();


    if (error) {

        console.error(error);

        return;
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

        `;

    }

}


if (
    document.getElementById("userInfo")
) {

    loadUser();

}


// ========================================
// LOGOUT
// ========================================

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


// ========================================
// ADD EXPENSE
// ========================================

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


            const {
                data: {
                    user
                }
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (!user) {

                window.location.href =
                    "index.html";

                return;
            }


            const source =
                document.getElementById(
                    "source"
                )
                .value
                .trim();


            const amount =
                parseFloat(
                    document.getElementById(
                        "amount"
                    ).value
                );


            const forWhat =
                document.getElementById(
                    "forWhat"
                )
                .value
                .trim();


            const expenseType =
                document.getElementById(
                    "expenseType"
                ).value;


            const selectedDate =
                document.getElementById(
                    "expenseDate"
                ).value;


            const {
                error
            } =
                await supabaseClient
                    .from("expenses")
                    .insert({

                        user_id: user.id,

                        source: source,

                        amount: amount,

                        for_what: forWhat,

                        expense_type:
                            expenseType,

                        expense_date:
                            selectedDate

                    });


            const message =
                document.getElementById(
                    "expenseMessage"
                );


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


// ========================================
// VIEW ALL EXPENSES
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
        function(expense) {

            const profile =
                profiles.find(
                    function(profile) {

                        return (
                            profile.id ===
                            expense.user_id
                        );

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
                "₹" + expense.amount;


            const whatCell =
                document.createElement(
                    "td"
                );

            whatCell.textContent =
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
                whatCell
            );

            row.appendChild(
                typeCell
            );

            row.appendChild(
                dateCell
            );


            table.appendChild(row);

        }
    );

}


if (
    document.getElementById(
        "expenseTable"
    )
) {

    loadExpenses();

}