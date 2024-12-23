const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});

  res.render("listings/index", { allListings }); // No .ejs extension needed
};

module.exports.newForm = (req, res) => {
  console.log(req.user);

  res.render("listings/new");
};

module.exports.showList = async (req, res, next) => {
  const { id } = req.params;

  // Find the listing and populate reviews
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested doesn't exist!");

    res.redirect("/listings");
  }

  console.log(listing);

  // Render the template with the found listing
  res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res, next) => {
  const newListing = new Listing(req.body);

  //   console.log(newListing);

  newListing.owner = req.user._id;

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested doesn't exist!");

    res.redirect("/listings");
  }

  req.flash("success", "Listing Updated!");
  res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndUpdate(id, { ...req.body });
  res.redirect(`/listings/${id}`);
};

module.exports.destroyList = async (req, res) => {
  let { id } = req.params;
  console.log(id);
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
