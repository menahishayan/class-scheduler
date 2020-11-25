const express = require("express");
const app = express();
var cors = require("cors");
var request = require("request");
const url = require('url');
const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyBcq0iDH5wZgVeP0BCVVbvE61oGHr0QGCQ",
    authDomain: "amcec-shayan.firebaseapp.com",
    databaseURL: "https://amcec-shayan.firebaseio.com",
    projectId: "amcec-shayan",
    storageBucket: "amcec-shayan.appspot.com",
    messagingSenderId: "451660000724",
    appId: "1:451660000724:web:e1de94e231fb5aec22fa41"
};

app.use(express.static("public"));
app.use(cors());

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var tokens = {}
var uid = ''

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
})

app.get("/main", (req, res) => {
    res.sendFile(__dirname + "/views/main.html")
})

const getTokens = (code, callback) => {
    var options = {
        method: "POST",
        url: "https://zoom.us/oauth/token",
        qs: {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: "https://famous-granite-auroraceratops.glitch.me/token"
        },
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(
                    process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
                ).toString("base64")
        }
    };
    request(options, (error, response, body) => {
        if (error) res.end(error);
        else {
            tokens = JSON.parse(body)
            callback()
        }
    })
}

const getUser = (callback) => {
    var options = {
        method: "GET",
        url: "https://api.zoom.us/v2/users/me",
        headers: {
            Authorization:
                "Bearer " + tokens.access_token
        }
    }

    request(options, function (error, response, body) {
        if (error) res.end(error);
        else callback(JSON.parse(body))
    });
}

const getMeetings = (callback) => {
    var options = {
        method: "GET",
        url: `https://api.zoom.us/v2/users/${uid}/meetings`,
        headers: {
            Authorization:
                "Bearer " + tokens.access_token
        }
    }

    request(options, function (error, response, body) {
        if (error) res.end(error);
        else callback(JSON.parse(body))
    });
}

app.get("/login", (req, res) => {
    let email = url.parse(req.url, true).query.email
    database.ref('class-scheduler/' + email).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            res.write(JSON.stringify(data));
            res.end()
        } else {
            res.end()
        }
    });
})

app.get("/token", (req, res) => {
    getTokens(url.parse(req.url, true).query.code, () => {
        getUser((user) => {
            console.log(user);
            if (user) {
                uid = user.id
                database.ref('class-scheduler/' + user.email).set({
                    uid: user.id,
                    email: user.email,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token
                });
                res.redirect('/main')

            }
            else {
                res.end()
            }
        })
    })
});

app.get("/meetings", (req, res) => {
    getMeetings((meetings) => {
        console.log(meetings);
        res.write(JSON.stringify(meetings));
        res.end();
    })
});

const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});