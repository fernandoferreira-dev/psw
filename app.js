const express = require('express');
const session = require('express-session');

const port = 3000;
const app = express();
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    throw new Error("SESSION_SECRET has to be set before starting the server");
}

const routesUser = require("./routes/user.routes")

app.use(express.json());
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 8 * 60 * 60 * 1000,
    },
}));

app.use("/users", routesUser);

app.use(express.static("www",
    { "index": "index.html" },
));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
