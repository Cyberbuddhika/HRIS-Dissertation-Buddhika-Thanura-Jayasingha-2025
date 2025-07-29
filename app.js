const path = require("path");
const express = require("express");
// const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const sanitizeHtml = require("sanitize-html");
const hpp = require("hpp");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const consultantRouter = require("./routes/consultantRoutes");
const userRouter = require("./routes/userRoutes");
const projectRouter = require("./routes/projectRoutes");
const milestoneRouter = require("./routes/milestoneRoutes");
const consultantChargeOutRateRoutes = require("./routes/consultantChargeOutRateRoutes");
const consultantCategoryRoutes = require("./routes/consultantCategoryRoutes");
const contractualBenefitsRoutes = require("./routes/contractualBenefitsRoutes");
const consultantLeaveRoutes = require("./routes/consultantLeaveRoutes");
const viewRouter = require("./routes/viewRoutes");
const timesheetRouter = require("./routes/timesheetRoutes");
const exphbs = require("express-handlebars");
const { create } = require("express-handlebars");
const moment = require("moment");
const accounting = require("accounting");
const cookieParser = require("cookie-parser");

// const {
//   allowInsecurePrototypeAccess,
// } = require("@handlebars/allow-prototype-access");
// const Handlebars = require("handlebars");

const app = express();

// Middleware to sanitize user inputs
const sanitizeInputs = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeHtml(obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    // console.log("Original Body:", req.body);
    sanitizeObject(req.body);
    // console.log("Sanitized Body:", req.body);
  }

  next();
};

app.use(cookieParser());

// -------------- GLOBAL MIDDLEWARES -------------- //

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Helmet Security Configuration
if (process.env.NODE_ENV === "development") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://cdnjs.cloudflare.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdnjs.cloudflare.com",
          ],
          imgSrc: [
            "'self'",
            "https://images.pexels.com",
            "https://images.unsplash.com",
            "https://cdnjs.cloudflare.com",
            "https://api.mapbox.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: [
            "'self'",
            "https://raw.githubusercontent.com",
            "https://cdnjs.cloudflare.com",
            "https://restcountries.com",
            "https://countriesnow.space",
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdnjs.cloudflare.com",
          ],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      noSniff: true, // Sets X-Content-Type-Options
      referrerPolicy: { policy: "no-referrer" },
      crossOriginOpenerPolicy: false, // Disable COOP for local development
      crossOriginEmbedderPolicy: false, // Disable COEP for local development
    })
  );
} else {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://cdnjs.cloudflare.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdnjs.cloudflare.com",
          ],
          imgSrc: ["'self'"],
          connectSrc: [
            "'self'",
            "https://raw.githubusercontent.com",
            "https://restcountries.com",
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdnjs.cloudflare.com",
          ],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      noSniff: true, // Sets X-Content-Type-Options
      referrerPolicy: { policy: "no-referrer" },
      crossOriginOpenerPolicy: { policy: "same-origin" }, // Enable COOP for production
      crossOriginEmbedderPolicy: { policy: "require-corp" }, // Enable COEP for production
    })
  );
}

// // Development logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  handler: (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      const ip = req.ip;
      const username = req.body?.email || "Unknown";
      console.error(
        `Rate limit triggered for IP: ${ip}, Username: ${username}`
      );
      // For API: send JSON
      return res.status(429).json({
        status: "fail",
        message: "Too many requests from this IP, please try again in an hour!",
      });
    }

    // For views: render a 429 error page
    res.status(429).render("error429", {
      title: "Too Many Requests",
      message:
        "You've made too many requests in a short period. Please wait and try again later.",
    });
  },
});

// 1. Rate limiter for API
app.use("/api", limiter); // Only returns JSON

// 2. Rate limiter for views
app.use("/", limiter); // Renders error429.hbs

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  handler: (req, res, next) => {
    const ip = req.ip;
    const username = req.body?.email || "Unknown";
    console.error(`Rate limit triggered for IP: ${ip}, Username: ${username}`);
    return next(
      new AppError("Too many login attempts. Please wait 15 minutes.", 429)
    );
  },
});

app.use("/api/v1/users/login", authLimiter); // Limitting login attempts

// Body Parser, reading data from body into req.body - we have added a limit of 10kb so that we won't be reading body data larger than 10kb
app.use(express.json());

// Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// Custom Data Sanitization against XSS
app.use(sanitizeInputs);

// Prevent Parameter Pollution - This always must use at the end of middlewares
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// // Set the view engine to Handlebars with prototype access enabled
// app.engine(
//   "handlebars",
//   exphbs.engine({
//     handlebars: allowInsecurePrototypeAccess(Handlebars),
//   })
// );
// app.set("view engine", "handlebars");
// app.set("views", path.join(__dirname, "views"));

