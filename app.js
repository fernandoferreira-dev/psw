const express = require('express');
const reqiestHandlers = require("./scripts/request-handlers.js");
const port = 3000;

const app = express();

app.use(express.static("www",
  { "index" : "index.html" },
));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
