const fs = require("fs");
require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./config/db");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const PORT = process.env.PORT || 6000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Sicurity Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

// routes
fs.readdirSync("./routes").map((route) =>
    app.use("/api/v1", require(`./routes/${route}`))
);

app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    connectToDatabase();
});
