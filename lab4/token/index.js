const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const request = require('request');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

const port = 8080;

app.get("/", function(req, res) {
    let token = req.get("Authorization");
    if (token) {
        res.json({login: "oleg", logout: `http://localhost:${port}/logout`});

    } else {
        return res.sendFile(path.join(__dirname + '/index.html'));
    }
});


app.post("/login", async function(req, res) {
    var options = { method: 'POST',
        url: 'https://kpi.eu.auth0.com/oauth/token',
        headers: {
            'postman-token': 'eb983311-8618-502c-e8f2-229bce7d6d04',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
            username: req.body.login,
            password: req.body.password,
            audience: 'https://kpi.eu.auth0.com/api/v2/',
            scope: 'offline_access',
            client_id: 'JIvCO5c2IBHlAe2patn6l6q5H35qxti0',
            client_secret: 'ZRF8Op0tWM36p1_hxXTU-B0K_Gq_-eAVtlrQpY24CasYiDmcXBhNS6IJMNcz1EgB',
            realm: 'Username-Password-Authentication'
        }
    };

    request(options, function(err, result, body) {
        body = JSON.parse(body);
        if (!body.error) {
            res.json({token: body.access_token});
        } else {
            res.status(401).send();
        }
    });
});

app.listen(port);
