/**
 * ============================================================================
 * File: handleFactory.js
 * Description: Factory functions for handling common Mongoose operations (CRUD).
 * Author: Buddhika Jayasingha

 * ============================================================================
 */

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

/**
 ***********************************
 **/

/**
 * @desc Delete a document
 * @param {Model} Model - Mongoose model
 * @returns {Function} Express middleware function
 */
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No tour found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

/**
 ***********************************
 **/

/**
 * @desc Update a document
 * @param {Model} Model - Mongoose model
 * @returns {Function} Express middleware function
 */
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.user && req.user.id) {
      req.body.updatedBy = req.user.id;
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 ***********************************
 **/

/**
 * @desc Create a document
 * @param {Model} Model - Mongoose model
 * @returns {Function} Express middleware function
 */
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.user && req.user.id) {
      req.body.createdBy = req.user.id;
    }

    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 ***********************************
 **/

/**
 * @desc Get a single document
 * @param {Model} Model - Mongoose model
 * @returns {Function} Express middleware function
 */
exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 ***********************************
 **/

/**
 * @desc Get all documents
 * @param {Model} Model - Mongoose model
 * @returns {Function} Express middleware function
 */
exports.getAll = (Model) =>
  (exports.getAllTours = catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain(); // This makes to show staticstics when we filter data
    const doc = await features.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  }));
