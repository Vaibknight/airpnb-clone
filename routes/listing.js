const express = require("express");
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync');
const { listingSchema , reviewSchema} = require("../schema");
const ExpressError = require('../utils/ExpressError');
const Listing = require("../models/listing");


const validateListing = (req, res, next) =>{

    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
     }else{
        next();
     }

};

router.get('/', async (req, res) => {
    const allListings = await Listing.find({});


res.render('listings/index', {allListings}); // No .ejs extension needed

});




// New Route
router.get("/new",(req,res)=>{
res.render("listings/new");
})



router.get(
"/:id",
wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    // Find the listing and populate reviews
    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
        // Handle case where no listing is found
        return res.status(404).send("Listing not found");
    }

    // Render the template with the found listing
    res.status(200).render("listings/show", { listing });
})
);



//Create Route
router.post("/", wrapAsync(async (req, res) => {
    // Validate the request body
    let result = listingSchema.validate(req.body);
    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }

    const { title, description, image, price, country, location } = req.body;

    // Create a new listing
    const newListing = new Listing({
        title,
        description,
        image,
        price,
        country,
        location,
    });

    try {
        // Save the listing to the database
        await newListing.save();
        // Redirect to the listings page
        res.redirect("/listings");
    } catch (err) {
        console.error("Error saving the listing:", err);
        res.status(500).send("Internal Server Error");
    }
}));


// Edit Route

router.get("/:id/edit", async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
})

router.get("/:id/delete", async(req,res)=>{
    let {id} = req.params;
    console.log(id);
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

router.put("/:id", async (req,res)=>{
    let {id} = req.params;
   await Listing.findByIdAndUpdate(id, {...req.body});
   res.redirect(`/listings/${id}`);
})


module.exports = router;