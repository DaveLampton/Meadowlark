const Vacation = require("../models/vacation");

exports.vacation = (req, res) => {
  //req.session.test = "Hello MongoDB";
  Vacation.find({ available: true, inSeason: true }, (err, vacations) => {
    var currency = req.session.currency || "USD";
    var context = {
      currency: currency,
      vacations: vacations.map((vacation) => {
        return {
          sku: vacation.sku,
          name: vacation.name,
          description: vacation.description,
          inSeason: vacation.inSeason,
          price: "$" + vacation.priceInCents / 100,
          qty: vacation.qty,
        };
      }),
    };
    res.render("vacations", context);
  });
  //console.log("Test cookie:", req.session.test);
};
