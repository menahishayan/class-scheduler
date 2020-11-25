const express = require("express");
const app = express();
var cors = require("cors");
var request = require("request");
const url = require('url');

app.use(express.static("public"));
app.use(cors());

app.get("/token", (req, res) => {
    var tokenOptions = {
        method: "POST",
        url: "https://zoom.us/oauth/token",
        qs: {
            grant_type: "authorization_code",
            code: url.parse(req.url, true).query.code,
            redirect_uri: "https://class-manage.web.app"
        },
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(
                    process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
                ).toString("base64")
        }
    };

    request(tokenOptions, function (tokenError, tokenRes, tokenBody) {
        if (tokenError) res.end(tokenError);
        else {
            var tokens = JSON.parse(tokenBody)

            var profileOptions = {
                method: "GET",
                url: "https://api.zoom.us/v2/users/me",
                headers: {
                    Authorization:
                        "Bearer " + tokens.access_token
                }
            }

            request(profileOptions, function (error, profileRes, body) {
                if (error) res.end(error);
                else {
                    res.write(tokenBody)
                    res.write(body);
                    console.log(JSON.parse(body));
                    res.end();
                }
            });
        }
    });
});

const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});