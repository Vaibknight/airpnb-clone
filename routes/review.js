const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { redirect } = require("express/lib/response");
const { isLoggedin, isAuthor } = require("../middleware");

const ReviewController = require("../controllers/review");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Post review Route
router.post(
  "/",
  isLoggedin,
  validateReview,
  wrapAsync(ReviewController.createReview)
);

router.delete(
  "/:reviewId",
  isLoggedin,
  isAuthor,
  ReviewController.destroyReview
);

module.exports = router;
