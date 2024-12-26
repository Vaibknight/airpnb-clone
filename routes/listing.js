const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { listingSchema, reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");

const { isLoggedin, isOwner } = require("../middleware");

const ListingController = require("../controllers/listing");

const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router
  .route("/")
  .get(ListingController.index)
  .post(upload.single("image"), ListingController.createListing);

router.get("/new", isLoggedin, ListingController.newForm);

router
  .route("/:id")
  .get(wrapAsync(ListingController.showList))
  .put(
    isLoggedin,
    isOwner,
    upload.single("image"),
    ListingController.updateListing
  )
  .delete(isLoggedin, isOwner, ListingController.destroyList);

router.get("/:id/edit", isOwner, ListingController.renderEditForm);

module.exports = router;
