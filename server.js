//------- Server -------

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const https = require("https");
const fs = require("fs");

// ----------------- UNCAUGHT EXCEPTION -----------------------
// This is to handle error called Uncaught Exception. We are shutting down our app when that occured.
// we have created a simulation error at the bottom
// Then in real world we need to restart the app when it shoutdown.

// Handle unhandled rejections
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 🔥 Shutting down....");
  console.log(err.name, err.message);
  process.exit(1);
});

///----------------------------------------

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = `mongodb+srv://${process.env.USERNAME}:${process.env.DATABASE_PASSWORD}@dissertation-s24010485.zb7msvo.mongodb.net/dissertation-s24010485?retryWrites=true&w=majority`;

// Conecting with the MongoDB
mongoose
  .connect(DB)
  .then(() => console.log("DB Connected"))
  .catch((err) =>
    console.error("Error connecting to DB:", err.errorResponse.errmsg)
  );

if (process.env.NODE_ENV === "development") {
  // HTTPS for local development
  const key = fs.readFileSync("server.key");
  const cert = fs.readFileSync("server.cert");
  const server = https.createServer({ key: key, cert: cert }, app);

  server.listen(3000, () => {
    console.log("Server is running on https://localhost:3000");
  });
} else {
  // HTTP for production (Render will handle HTTPS)
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// ----------------- UNHANDLE REJECTION -----------------------
// This is to handle error called Unhandle Rejection. We are shutting down our app when that occured.
// In the lectures it was simulated with mongoDB authenticated error but it wont work anymore. Thats why we have a simulation error at the bottom
// Then in real world we need to restart the app when it shoutdown.

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLE REJECTION! 🔥 Shutting down....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
