const express = require('express');
const app = express();
const initData = require("./init/data");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');

const ExpressError = require('./utils/ExpressError');


const { redirect } = require('express/lib/response');

const wrapAsync = require('./utils/wrapAsync');

const { listingSchema , reviewSchema} = require("./schema");
const Review = require("./models/review");

main().then(()=>{
    console.log("connected to DB");
    
}).catch((err)=>{
    console.log(err);
    
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("Hi, I am groot");
})

const validateListing = (req, res, next) =>{

    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
     }else{
        next();
     }

};

const validateReview = (req, res, next) =>{

    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
     }else{
        next();
     }

};


app.get('/listings', async (req, res) => {
        const allListings = await Listing.find({});
   
    
    res.render('listings/index', {allListings}); // No .ejs extension needed

});




// New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new");
})



app.get(
    "/listings/:id",
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

app.use((err , req, res, next)=>{

    console.log(err.name);

    next(err);
    
})



//Create Route
app.post("/listings", validateListing, wrapAsync(  async (req, res) => {

    // let result = listingSchema.validate(req.body);

    // console.log(result);
    
 
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

        // console.log("New Listing Created:", newListing);

        // Save the listing to the database
        await newListing.save();

        // Redirect to the listings page
        res.redirect("/listings");
  
}));

// Edit Route

app.get("/listings/:id/edit", async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
})

app.get("/listings/:id/delete", async(req,res)=>{
    let {id} = req.params;
    console.log(id);
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

app.put("/listings/:id", async (req,res)=>{
    let {id} = req.params;
   await Listing.findByIdAndUpdate(id, {...req.body});
   res.redirect(`/listings/${id}`);
})

//Reviews
//Post Route

app.post("/listings/:id/reviews", validateReview, wrapAsync(  async (req, res)=>{
   let list = await  Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);
//    console.log(list);
   
  list.reviews.push(newReview);

  await newReview.save();
  await list.save();



  res.redirect(`/listings/${list._id}`);
   
}));


app.delete("/listings/:id/reviews/:reviewId", async (req, res)=>{
    let {id, reviewId} = req.params;

    console.log(id);
    console.log(reviewId);
    

    await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});

   await  Review.findByIdAndDelete(reviewId);

   res.redirect(`/listings/${id}`);
});




// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title : "My New Pic",
//         description :"By the beech",
//         price : 1200,
//         location : "Goa",
//         country : "India"
//     })

//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("successful testing");
// })

app.all("*", (req,res, next)=>{
    next(new ExpressError(404, "Page not found"));
})

app.use((err,req,res,next)=>{

    let {statusCode, message} = err;

    res.status(statusCode).render("error.ejs", {message});

    // res.status(statusCode).send(message);
})

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
    
})



