const express = require("express");
const app = express();
var cors = require("cors");
var request = require("request");
const url = require('url');
const firebase = require('firebase');
const { google } = require('googleapis');

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
var uid = '', email = ''

const GCP_SCOPES = ['https://www.googleapis.com/auth/calendar.app.created', 'https://www.googleapis.com/auth/classroom.courses.readonly', 'https://www.googleapis.com/auth/classroom.announcements'];

const GCP = new google.auth.OAuth2(
    process.env.GCP_CLIENT_ID, process.env.GCP_CLIENT_SECRET, 'https://famous-granite-auroraceratops.glitch.me/gcp-token'
);

function gcpAuthorize(res) {
    if (!tokens.gcp_access_token) {
        const authUrl = GCP.generateAuthUrl({
            access_type: 'offline',
            scope: GCP_SCOPES,
        });
        res.redirect(authUrl);
    } else {
        GCP.setCredentials({
            access_token: tokens.gcp_access_token,
            refresh_token: tokens.gcp_refresh_token,
            scope: tokens.gcp_scope,
            token_type: 'Bearer',
            expiry_date: tokens.gcp_expiry,
        });
        // classroom = google.classroom({ version: 'v1', GCP });
        res.redirect(`/main?u=${email}`);
    }
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
})

app.get("/main", (req, res) => {
    res.sendFile(__dirname + "/views/main.html")
})

app.get("/gcp-token", (req, res) => {
    let code = url.parse(req.url, true).query.code
    GCP.getToken(code, (err, token) => {
        if (err) {
            console.log(err);
            res.end()
        } else {
            GCP.setCredentials(token);
            tokens.gcp_access_token = token.access_token
            tokens.gcp_refresh_token = token.refresh_token
            tokens.gcp_scope = token.scope
            tokens.gcp_expiry = token.expiry_date
            database.ref('class-scheduler/' + email).update(token.refresh_token ? {
                gcp_access_token: token.access_token,
                gcp_refresh_token: token.refresh_token,
                gcp_scope: token.scope,
                gcp_expiry: token.expiry_date
            } : {
                    gcp_access_token: token.access_token,
                    gcp_scope: token.scope,
                    gcp_expiry: token.expiry_date
                });
            // classroom = google.classroom({ version: 'v1', GCP });
            res.redirect(`/main?u=${email}`)
        }
    });
})

const getZoomToken = (code, callback) => {
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
                    process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET
                ).toString("base64")
        }
    };
    request(options, (error, response, body) => {
        if (error) console.log(error)
        else {
            let jsonBody = JSON.parse(body)
            tokens = {
                zoom_access_token: jsonBody.access_token,
                zoom_refresh_token: jsonBody.refresh_token,
            }
            callback()
        }
    })
}

const refreshZoomToken = (callback) => {
    var options = {
        method: "POST",
        url: "https://zoom.us/oauth/token",
        qs: {
            grant_type: "refresh_token",
            refresh_token: tokens.zoom_refresh_token
        },
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(
                    process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET
                ).toString("base64")
        }
    };
    request(options, (error, response, body) => {
        if (error) console.log("refresh error",error)
        else {
            let jsonBody = JSON.parse(body)
            tokens = {
                zoom_access_token: jsonBody.access_token,
            }
            database.ref('class-scheduler/' + email).update({
                zoom_access_token: tokens.zoom_access_token
            });
            callback()
        }
    })
}

const getZoomUser = (callback, attempts) => {
    var options = {
        method: "GET",
        url: "https://api.zoom.us/v2/users/me",
        headers: {
            Authorization:
                "Bearer " + tokens.zoom_access_token
        }
    }

    request(options, function (error, response, body) {
        if (error) {
            if (error.code == 124) {
                refreshZoomToken()
                if (!attempts || attempts < 4) getZoomMeetings(callback, attempts ? attempts + 1 : 2)
            }
            callback()
        }
        else callback(JSON.parse(body))
    });
}

const getZoomMeetings = (callback, attempts) => {
    var options = {
        method: "GET",
        url: `https://api.zoom.us/v2/users/${uid}/meetings`,
        headers: {
            Authorization:
                "Bearer " + tokens.zoom_access_token
        }
    }

    request(options, function (error, response, body) {
        let jsonBody = JSON.parse(body)
        if (jsonBody.code == 124) {
            refreshZoomToken()
            if (!attempts || attempts < 4) getZoomMeetings(callback, attempts ? attempts + 1 : 2)
        }
        callback(jsonBody)
    });
}

const getClassroom = (callback) => {
    GCP.setCredentials({
        access_token: tokens.gcp_access_token,
        refresh_token: tokens.gcp_refresh_token,
        scope: tokens.gcp_scope,
        token_type: 'Bearer',
        expiry_date: tokens.gcp_expiry,
    });
    const classroom = google.classroom({ version: 'v1', GCP });
    classroom.courses.list({ pageSize: 15 }, (err, res) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            callback()
        } else callback(res.data.courses)
    });
}

app.get("/login", (req, res) => {
    let q = url.parse(req.url, true).query
    email = q.email.split('.')[0]
    database.ref('class-scheduler/' + email).on('value', async (snapshot) => {
        const data = await snapshot.val();
        if (data) {
            tokens = {
                zoom_access_token: data.zoom_access_token,
                zoom_refresh_token: data.zoom_refresh_token,
                gcp_access_token: data.gcp_access_token,
                gcp_refresh_token: data.gcp_refresh_token,
                gcp_scope: data.gcp_scope,
                gcp_expiry: data.gcp_expiry,
            }
            uid = data.uid
            refreshZoomToken()
            gcpAuthorize(res)
        } else {
            res.redirect(`https://zoom.us/oauth/authorize?response_type=${q.response_type}&redirect_uri=${q.redirect_uri}&client_id=${q.client_id}`)
        }
    });
})

app.get("/token", (req, res) => {
    getZoomToken(url.parse(req.url, true).query.code, () => {
        getZoomUser((user) => {
            if (user) {
                uid = user.id
                email = user.email.split('.')[0]
                database.ref('class-scheduler/' + email).update({
                    uid: user.id,
                    email: user.email,
                    zoom_access_token: tokens.zoom_access_token,
                    zoom_refresh_token: tokens.zoom_refresh_token
                });
                gcpAuthorize(res)
            }
            else {
                res.end()
            }
        })
    })
});

app.get("/meetings", (req, res) => {
    getZoomMeetings((meetings) => {
        console.log(meetings);
        if (meetings) res.write(JSON.stringify(meetings));
        getClassroom((courses) => {
            if (courses) res.write(JSON.stringify(courses));
            res.end();
        })
    })
});

const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});