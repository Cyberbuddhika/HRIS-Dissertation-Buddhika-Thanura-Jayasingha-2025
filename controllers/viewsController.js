const Consultant = require("../models/consultantModel");
const Milestone = require("../models/milestoneModel");
const Project = require("./../models/projectModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const { getConsultantMilestones } = require("./../utils/aggregationHelpers");

exports.getConsultantOverview = catchAsync(async (req, res, next) => {
  // 1. Get all consultants data from collection
  const consultants = await Consultant.find().lean();

  // 2. For each consultant, fetch their milestones
  const consultantsWithMilestones = await Promise.all(
    consultants.map(async (consultant) => {
      // Fetch milestones for the current consultant using similar logic
      const milestones = await getConsultantMilestones([
        consultant._id.toString(),
      ]);

      // Combine consultant data with milestones
      return {
        ...consultant,
        assignedMilestones: milestones[0] ? milestones[0].milestones : [],
      };
    }),
  );

  // 3. Log the final data for debugging
  // console.log("Consultants with Milestones:", consultantsWithMilestones);

  // 4. Render the template using the consultants data with milestones
  res.status(200).render("consultantOverview", {
    title: "All Consultants",
    consultants: consultantsWithMilestones,
  });
});

// COnsultant Overview with Pagination

// exports.getConsultantOverview = catchAsync(async (req, res, next) => {
//   // Set the page number and limit for pagination
//   const page = req.query.page * 1 || 1;
//   const limit = 10;
//   const skip = (page - 1) * limit;

//   // 1. Get all consultants data from collection, limiting to only the fields needed
//   const consultants = await Consultant.find()
//     .select(
//       "name designation consultantCategory contractEndDate consultantStatus assignedMilestones profilePicture",
//     )
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   // 2. For each consultant, fetch their milestones
//   const consultantsWithMilestones = await Promise.all(
//     consultants.map(async (consultant) => {
//       // Fetch milestones for the current consultant using similar logic
//       const milestones = await getConsultantMilestones([
//         consultant._id.toString(),
//       ]);

//       // Combine consultant data with milestones
//       return {
//         ...consultant,
//         assignedMilestones: milestones[0] ? milestones[0].milestones : [],
//       };
//     }),
//   );

//   // 3. Get the total count of consultants for pagination
//   const totalConsultants = await Consultant.countDocuments();
//   const totalPages = Math.ceil(totalConsultants / limit);

//   // 4. Render the template using the consultants data with milestones
//   res.status(200).render("consultantOverview", {
//     title: "All Consultants",
//     consultants: consultantsWithMilestones,
//     currentPage: page,
//     totalPages: totalPages,
//   });
// });

exports.getConsultantView = catchAsync(async (req, res, next) => {
  const consultant = await Consultant.findById(req.params.id)
    .lean()
    .populate("lineManager", "name _id");
  if (!consultant) {
    return next(new AppError("No consultant found with that ID", 404));
  }

  const milestones = await getConsultantMilestones([consultant._id.toString()]);
  consultant.assignedMilestones = milestones[0] ? milestones[0].milestones : [];

  res.status(200).render("consultantView", {
    title: consultant.name,
    consultant: consultant,
  });
});

exports.getProjectOverview = catchAsync(async (req, res, next) => {
  // Fetch projects from the database and populate supervisor and leader fields
  const projects = await Project.find()
    .populate("projectLeader", "name")
    .lean();

  // Render the projectOverview template with fetched projects
  res.status(200).render("projectOverview", {
    title: "All Projects",
    projects: projects,
  });
});

exports.getMilestoneOverview = catchAsync(async (req, res, next) => {
  // Fetch projects from the database and populate supervisor and leader fields
  const milestones = await Milestone.find()
    .populate("project", "name")
    .populate("consultants.consultant", "name _id")
    .lean();

  // Render the projectOverview template with fetched projects
  res.status(200).render("milestoneOverview", {
    title: "All Milestones",
    milestones: milestones,
  });
});

exports.getProjectView = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate("projectLeader", "name")
    .lean();

  if (!project) {
    return next(new AppError("No project found with that ID", 404));
  }

  res.status(200).render("projectView", {
    title: project.name,
    project: project,
  });
});

exports.getMilestoneView = catchAsync(async (req, res, next) => {
  // Fetch projects from the database and populate supervisor and leader fields
  const milestone = await Milestone.findById(req.params.id)
    .populate("project", "name")
    .populate("consultants.consultant")
    .populate("milestoneLeader", "name _id")
    .lean();

  // Render the projectOverview template with fetched projects
  res.status(200).render("milestoneView", {
    title: milestone.name,
    milestone: milestone,
  });
});

