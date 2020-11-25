// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
var request = require("request");

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  var options = {
    method: 'POST',
    url: 'https://zoom.us/oauth/token',
    qs: {
        grant_type: 'authorization_code',
        code: 'IcU8aagJf0_2vesslKITryUOBL0EQWeeQ',
        redirect_uri: 'https://class-manage.web.app'
    },
    headers: {
        Authorization: 'Basic ' + Buffer.from('K09RzbDQoKa5tLEQIlw' + ':' + 'yQatemHkRICZ5z8mMpnIH8LIVBW1wI0w').toString('base64')
    }
};

  request(options, function(error, response, body) {
   if (error) throw new Error(error);

   response.write(body);
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
