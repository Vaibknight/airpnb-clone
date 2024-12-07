const express = require("express");
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync');
const { reviewSchema} = require("../schema");
const ExpressError = require('../utils/ExpressError');

const Review = require("../models/review");
const { redirect } = require('express/lib/response');



const validateReview = (req, res, next) =>{

    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
     }else{
        next();
     }

};

router.post("/", validateReview, wrapAsync(  async (req, res)=>{
    console.log(req.params.id);
    
    let list = await  Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
 //    console.log(list);
    
   list.reviews.push(newReview);
 
   await newReview.save();
   await list.save();
 
 
 
   res.redirect(`/listings/${list._id}`);
    
 }));
 
 
 router.delete("/:reviewId", async (req, res)=>{
     let {id, reviewId} = req.params;
 
     console.log(id);
     console.log(reviewId);
     
 
     await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
 
    await  Review.findByIdAndDelete(reviewId);
 
    res.redirect(`/listings/${id}`);
 });
 
 
 module.exports = router;