// Set the view engine to Handlebars
const hbs = create({
  extname: ".handlebars",
  helpers: {
    formatDate: (date) => {
      return moment(date).format("DD MMM YYYY");
    },
    formatDateTime: (date) => {
      return moment(date).format("DD MMM YYYY, HH:mm:ss [UTC]");
    },
    extractProjectNames: (projects) => {
      if (!Array.isArray(projects)) return "";
      return projects
        .map((project) => {
          return `<a href="/projects/${project._id}" class="text-secondary-600 hover:underline">${project.name}</a>`;
        })
        .join(", ");
    },
    extractMilestoneNames: (milestones) => {
      // First, sort milestones by project name
      const sortedMilestones = milestones.sort((a, b) => {
        const projectA = a.project.toLowerCase(); // Convert to lowercase to ensure case-insensitive sorting
        const projectB = b.project.toLowerCase();

        if (projectA < projectB) return -1;
        if (projectA > projectB) return 1;
        return 0; // If equal
      });

      // Map and return sorted milestones
      return sortedMilestones.map((milestone) => {
        const projectName = milestone.project;
        const milestoneName = milestone.name;
        return { projectName, milestoneName };
      });
    },
    eq: (a, b) => {
      return a === b;
    },
    eqTrueFalse: (a, b) => {
      return a === (b === "true");
    },
    isWithinOrBeforeCurrentMonth: (date) => {
      const now = moment();
      return moment(date).isSameOrBefore(now, "month");
    },
    extractConsultantNamesForProject: (consultants) => {
      if (!Array.isArray(consultants)) return "";

      return consultants
        .map((consultant) => {
          return consultant.consultant; // Now consultant.consultant is an object with a name field
        })
        .join(", ");
    },
    extractConsultantNames: (consultants) => {
      if (!Array.isArray(consultants)) return "";
      return consultants
        .map((consultant) => consultant.consultant.name)
        .join(", ");
    },
    formatMoney: (value) => {
      return accounting.formatMoney(value);
    },
    // New helpers for comparisons and arithmetic
    gt: (a, b) => {
      return a > b;
    },
    lt: (a, b) => {
      return a < b;
    },
    add: (a, b) => {
      return a + b;
    },
    subtract: (a, b) => {
      return a - b;
    },
  },
  partialsDir: path.join(__dirname, "views", "partials"),
});
app.engine(".handlebars", hbs.engine);
app.set("view engine", ".handlebars");
app.set("views", path.join(__dirname, "views"));

// -------------- ROUTES-------------- //

// Creating a view router
app.use("/", viewRouter);

app.use("/api/v1/consultants", consultantRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/milestones", milestoneRouter);
app.use("/api/v1/timesheet", timesheetRouter);
app.use("/api/v1/consultant-charge-out-rates", consultantChargeOutRateRoutes);
app.use("/api/v1/consultant-category", consultantCategoryRoutes);
app.use("/api/v1/consultant-benifits", contractualBenefitsRoutes);
app.use("/api/v1/consultant-leaves", consultantLeaveRoutes);

// app.use("/mapbox", (req, res) => {
//   const url = `https://api.mapbox.com${req.url}`;
//   req.pipe(request(url)).pipe(res);
// });

//-------------------------------
// This is a global catch all route. This will catch any route that user try.
// Since the route order is very important, when user enter incorrect route, it will first check the above two routes.
// if the given routes are'nt matching the above two, then it will excute the below route.
// afterall, routes are middlewares.

// Catch all undefined routes (404 errors)
app.all("*", (req, res, next) => {
  // Check if the user is logged in by verifying the presence of a JWT cookie
  if (!req.cookies.jwt || req.cookies.jwt === "loggedout") {
    return res.redirect("/login");
  }

  // Create a new AppError instance and pass it to the next middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  // Set the default status code and status if not already set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Check if the request is for an API and handle accordingly
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Handle NON-API errors
  if (err.statusCode === 403) {
    return res.status(403).render("error403", {
      title: "Access Denied",
      message: err.message || "You do not have permission to access this page.",
    });
  } else {
    // Render the error page for non-API routes
    res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      message: err.message || "Please try again later.",
    });
  }
});

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.statusCode || 500).render("error", {
//     title: "Something went wrong",
//     message: err.message || "Please try again later.",
//   });
// });

//-------------------------------------

// -- Route to catch all errors
app.use(globalErrorHandler);

module.exports = app;
