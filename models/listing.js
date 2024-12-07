const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { redirect } = require('express/lib/response');


const Review = require("./review");

const ImageSchema = new Schema({
    filename: { type: String, required: true },
    url: { type: String, required: true }
});

// Use ImageSchema for the image field
const listingSchema = new Schema({
    title: {
      type: String,
      required: true,
    },
    description: String,
    image: {
      type: String,
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
          : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews : [
      {
        type : Schema.Types.ObjectId,
        ref : "Review"
      }
    ]
  });

  listingSchema.post("findOneAndDelete", async (listing)=>{

    if(listing){
      await Review.deleteMany({_id : {$in : listing.reviews}});
    }
  })

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;