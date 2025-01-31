const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/empowerhub");
const db = mongoose.connection;

db.on("error", (error) => console.log("Error in database connection"));
db.on("open", () => console.log("Database is Connected..."));

// Import the employee router correctly
const employeeRouter = require("./routers/employeeroutes");
app.use("/Employee", employeeRouter); // Use the router for all employee routes
app.listen(8888, () => {
    console.log("The Server is live...");
});
