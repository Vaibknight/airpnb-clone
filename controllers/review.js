const Review = require("../models/review");

const Listing = require("../models/listing");

module.exports.createReview = async (req, res) => {
  console.log(req.params.id);

  let list = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  //    console.log(list);

  newReview.author = req.user._id;
  console.log(newReview);

  list.reviews.push(newReview);

  await newReview.save();

  await list.save();

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${list._id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  console.log(id);
  console.log(reviewId);

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted Successfully!");
  res.redirect(`/listings/${id}`);
};
