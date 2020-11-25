// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
var cors = require('cors')
var request = require("request");
const fetch = require("node-fetch");

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(cors())

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  var options = {
    method: "POST",
    // url: "https://zoom.us/oauth/token",
    // qs: {
    //   grant_type: "authorization_code",
    //   code: "EweM9POkkV_2vesslKITryUOBL0EQWeeQ",
    //   redirect_uri: "https://class-manage.web.app"
    // },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          "K09RzbDQoKa5tLEQIlw" + ":" + "yQatemHkRICZ5z8mMpnIH8LIVBW1wI0w"
        ).toString("base64")
    },
    body: ''
  };
  response.write(JSON.stringify(options))

  fetch(
    "https://zoom.us/oauth/token?grant_type=authorization_code&code=3sd6TvTje3_2vesslKITryUOBL0EQWeeQ&redirect_uri=https%3A%2F%2Fclass-manage.web.app",
    options
  ).then(res => {
    console.log(res)
    response.end(JSON.stringify(res))
  }).catch(e => console.log(e));
  
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
