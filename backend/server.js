const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const connection = require("./connection/dbConnection");
const  router  = require("./routes/Student/student");
const payment = require("./routes/Payment/payment");
const excelroute = require("../backend/routes/excel");

app.use(
  cors({
    origin: ["http://localhost:5173",
             "https://3slearn.vercel.app"
            ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/student", router);
app.use("/payment",payment)
app.use("/excel", excelroute)

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
connection();
