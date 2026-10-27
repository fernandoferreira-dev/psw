const express = require('express');

const port = 3000;
const setupSession = require("./config/session.config");
const routes = require("./routes/routes")

const app = express();


// Config das sessions '/config/session.config.js' acessivel por req.session.userId 
setupSession(app);

// Conexão do main router '/routes/routes.js'
app.use("/", routes);

// Servir o website estático '/www/index.html'
app.use(express.static("www",
    { "index": "index.html" },
));


app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
});
