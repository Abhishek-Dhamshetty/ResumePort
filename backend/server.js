const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const expressSession = require("express-session");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

// ✅ Passport Configuration
require("./middlewares/passport");

app.use(expressSession({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ CORS Configuration for Production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://resume-port-ten.vercel.app", "https://resumeport.onrender.com"]
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200
};

// ✅ Apply Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.json({ 
    message: "ResumePort Backend API", 
    status: "Running",
    environment: process.env.NODE_ENV || "development"
  });
});

// ✅ Database Connection
mongoose
  .connect(process.env.DBURL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
  .then(() => {
    console.log("✅ DB Connection Successful");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => console.log("❌ DB Connection Error:", err));

// ✅ Import Routes
const userApp = require("./apis/userApi");
const resumeApp = require("./apis/resumeApi");
const googleRoutes = require("./middlewares/google-routes");

// ✅ Use Routes
app.use("/user-api", userApp);
app.use("/resume-api", resumeApp);
app.use("/api", googleRoutes);

// ✅ Enhanced Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error Details:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body
  });
  
  res.status(500).json({ 
    message: "Internal server error", 
    error: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"
  });
});

// ✅ 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
