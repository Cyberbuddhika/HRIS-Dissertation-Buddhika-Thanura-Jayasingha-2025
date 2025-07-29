/**
 * ============================================================================
 * File: userModel.js
 * Description: Mongoose model definition for the User entity.
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      unique: true,
      trim: true,
      maxlength: [
        30,
        "A user name must have less than or equal to 30 characters",
      ],
      minlength: [
        3,
        "A user name must have more than or equal to 3 characters",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "leader", "admin", "super admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Password cannot be empty"],
      validate: [validator.isStrongPassword, "Please enter a strong password"],
      select: false,
    },
    passwordConfirmation: {
      type: String,
      required: [true, "Please re-enter your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    consultant_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Consultant", // Reference to the Consultant model
      required: false, // Make this optional for now if not all users are consultants
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true } // This enables `createdAt` and `updatedAt
);

/**
 * Middleware to hash password before saving user document
 */
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirmation field
  this.passwordConfirmation = undefined;
  next();
});

/**
 * Middleware to update the passwordChangedAt field
 */
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to account for token generation delay
  next();
});

/**
 * Middleware to filter out inactive users when querying
 */
// userSchema.pre(/^find/, function (next) {
//   this.where({ active: true });
//   next();
// });

/**
 * Instance method to check if password is correct
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Instance method to check if password was changed after token was issued
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

/**
 * Instance method to create password reset token
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Creating the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
