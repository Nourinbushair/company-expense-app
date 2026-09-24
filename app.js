
const SUPABASE_URL = "https://kdabddhuxypcihlbubzi.supabase.co";
const SUPABASE_KEY = "sb_publishable_nkJMnNS4PSIQlNfGvXh7Gg_k9C7X9TA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

function testApp() {
    alert("Supabase connection setup is ready!");
}

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const department =
            document.getElementById("department").value.trim();

        const message =
            document.getElementById("message");

        message.textContent = "Creating account...";

        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

        if (error) {

            message.textContent = error.message;

            return;
        }

        if (!data.user) {

            message.textContent =
                "Account creation failed.";

            return;
        }

        message.textContent =
            "Account created successfully!";

    });
}

const userId = data.user.id;

const { error: profileError } =
    await supabaseClient
        .from("profiles")
        .insert({
            id: userId,
            employee_id: "TEMP",
            name: name,
            email: email,
            department: department,
            role: "employee"
        });

if (profileError) {

    message.textContent =
        "Account created, but profile setup failed: "
        + profileError.message;

    return;
}

message.textContent =
    "Account created successfully!";

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");

        message.textContent = "Logging in...";

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
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

    });
}

async function loadUser() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        window.location.href = "index.html";

        return;
    }

    const {
        data: profile,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {

        console.error(error);

        return;
    }

    const userInfo =
        document.getElementById("userInfo");

    if (userInfo) {

        userInfo.innerHTML = `
            <h3>Welcome, ${profile.name}</h3>

            <p>
                Employee ID:
                <strong>${profile.employee_id}</strong>
            </p>

            <p>
                Department:
                ${profile.department || "Not specified"}
            </p>
        `;
    }
}

if (document.getElementById("userInfo")) {

    loadUser();

}

async function logout() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {

        alert(error.message);

        return;
    }

    window.location.href =
        "index.html";
}

const expenseForm =
    document.getElementById("expenseForm");

if (expenseForm) {

    document.getElementById("expenseDate").value =
        new Date().toISOString().split("T")[0];

    expenseForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const {
                data: {
                    user
                }
            } = await supabaseClient.auth.getUser();

            if (!user) {

                window.location.href =
                    "index.html";

                return;
            }

            const source =
                document.getElementById("source").value.trim();

            const amount =
                parseFloat(
                    document.getElementById("amount").value
                );

            const forWhat =
                document.getElementById("forWhat").value.trim();

            const expenseType =
                document.getElementById("expenseType").value;

            const expenseDate =
                document.getElementById("expenseDate").value;

            const {
                error
            } = await supabaseClient
                .from("expenses")
                .insert({

                    user_id: user.id,

                    source: source,

                    amount: amount,

                    for_what: forWhat,

                    expense_type: expenseType,

                    expense_date: expenseDate

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

async function loadExpenses() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        window.location.href =
            "index.html";

        return;
    }

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
        .order("expense_date", {
            ascending: false
        });

    if (error) {

        document.getElementById(
            "expensesMessage"
        ).textContent = error.message;

        return;
    }

    const {
        data: profiles
    } = await supabaseClient
        .from("profiles")
        .select(
            "id, employee_id, name"
        );

    const table =
        document.getElementById(
            "expenseTable"
        );

    table.innerHTML = "";

    expenses.forEach(function(expense) {

        const profile =
            profiles.find(
                p => p.id === expense.user_id
            );

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${profile
                    ? profile.employee_id
                    : "Unknown"}
            </td>

            <td>
                ${expense.source}
            </td>

            <td>
                ₹${expense.amount}
            </td>

            <td>
                ${expense.for_what}
            </td>

            <td>
                ${expense.expense_type}
            </td>

            <td>
                ${expense.expense_date}
            </td>

        `;

        table.appendChild(row);

    });
}

if (document.getElementById("expenseTable")) {

    loadExpenses();

}