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
var session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
var store = new MongoDBStore({
  uri: process.env.MONGO_DB_URL,
  databaseName: "test",
  collection: "sessions",
});
app.use(
  require("express-session")({
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

// setup mongoose for MongoDB
var mongoose = require("mongoose");
var options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
switch (app.get("env")) {
  case "development":
    mongoose.connect(process.env.MONGO_DB_URL, options);
    break;
  case "production":
    mongoose.connect(process.env.MONGO_DB_URL, options);
    break;
  default:
    throw new Error("Unknown execution environment: " + app.get("env"));
}

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