exports.getDashbaordView = catchAsync(async (req, res) => {
  // Render the projectOverview template with fetched projects
  res.status(200).render("dashbaordView", {
    title: "Dashbaord",
  });
});

exports.consultantCreate = catchAsync(async (req, res) => {
  // Render the consultant create from
  res.status(200).render("consultantCreate", {
    title: "Creating a new consultant",
  });
});

exports.consultantUpdate = catchAsync(async (req, res) => {
  res.status(200).render("consultantUpdate", {
    title: "Edit Consultant",
  });
});

exports.projectCreate = catchAsync(async (req, res) => {
  // Render the consultant create from
  res.status(200).render("projectCreate", {
    title: "Creating a new project",
  });
});

exports.projectUpdate = catchAsync(async (req, res) => {
  res.status(200).render("projectUpdate", {
    title: "Edit Project",
  });
});

exports.milestoneCreate = catchAsync(async (req, res) => {
  // Render the consultant create from
  res.status(200).render("milestoneCreate", {
    title: "Creating a new deliverable",
  });
});

exports.milestoneUpdate = catchAsync(async (req, res) => {
  res.status(200).render("milestoneUpdate", {
    title: "Edit Deliverable",
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render("loginForm", {
    title: "Login",
    error: req.query.error, // Pass the error message to the view
  });
});

exports.timesheet = catchAsync(async (req, res) => {
  res.status(200).render("timesheet", {
    title: "Timesheet",
    error: req.query.error, // Pass the error message to the view
  });
});

exports.timesheetApprovalView = catchAsync(async (req, res) => {
  res.status(200).render("timesheetApprovalView", {
    title: "Timesheet Approval",
    error: req.query.error, // Pass the error message to the view
  });
});

// exports.getUserView = catchAsync(async (req, res, next) => {
//   console.log(`Fetching user with ID: ${req.params.id}`);
//   const user = await User.findById(req.params.id)
//     .lean()
//     .populate("consultant_id");
//   if (!user) {
//     return next(new AppError("No user found with that ID", 404));
//   }

//   console.log("User data found:", user);

//   res.status(200).render("userView", {
//     title: user.name,
//     user: user,
//   });
// });

exports.getUserOverview = catchAsync(async (req, res, next) => {
  // 1. Get all users data from collection
  const users = await User.find({ role: { $ne: "super admin" } }) // Exclude "super admin"
    .lean()
    .populate({
      path: "consultant_id",
      select: "name", // Fetch only the user's name
    })
    .select("name email role passwordChangedAt userStatus active");

  // 4. Render the template using the users data
  res.status(200).render("userOverview", {
    title: "All Users",
    users: users,
  });
});

exports.getUserView = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).lean().populate({
    path: "consultant_id",
    select: "name", // Fetch only the user's name
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).render("userView", {
    title: user.name,
    user: user,
  });
});

exports.userUpdate = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).lean(); // Fetch user

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).render("userUpdate", {
    title: `Edit ${user.name}`,
    user: user, // Pass the user object to the template
  });
});

exports.userCreate = catchAsync(async (req, res) => {
  try {
    // Fetch all consultants to populate dropdown (ensure consultant model is correct)
    const consultants = await Consultant.find().select("name _id").lean();

    // If no consultants found, send an empty array
    if (!consultants) {
      return next(new AppError("No consultants found", 404));
    }

    // Render user creation view
    res.status(200).render("userCreate", {
      title: "Create New User",
      consultants, // Pass consultants list to Handlebars
    });
  } catch (err) {
    console.error(" Error in userCreate controller:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

exports.viewProfile = catchAsync(async (req, res, next) => {
  try {
    // Fetch the logged-in user from `req.user` (assuming you use authentication middleware)
    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found or not authenticated.",
      });
    }

    // Render the profile view with user data
    res.status(200).render("meView", {
      title: "My Profile",
      user, // Pass user data to Handlebars
    });
  } catch (err) {
    console.error("Error in viewProfile controller:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

exports.timesheetSummaryView = catchAsync(async (req, res, next) => {
  try {
    // Render the profile view with user data
    res.status(200).render("timesheetSummaryView", {
      title: "Timesheet Summary",
      user: req.user,
    });
  } catch (err) {
    console.error("Error in viewProfile controller:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

exports.timesheetProcessView = catchAsync(async (req, res, next) => {
  try {
    const consultants = await Consultant.find().select("name _id").lean();

    res.status(200).render("timesheetProcessView", {
      title: "Timesheet Process",
      consultants,
    });
  } catch (err) {
    console.error("Error in timesheetProcessView controller:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

exports.timesheetReportView = catchAsync(async (req, res, next) => {
  try {
    // Render the profile view with user data
    res.status(200).render("timesheetReportView", {
      title: "Timesheet Reports",
    });
  } catch (err) {
    console.error("Error in viewProfile controller:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});
