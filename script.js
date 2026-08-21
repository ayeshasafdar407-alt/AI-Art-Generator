// ===============================
// AI ART GENERATOR
// ===============================

const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const result = document.getElementById("result");

// ===============================
// ACCOUNT ELEMENTS
// ===============================

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const accountArea = document.getElementById("accountArea");
const userArea = document.getElementById("userArea");

const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");


// ===============================
// SHOW LOGIN FORM
// ===============================

loginBtn.addEventListener("click", () => {
    loginSection.style.display = "block";
    registerSection.style.display = "none";
});


// ===============================
// SHOW REGISTER FORM
// ===============================

registerBtn.addEventListener("click", () => {
    registerSection.style.display = "block";
    loginSection.style.display = "none";
});


// ===============================
// REGISTER
// ===============================

const createAccountBtn = document.getElementById("createAccountBtn");

createAccountBtn.addEventListener("click", async () => {

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    const message = document.getElementById("registerMessage");

    if (!name || !email || !password) {
        message.textContent = "Please fill all fields.";
        return;
    }

    try {

        const response = await fetch("/api/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = "❌ " + data.error;
            return;
        }

        message.textContent = "✅ Account created successfully!";

        // Clear fields
        document.getElementById("registerName").value = "";
        document.getElementById("registerEmail").value = "";
        document.getElementById("registerPassword").value = "";

        // Open login after registration
        setTimeout(() => {
            registerSection.style.display = "none";
            loginSection.style.display = "block";
        }, 1000);

    } catch (error) {

        console.error(error);

        message.textContent =
            "❌ Unable to connect to server.";
    }
});


// ===============================
// LOGIN
// ===============================

const loginSubmitBtn = document.getElementById("loginSubmitBtn");

loginSubmitBtn.addEventListener("click", async () => {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const message = document.getElementById("loginMessage");

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        return;
    }

    try {

        const response = await fetch("/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = "❌ " + data.error;
            return;
        }

        message.textContent = "✅ Login successful!";

        // Update account area
        showLoggedInUser(data.user);

        // Hide login form
        loginSection.style.display = "none";

        // Clear fields
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";

    } catch (error) {

        console.error(error);

        message.textContent =
            "❌ Unable to connect to server.";
    }
});


// ===============================
// SHOW LOGGED-IN USER
// ===============================

function showLoggedInUser(user) {

    accountArea.style.display = "none";
    userArea.style.display = "block";

    welcomeUser.textContent =
        `Welcome, ${user.name}!`;
}


// ===============================
// LOGOUT
// ===============================

logoutBtn.addEventListener("click", async () => {

    try {

        await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
        });

        accountArea.style.display = "block";
        userArea.style.display = "none";

    } catch (error) {

        console.error(error);
    }
});


// ===============================
// CHECK LOGIN WHEN WEBSITE OPENS
// ===============================

async function checkLogin() {

    try {

        const response = await fetch("/api/me", {
            credentials: "include"
        });

        const data = await response.json();

        if (data.loggedIn) {
            showLoggedInUser(data.user);
        }

    } catch (error) {

        console.error("Login check failed:", error);
    }
}

checkLogin();


// ===============================
// GENERATE ART
// ===============================

generateBtn.addEventListener("click", async () => {

    const prompt = promptInput.value.trim();

    if (prompt === "") {

        result.innerHTML =
            "<p>Please enter an image description.</p>";

        return;
    }

    result.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>🎨 Generating your artwork...</p>
            <p class="loading-hint">This may take a few seconds</p>
        </div>
    `;

    try {

        const response = await fetch("/api/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                prompt: prompt
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Image generation failed"
            );
        }

        if (!data.image) {
            throw new Error(
                "No image URL received from server"
            );
        }

        const image = data.image;

        result.innerHTML = `
            <h3>🎨 Your AI Artwork</h3>

            <img
                src="${image}"
                alt="AI Generated Artwork"
                class="generated-image"
                onload="this.style.opacity=1"
                onerror="this.parentElement.innerHTML='<p>❌ Failed to load image.</p><p>Try generating again.</p>'"
            >

            <p>
                <strong>Prompt:</strong>
                ${prompt.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </p>
        `;

    } catch (error) {

        console.error("ERROR:", error);

        result.innerHTML = `
            <p>❌ Image generation failed.</p>
            <p>Error: ${error.message}</p>
        `;
    }
});
// ===============================
// PURCHASE PREMIUM
// ===============================

const purchaseBtn = document.getElementById("purchaseBtn");
const premiumMessage = document.getElementById("premiumMessage");

if (purchaseBtn) {

    purchaseBtn.addEventListener("click", () => {

        premiumMessage.innerHTML = `
            <p>
                💳 <strong>Premium Payment</strong>
            </p>
            <p>
                Payment system is being prepared.
                Please complete payment through the official payment system.
            </p>
        `;

    });

}
