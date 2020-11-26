var express = require("express");
var formidable = require("formidable");
var fortune = require("./lib/fortune");
var app = express();

// set up handlebars view engine
var handlebars = require("express-handlebars").create({
  defaultLayout: "main",
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 3000);

app.use(express.static(__dirname + "/public"));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
  res.locals.showTests =
    app.get("env") != "production" && req.query.test === "1";
  next();
});

const getWeatherData = () => {
  return {
    locations: [
      {
        name: "Portland",
        forecastUrl: "http://www.wunderground.com/US/OR/Portland.html",
        iconUrl: "http://icons-ak.wxug.com/i/c/k/cloudy.gif",
        weather: "Overcast",
        temp: "54.1 F (12.3 C)",
      },
      {
        name: "Bend",
        forecastUrl: "http://www.wunderground.com/US/OR/Bend.html",
        iconUrl: "http://icons-ak.wxug.com/i/c/k/partlycloudy.gif",
        weather: "Partly Cloudy",
        temp: "55.0 F (12.8 C)",
      },
      {
        name: "Manzanita",
        forecastUrl: "http://www.wunderground.com/US/OR/Manzanita.html",
        iconUrl: "http://icons-ak.wxug.com/i/c/k/rain.gif",
        weather: "Light Rain",
        temp: "55.0 F (12.8 C)",
      },
    ],
  };
};

app.use(function (req, res, next) {
  if (!res.locals.partialsData) res.locals.partialsData = {};
  res.locals.partialsData.weatherContext = getWeatherData();
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

app.get("/jquery-test", function (req, res) {
  res.render("jquery-test");
});

app.get("/nursery-rhyme", function (req, res) {
  res.render("nursery-rhyme");
});

app.get("/data/nursery-rhyme", function (req, res) {
  res.json({
    animal: "squirrel",
    bodyPart: "tail",
    adjective: "bushy",
    noun: "a shrubbery",
  });
});

app.get("/newsletter", function (req, res) {
  // we will learn about CSRF later...for now, we just
  // provide a dummy value
  res.render("newsletter", { csrf: "CSRF token goes here" });
});
app.post("/process", function (req, res) {
  if (req.xhr || req.accepts("json,html") === "json") {
    console.log("XHR request: req.body = ", req.body);
    // if there were an error, we would send { error: 'error description' }
    res.send({ success: true });
  } else {
    console.log("regular form POST: req.body = ", req.body);
    // if there were an error, we would redirect to an error page
    res.redirect(303, "/thank-you");
  }
});
app.get("/thank-you", function (req, res) {
  res.render("thank-you");
});

app.get("/contest/vacation-photo", function (req, res) {
  var now = new Date();
  res.render("contest/vacation-photo", {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
});
app.post("/contest/vacation-photo/:year/:month", function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (err) return res.redirect(303, "/error");
    console.log("received fields:");
    console.log(fields);
    console.log("received files:");
    console.log(files);
    res.redirect(303, "/thank-you");
  });
});

// 404 catch-all handler (middleware)
// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  res.status(404);
  res.render("404");
});

// 500 error handler (middleware)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get("port"), () => {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; press Ctrl-C to terminate."
  );
});
