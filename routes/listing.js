const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { listingSchema, reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");

const { isLoggedin, isOwner } = require("../middleware");

const ListingController = require("../controllers/listing");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
router.get("/", ListingController.index);

// New Route
router.get("/new", isLoggedin, ListingController.newForm);

// Show Route
router.get("/:id", wrapAsync(ListingController.showList));

// Create Route
router.post("/", ListingController.createListing);

// Update Route
router.put("/:id", isLoggedin, isOwner, ListingController.updateListing);

// Edit Route

router.get("/:id/edit", isOwner, ListingController.renderEditForm);

router.delete("/:id", isLoggedin, isOwner, ListingController.destroyList);

module.exports = router;
