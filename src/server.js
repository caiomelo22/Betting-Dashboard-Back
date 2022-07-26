const express = require("express");
const routes = require("./routes");
var cors = require("cors");

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use("/api", routes);
app.use(express.static('public'));

app.listen(port, () => console.log(`Listening on port: ${port}`));
