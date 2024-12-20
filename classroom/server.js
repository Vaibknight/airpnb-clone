const express = require("express");
const app = express();
var flash = require("connect-flash");
const path = require("path");
const session = require("express-session");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
  secret: "mysecret",
  resave: false,
  saveunintialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.get("/register", (req, res) => {
  const { name = "anonymous" } = req.query;

  if (name == "anonymous") {
    req.flash("error", " user not registered");
  } else {
    req.flash("success", " user registered successfully");
  }

  req.session.name = name;

  //   res.send(`${name}`);

  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  // res.send(`hello , ${req.session.name}`);

  res.locals.msg = req.flash("success");

  res.locals.errmsg = req.flash("error");

  res.render("page", { name: req.session.name });
});
// app.get("/reqcount", (req, res) => {
//   if (req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }

//   res.send(`your count is ${req.session.count}`);
// });

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(3000, () => {
  console.log("server is listening to 3000");
});
