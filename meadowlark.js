const express = require("express"),
  fortune = require("./lib/fortune.js"),
  formidable = require("formidable");

const app = express();

// set up handlebars view engine
const handlebars = require("express-handlebars").create({
  defaultLayout: "main",
  helpers: {
    section: (name, options) => {
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
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.json()); // for parsing application/json

app.use(require("cookie-parser")(process.env.APP_SECRET));
app.use(
  require("express-session")({
    resave: false,
    saveUninitialized: false,
    secret: process.env.APP_SECRET,
    cookie: {
      sameSite: true,
    },
  })
);

// flash message middleware
app.use((req, res, next) => {
  // if there's a flash message, transfer
  // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  if (next) next();
});

// set 'showTests' context property if the querystring contains test=1
app.use((req, res, next) => {
  res.locals.showTests =
    app.get("env") !== "production" && req.query.test === "1";
  if (next) next();
});

// mocked weather data
function getWeatherData() {
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
}

// middleware to add weather data to context
app.use((req, res, next) => {
  if (!res.locals.partialsData) res.locals.partialsData = {};
  res.locals.partialsData.weatherContext = getWeatherData();
  if (next) next();
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
app.get("/tours/oregon-coast", (req, res) => {
  res.render("tours/oregon-coast");
});
app.get("/tours/request-group-rate", (req, res) => {
  res.render("tours/request-group-rate");
});
app.get("/jquery-test", (req, res) => {
  res.render("jquery-test");
});
app.get("/nursery-rhyme", (req, res) => {
  res.render("nursery-rhyme");
});
app.get("/data/nursery-rhyme", (req, res) => {
  res.json({
    animal: "squirrel",
    bodyPart: "tail",
    adjective: "bushy",
    noun: "heck",
  });
});
app.get("/thank-you", (req, res) => {
  res.render("thank-you");
});
app.get("/newsletter", (req, res) => {
  res.render("newsletter");
});

// for now, we're mocking NewsletterSignup:
function NewsletterSignup() {}
NewsletterSignup.prototype.save = (cb) => {
  cb();
};

const VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post("/newsletter", (req, res) => {
  let name = req.body.name || "",
    email = req.body.email || "";
  // input validation
  if (!email.match(VALID_EMAIL_REGEX)) {
    if (req.xhr) return res.json({ error: "Invalid name email address." });
    req.session.flash = {
      type: "danger",
      intro: "Validation error!",
      message: "The email address you entered was not valid.",
    };
    return res.redirect(303, "/newsletter/archive");
  }
  new NewsletterSignup({ name: name, email: email }).save((err) => {
    if (err) {
      if (req.xhr) return res.json({ error: "Database error." });
      req.session.flash = {
        type: "danger",
        intro: "Database error!",
        message: "There was a database error; please try again later.",
      };
      return res.redirect(303, "/newsletter/archive");
    }
    if (req.xhr) return res.json({ success: true });
    req.session.flash = {
      type: "success",
      intro: "Thank you!",
      message: "You have now been signed up for the newsletter.",
    };
    return res.redirect(303, "/newsletter/archive");
  });
});
app.get("/newsletter/archive", (req, res) => {
  res.render("newsletter/archive");
});
app.get("/contest/vacation-photo", (req, res) => {
  let now = new Date();
  res.render("contest/vacation-photo", {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
});
app.post("/contest/vacation-photo/:year/:month", (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
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
