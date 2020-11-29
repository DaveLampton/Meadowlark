const fortune = require("../lib/fortune");

exports.home = (req, res) => {
  res.render("home");
};

exports.about = (req, res) => {
  res.render("about", {
    fortune: fortune.getFortune(),
    pageTestScript: "/qa/tests-about.js",
  });
};

exports.tours_hoodRiver = (req, res) => {
  res.render("tours/hood-river");
};
exports.tours_oregonCoast = (req, res) => {
  res.render("tours/oregon-coast");
};
exports.tours_requestGroupRate = (req, res) => {
  res.render("tours/request-group-rate");
};

exports.jQueryTest = (req, res) => {
  res.render("jquery-test");
};

exports.nurseryRhyme = (req, res) => {
  res.render("nursery-rhyme");
};
exports.data_nurseryRhyme = (req, res) => {
  res.json({
    animal: "squirrel",
    bodyPart: "tail",
    adjective: "bushy",
    noun: "heck",
  });
};

exports.thankYou = (req, res) => {
  res.render("thank-you");
};
