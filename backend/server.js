const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

// ✅ CORS Configuration to Allow Credentials
const corsOptions = {
  origin: "https://resume-port-ten.vercel.app", // ✅ Allow frontend origin
  credentials: true, // ✅ Allow cookies/auth headers
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ Ensure required headers are allowed
  methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allow necessary HTTP methods
};

// ✅ Apply Middleware
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Database Connection
mongoose
  .connect(process.env.DBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ DB Connection Successful");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => console.log("❌ DB Connection Error:", err));

// ✅ Import Routes
const userApp = require("./apis/userApi");
const resumeApp = require("./apis/resumeApi");
const portfolioApp = require("./apis/portfolioApi");

// ✅ Use Routes
app.use("/user-api", userApp);
app.use("/resume-api", resumeApp);
app.use("/portfolio-api", portfolioApp);
