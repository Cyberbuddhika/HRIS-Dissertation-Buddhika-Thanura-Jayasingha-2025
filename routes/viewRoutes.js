const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/login", viewsController.getLoginForm);

router.use(authController.isLoggedIn);

router.get("/", authController.protect, viewsController.getDashbaordView);

router.get("/me", authController.protect, viewsController.viewProfile);

router.get("/timesheet", authController.protect, viewsController.timesheet);

router.get(
  "/consultant/new",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.consultantCreate,
);

router.get(
  "/consultant/:id",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.getConsultantView,
);

router.get(
  "/consultants",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.getConsultantOverview,
);

router.get(
  "/consultant/:id/edit",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.consultantUpdate,
);
router.get(
  "/projects",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.getProjectOverview,
);
router.get(
  "/projects/new",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.projectCreate,
);
router.get(
  "/projects/:id",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.getProjectView,
);
router.get(
  "/projects/:id/edit",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.projectUpdate,
);
// router.get("/milestones", viewsController.getMilestoneOverview); Milestone Overview removed from the system. 2024 Aug 28
router.get(
  "/milestones/new",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.milestoneCreate,
);
router.get(
  "/milestones/:id",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.getMilestoneView,
);
router.get(
  "/milestones/:id/edit",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.milestoneUpdate,
);

router.get(
  "/timesheetApprovalView",
  authController.protect,
  authController.restrictTo("leader", "admin", "super admin"),
  viewsController.timesheetApprovalView,
);
router.get(
  "/timesheetSummaryView",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.timesheetSummaryView,
);

router.get(
  "/timesheetProcessView",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.timesheetProcessView,
);

router.get(
  "/timesheetReportView",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.timesheetReportView,
);

router.get(
  "/users",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.getUserOverview,
);
router.get(
  "/users/new",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.userCreate,
);
router.get(
  "/users/:id",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.getUserView,
);
router.get(
  "/users/:id/edit",
  authController.protect,
  authController.restrictTo("admin", "super admin"),
  viewsController.userUpdate,
);

// router.get("/tour/:slug", viewsController.getTour); // we are using slug here instead of id becuase in overview page for "details" button
// // we used the slug in the URL.
// router.get("/login", viewsController.getLoginForm);

module.exports = router;
