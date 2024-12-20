const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { listingSchema, reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");

const { isLoggedin } = require("../middleware");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.get("/", async (req, res) => {
  const allListings = await Listing.find({});

  res.render("listings/index", { allListings }); // No .ejs extension needed
});

// New Route
router.get("/new", isLoggedin, (req, res) => {
  console.log(req.user);

  res.render("listings/new");
});

router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    // Find the listing and populate reviews
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested doesn't exist!");

      res.redirect("/listings");
    }

    console.log(listing);

    // Render the template with the found listing
    res.render("listings/show", { listing });
  })
);

router.post("/", async (req, res, next) => {
  const newListing = new Listing(req.body);

  //   console.log(newListing);

  newListing.owner = req.user._id;

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
});

router.put("/:id", isLoggedin, async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body });
  res.redirect(`/listings/${id}`);
});

// Edit Route

router.get("/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested doesn't exist!");

    res.redirect("/listings");
  }

  req.flash("success", "Listing Updated!");
  res.render("listings/edit", { listing });
});

router.delete("/:id", isLoggedin, async (req, res) => {
  let { id } = req.params;
  console.log(id);
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
});

module.exports = router;
