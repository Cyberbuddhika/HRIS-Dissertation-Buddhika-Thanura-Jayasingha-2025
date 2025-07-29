/**
 * ============================================================================
 * File: auth.js
 * Description: Authentication and Authorization functions for user management.
 * Author: Buddhika Jayasingha
 * ============================================================================
 */

const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");
const Consultant = require("./../models/consultantModel");

/**
 * Creates and sends a JWT token to the client.
 * @param {Object} user - The user object.
 * @param {number} statusCode - The HTTP status code.
 * @param {Object} res - The response object.
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove the password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

/**
 ***********************************
 **/

// Function to sign the JWT token
const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

/**
 ***********************************
 **/

/**
 * Logs in the user.
 * @route POST /api/v1/users/login
 * @access Public
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email & password!", 400));
  }

  // 2. Check if user exists & password is correct
  const user = await User.findOne({ email }).select("+password +active");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email & password!", 401));
  }

  // 3. Check if user is Active (Blocking inactive users)
  if (!user.active) {
    console.warn(`Blocked login attempt by inactive user: ${user.email}`);
    sessionStorage.clear();
    return next(
      new AppError(
        "Your account has been disabled. Please contact the Operations Department.",
        403
      )
    );
  }

  // 4. Check if linked consultant is inactive
  if (user.consultant_id) {
    const consultant = await Consultant.findById(user.consultant_id).select(
      "consultantStatus"
    );

    if (!consultant || consultant.consultantStatus !== "Active") {
      return next(
        new AppError(
          "Your consultant account is inactive. Please contact the Operations Department.",
          403
        )
      );
    }
  }

  // 5. If everything is ok, send token to client
  createSendToken(user, 200, res);

  console.log("Headers already sent?", res.headersSent);
});

/**
 ***********************************
 **/

/**
 * Logs out the user.
 * @route POST /api/v1/users/logout
 * @access authenticated
 */

exports.logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ status: "success" });
};

/**
 ***********************************
 **/

/**
 * Middleware to protect routes by requiring authentication.
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // if (!token) {
  //   return next(
  //     new AppError("You are not logged in! Please login to get access.", 401),
  //   );
  // }

  if (!token) {
    console.log("Token not found, redirecting to login");
    return res.redirect(
      "/login?error=You are not logged in! Please login to get access."
    );
  }

  // 2. Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id).select("+active");

  // if (!currentUser) {
  //   return next(
  //     new AppError("The user belonging to this token no longer exists.", 401),
  //   );
  // }

  if (!currentUser || !currentUser.active) {
    return res.redirect("/login?error=Account disabled");
  }

  // 4. Check if user changed password after the token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError("User recently changed password! Please log in again.", 401),
  //   );
  // }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res.redirect(
      "/login?error=User recently changed password! Please log in again."
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

/**
 ***********************************
 **/

/**
 * Middleware to restrict access to certain roles.
 * @param {...string} roles - The roles to allow.
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};
// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       // For view routes (non-API), render a 403 page
//       if (!req.originalUrl.startsWith("/api")) {
//         return res.status(403).render("403", {
//           title: "Access Denied",
//           message: "You do not have permission to access this page.",
//         });
//       }

//       // For API, return error via next()
//       return next(
//         new AppError("You do not have permission to perform this action.", 403),
//       );
//     }

//     next();
//   };
// };

/**
 ***********************************
 **/

/**
 * Sends a password reset token to the user's email.
 * @route POST /api/v1/users/forgotPassword
 * @access Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // 2. Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

/**
 ***********************************
 **/

/**
 * Resets the user's password using the provided token.
 * @route PATCH /api/v1/users/resetPassword/:token
 * @access Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update changePasswordAt property for the user
  // 4. Log the user in, send JWT
  createSendToken(user, 200, res);
});

/**
 ***********************************
 **/

/**
 * Updates the user's password when they are logged in.
 * @route PATCH /api/v1/users/updateMyPassword
 * @access Private (Authenticated User)
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get the user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2. Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3. If so, update password
  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  await user.save();

  // 4. Log user in, send JWT
  createSendToken(user, 200, res);
});

/// ------Must be useful to render page content based on the user

exports.isLoggedIn = async (req, res, next) => {
  // 1). Getting cookie and check of it's there
  let token;
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      // 2). Verification cookie
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      ); // we made this to return a promise using built in util module from node

      // 3). Check if user still exists
      const currentUser = await User.findById(decode.id);

      if (!currentUser) {
        return next();
      }
      // 4). Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decode.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser; // here we use locals method in res to pass user to the pug.
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
