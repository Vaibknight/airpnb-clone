const express = require("express");
const app = express();

const mongoose = require("mongoose");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// const MONGO_URL = "mongodb+srv://vaibhav:vaibhav@cluster0.azhpv.mongodb.net/";

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError");

const Listings = require("./routes/listing");

const Reviews = require("./routes/review");

const userRouter = require("./routes/user");

const session = require("express-session");

const flash = require("connect-flash");

const passport = require("passport");

const LocalStrategy = require("passport-local");

const User = require("./models/user");

const sessionOptions = {
  secret: "secret",
  resave: false,
  saveUnintialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    max: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  res.locals.currUser = req.user;
  next();
});

app.use("/listings", Listings);

app.use("/listings/:id/reviews", Reviews);

app.use("/", userRouter);

app.use((err, req, res, next) => {
  console.log(err.name);

  next(err);
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

app.get("/", (req, res) => {
  res.send("Hi, I am groot");
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode, message } = err;

  res.status(statusCode).render("error.ejs", { message });

  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
