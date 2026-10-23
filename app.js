const express = require('express');

const port = 3000;
const app = express();

const routesUser = require("./routes/routesUser")


app.use("/users", routesUser);

app.use(express.static("www",
    { "index": "index.html" },
));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
