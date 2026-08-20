const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();


// ===============================
// SETTINGS
// ===============================

const PORT = 3000;

// Owner account
const OWNER_EMAIL = "ayeshasafdar407@gmail.com";


// ===============================
// CORS
// ===============================

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "ai-art-generator-secret",
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));


// ===============================
// FRONTEND
// ===============================

app.use(express.static(path.join(__dirname, "..")));


// ===============================
// USERS FILE
// ===============================

const usersFile = path.join(__dirname, "users.json");


// ===============================
// READ USERS
// ===============================

function getUsers() {

    try {

        if (!fs.existsSync(usersFile)) {

            fs.writeFileSync(
                usersFile,
                "[]"
            );

        }

        const data = fs.readFileSync(
            usersFile,
            "utf8"
        );

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Error reading users:",
            error
        );

        return [];

    }

}


// ===============================
// SAVE USERS
// ===============================

function saveUsers(users) {

    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2)
    );

}


// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {

    res.json({

        message:
            "AI Art Generator API is working!"

    });

});


// ===============================
// REGISTER
// ===============================

app.post("/api/register", async (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;


    // Check fields
    if (!name || !email || !password) {

        return res.status(400).json({

            error:
                "Name, email and password are required."

        });

    }


    // Check password length
    if (password.length < 6) {

        return res.status(400).json({

            error:
                "Password must be at least 6 characters."

        });

    }


    const users = getUsers();


    // Check existing email
    const existingUser = users.find(
        user =>
            user.email.toLowerCase() ===
            email.toLowerCase()
    );


    if (existingUser) {

        return res.status(400).json({

            error:
                "Email is already registered."

        });

    }


    // Hash password
    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );


    // Create user
    const newUser = {

        id: Date.now(),

        name: name,

        email:
            email.toLowerCase(),

        password:
            hashedPassword,

        premium: false

    };


    users.push(newUser);

    saveUsers(users);


    res.json({

        message:
            "Registration successful!",

        user: {

            id: newUser.id,

            name: newUser.name,

            email: newUser.email,

            premium:
                newUser.premium

        }

    });

});


// ===============================
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {

    const {
        email,
        password
    } = req.body;


    // Check fields
    if (!email || !password) {

        return res.status(400).json({

            error:
                "Email and password are required."

        });

    }


    const users = getUsers();


    // Find user
    const user = users.find(
        user =>
            user.email ===
            email.toLowerCase()
    );


    if (!user) {

        return res.status(401).json({

            error:
                "Invalid email or password."

        });

    }


    // Check password
    const passwordMatch =
        await bcrypt.compare(
            password,
            user.password
        );


    if (!passwordMatch) {

        return res.status(401).json({

            error:
                "Invalid email or password."

        });

    }


    // Create session
    req.session.userId =
        user.id;


    res.json({

        message:
            "Login successful!",

        user: {

            id: user.id,

            name: user.name,

            email: user.email,

            premium:
                user.premium

        }

    });

});


// ===============================
// CURRENT USER
// ===============================

app.get("/api/me", (req, res) => {

    // Not logged in
    if (!req.session.userId) {

        return res.json({

            loggedIn: false

        });

    }


    const users = getUsers();


    const user = users.find(
        user =>
            user.id ===
            req.session.userId
    );


    // User not found
    if (!user) {

        return res.json({

            loggedIn: false

        });

    }


    res.json({

        loggedIn: true,

        user: {

            id: user.id,

            name: user.name,

            email: user.email,

            premium:
                user.premium

        }

    });

});


// ===============================
// LOGOUT
// ===============================

app.post("/api/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({

            message:
                "Logged out successfully."

        });

    });

});


// ===============================
// AI IMAGE GENERATOR
// ===============================

app.post("/api/generate", async (req, res) => {

    // ===========================
    // CHECK LOGIN
    // ===========================

    if (!req.session.userId) {

        return res.status(401).json({

            error:
                "Please login first."

        });

    }


    // ===========================
    // GET USERS
    // ===========================

    const users = getUsers();


    // ===========================
    // FIND CURRENT USER
    // ===========================

    const user = users.find(
        user =>
            user.id ===
            req.session.userId
    );


    if (!user) {

        return res.status(401).json({

            error:
                "User not found."

        });

    }


    // ===========================
    // OWNER / PREMIUM CHECK
    // ===========================

    const isOwner =
        user.email.toLowerCase() ===
        OWNER_EMAIL.toLowerCase();


    const hasPremium =
        user.premium === true;


    // Owner OR Premium user
    if (!isOwner && !hasPremium) {

        return res.status(403).json({

            error:
                "Premium membership is required to generate AI artwork."

        });

    }


    // ===========================
    // PROMPT
    // ===========================

    const {
        prompt
    } = req.body;


    if (!prompt || !prompt.trim()) {

        return res.status(400).json({

            error:
                "Prompt is required."

        });

    }


    // ===========================
    // IMAGE GENERATION
    // ===========================

    try {

        const encodedPrompt =
            encodeURIComponent(
                prompt.trim()
            );


        const imageUrl =
            `https://image.pollinations.ai/prompt/${encodedPrompt}`;


        res.json({

            image:
                imageUrl,

            type:
                "url"

        });


    } catch (error) {

        console.error(
            "Image generation error:",
            error
        );


        res.status(500).json({

            error:
                "Failed to generate image. Please try again."

        });

    }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `AI Art Generator running on http://localhost:${PORT}`
    );

});
