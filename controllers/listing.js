const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { search } = req.query;
  const query = {
    $or: [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
      { country: new RegExp(search, "i") },
    ],
  };

  const allListings = await Listing.find(query);

  console.log(allListings);

  res.render("listings/index", { allListings }); // No .ejs extension needed
};

module.exports.newForm = (req, res) => {
  // console.log(req.user);

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

  // console.log(listing);

  // Render the template with the found listing
  res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  // console.log(url, "..", filename);

  const newListing = new Listing(req.body);

  //   console.log(newListing);

  newListing.owner = req.user._id;

  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  let saved = await newListing.save();

  console.log(saved);

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

  let originalImage = listing.image.url;

  originalImage = originalImage.replace("/upload", "/upload/h_300,w_250");

  req.flash("success", "Listing Updated!");
  res.render("listings/edit", { listing, originalImage });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = { url, filename };

    await listing.save();
  }

  res.redirect(`/listings/${id}`);
};

module.exports.destroyList = async (req, res) => {
  let { id } = req.params;
  // console.log(id);
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
