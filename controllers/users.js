const User = require("../models/user");

module.exports.renderSignup = (req, res) => {
  //   res.send("form");

  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
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
};

module.exports.loginRender = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "You are loggedin!");

  let redirectURL = res.locals.redirectUrl || "/listings";

  res.redirect(redirectURL);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are successfully logged out!");
    res.redirect("/listings");
  });
};
