var express = require("express");
var fortune = require("./lib/fortune");
var app = express();

// set up handlebars view engine
var handlebars = require("express-handlebars").create({
  defaultLayout: "main",
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 3000);

app.use(express.static(__dirname + "/public"));

app.use((req, res, next) => {
  res.locals.showTests =
    app.get("env") != "production" && req.query.test === "1";
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/about", (req, res) => {
  res.render("about", {
    fortune: fortune.getFortune(),
    pageTestScript: "/qa/tests-about.js",
  });
});
app.get("/tours/hood-river", (req, res) => {
  res.render("tours/hood-river");
});
app.get("/tours/request-group-rate", (req, res) => {
  res.render("tours/request-group-rate");
});

// 404 catch-all handler (middleware)
app.use((req, res, next) => {
  res.status(404);
  res.render("404");
  next();
});

// 500 error handler (middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.render("500");
  next();
});

app.listen(app.get("port"), () => {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; press Ctrl-C to terminate."
  );
});
