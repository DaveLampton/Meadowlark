const express = require("express");
const weatherData = require("./models/weather");

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
    static: function (resource) {
      return require("./lib/static.js").map(resource);
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

// setup for storing sessions in MongoDB
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_DB_URL,
  databaseName: "test",
  collection: "sessions",
});
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.APP_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: true,
    },
    store: store,
  })
);

// CSRF protection (must follow cookie/session initialization)
app.use(require("csurf")());
app.use(function (req, res, next) {
  res.locals._csrfToken = req.csrfToken();
  next();
});

// setup mongoose for MongoDB
const mongoose = require("mongoose");
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(process.env.MONGO_DB_URL, options);

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

// middleware to add weather data to context
app.use((req, res, next) => {
  if (!res.locals.partialsData) res.locals.partialsData = {};
  res.locals.partialsData.weatherContext = weatherData.getWeatherData();
  if (next) next();
});

// Routes listed in routes.js
require("./routes")(app);
// (Note to self: for alternative routing schemes, checkout the
// 'express-namespace' and 'express-resource' packages)

// for routes not found above, setup automatic
// routes for the views found in the filesystem
let autoViews = {};
const fs = require("fs");
app.use((req, res, next) => {
  let path = req.path.toLowerCase();
  // if it's already in autoViews, render the view
  if (autoViews[path]) return res.render(autoViews[path]);
  // if it's not yet in autoViews, see if there's a
  // .handlebars file that matches the path and render it
  if (fs.existsSync(__dirname + "/views" + path + ".handlebars")) {
    autoViews[path] = path.replace(/^\//, "");
    return res.render(autoViews[path]);
  }
  // no view found; pass on to 404 handler
  next();
});

//------------------------------------------------------------------------------
// API

// mongoose model
const Attraction = require("./models/attraction.js");

app.get("/api/v1/attractions", (req, res) => {
  Attraction.find({ approved: true }, (err, attractions) => {
    if (err) return res.send(500, "Error occurred: database error.");
    res.json(
      attractions.map((a) => {
        return {
          name: a.name,
          id: a._id,
          description: a.description,
          location: a.location,
        };
      })
    );
  });
});
app.post("/api/v1/attraction", (req, res) => {
  let a = new Attraction({
    name: req.body.name,
    description: req.body.description,
    location: { lat: req.body.lat, lng: req.body.lng },
    history: {
      event: "created",
      email: req.body.email,
      date: new Date(),
    },
    approved: false,
  });
  a.save((err, a) => {
    if (err) return res.send(500, "Error occurred: database error.");
    res.json({ id: a._id });
  });
});
app.get("/api/v1/attraction/:id", (req, res) => {
  Attraction.findById(req.params.id, (err, a) => {
    if (err) return res.send(500, "Error occurred: database error.");
    res.json({
      name: a.name,
      id: a._id,
      description: a.description,
      location: a.location,
    });
  });
});
//------------------------------------------------------------------------------

// 404 catch-all handler
// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  res.status(404);
  res.render("404");
});

// 500 error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get("port"), () => {
  console.log(
    `Meadowlark app listening on http://localhost:${app.get("port")}/`
  );
});
