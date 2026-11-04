const express = require('express');
const options = require("./config/app.config.json");
const setupSession = require("./config/session.config");
const routes = require("./routes/routes")

const app = express();
const { port } = options.server;

// Config das sessions '/config/session.config.js' acessivel por req.session.userId 
setupSession(app);

app.get("/", (req, res) => {
    if (req.session.userId) {
        res.redirect("/pages/dashboard.html");
    } else {
        res.redirect("/pages/login.html");
    }
});

// Conexão do main router '/routes/routes.js'
app.use("/", routes);

// Servir o website estático '/www/index.html'
app.use(express.static("www",
    { "index": "index.html" },
));

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
});