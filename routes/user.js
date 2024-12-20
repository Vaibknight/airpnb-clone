const express = require("express");
const router = express.Router();

const User = require("../models/user");
const passport = require("passport");

const { saveRedirectUrl } = require("../middleware");

router.get("/signup", (req, res) => {
  //   res.send("form");

  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    const newUser = new User({ email, username });

    const registered = await User.register(newUser, password);

    req.logIn(registered, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "user was registered successfully");

      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);

    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "You are loggedin!");

    let redirectURL = res.locals.redirectUrl || "/listings";

    res.redirect(redirectURL);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are successfully logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
