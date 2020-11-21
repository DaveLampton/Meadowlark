var Browser = require("zombie"),
  assert = require("chai").assert;

var browser;

suite("Cross-Page Tests", function () {
  // runs before each test
  setup(function () {
    browser = new Browser();
  });

  test(
    "requesting a group rate quote from the hood river tour page should " +
      "populate the hidden referrer field correctly",
    function (done) {
      var referrer = "http://localhost:3000/tours/hood-river";
      browser.visit(referrer, function () {
        browser.clickLink(".requestGroupRate", function () {
          // browser.field returns a DOM element by 'name' attribute
          assert(browser.field("referrer").value === referrer);
          done();
        });
      });
    }
  );

  test(
    "requesting a group rate from the oregon coast tour page should " +
      "populate the hidden referrer field correctly",
    function (done) {
      var referrer = "http://localhost:3000/tours/oregon-coast";
      browser.visit(referrer, function () {
        browser.clickLink(".requestGroupRate", function () {
          // browser.field returns a DOM element by 'name' attribute
          assert(browser.field("referrer").value === referrer);
          done();
        });
      });
    }
  );

  test(
    'visiting the "request group rate" page dirctly should result ' +
      "in an empty value for the referrer field",
    function (done) {
      browser.visit(
        "http://localhost:3000/tours/request-group-rate",
        function () {
          // browser.field returns a DOM element by 'name' attribute
          assert(browser.field("referrer").value === "");
          done();
        }
      );
    }
  );
});
