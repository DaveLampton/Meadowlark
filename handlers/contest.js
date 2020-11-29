const formidable = require("formidable");

exports.getContest_vacationPhoto = (req, res) => {
  let now = new Date();
  res.render("contest/vacation-photo", {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
};

exports.postContest_vacationPhoto = (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) return res.redirect(303, "/error");
    console.log("received fields:");
    console.log(fields);
    console.log("received files:");
    console.log(files);
    res.redirect(303, "/thank-you");
  });
};
