var assert = require("chai").assert;
//var http = require("http");
var rest = require("restler");

suite("API tests", () => {
  var attraction = {
    lat: 45.516011,
    lng: -122.682062,
    name: "Portland Art Museum",
    description:
      "Founded in 1892, the Portland Art Museum's collection " +
      "of native art is not to be missed. If modern art is more to your " +
      "liking, there are six stories of modern art for your enjoyment.",
    email: "test@meadowlarktravel.com",
  };

  var base = "http://localhost:3000";

  test("should be able to add an attraction", (done) => {
    rest
      .post(base + "/api/v1/attraction", { data: attraction })
      .on("success", (postReturnedData) => {
        assert.match(postReturnedData.id, /\w/, "id must be set");
        done();
      })
      .on("error", (err) => {
        assert(false, err.toString());
      });
  });

  test("should be able to retrieve an attraction", (done) => {
    rest
      .post(base + "/api/v1/attraction", { data: attraction })
      .on("success", (postReturnedData) => {
        rest
          .get(base + "/api/v1/attraction/" + postReturnedData.id)
          .on("success", (getReturnedData) => {
            assert(getReturnedData.name === attraction.name);
            assert(getReturnedData.description === attraction.description);
            done();
          })
          .on("error", (err) => {
            assert(false, err.toString());
          });
      });
  });
});
