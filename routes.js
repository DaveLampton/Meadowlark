// Route Handlers
const main = require("./handlers/main");
const newsletter = require("./handlers/newsletter");
const contest = require("./handlers/contest");
const vacation = require("./handlers/vacation");

module.exports = (app) => {
  app.get("/", main.home);

  app.get("/about", main.about);

  app.get("/tours/hood-river", main.tours_hoodRiver);
  app.get("/tours/oregon-coast", main.tours_oregonCoast);
  app.get("/tours/request-group-rate", main.tours_requestGroupRate);

  app.get("/jquery-test", main.jQueryTest);

  app.get("/nursery-rhyme", main.nurseryRhyme);
  app.get("/data/nursery-rhyme", main.data_nurseryRhyme);

  app.get("/thank-you", main.thankYou);

  app.get("/newsletter", newsletter.getNewsletter);
  app.post("/newsletter", newsletter.postNewsletter);
  app.get("/newsletter/archive", newsletter.newsletter_archive);

  app.get("/contest/vacation-photo", contest.getContest_vacationPhoto);
  app.post(
    "/contest/vacation-photo/:year/:month",
    contest.postContest_vacationPhoto
  );

  app.get("/vacations", vacation.vacation);
};
