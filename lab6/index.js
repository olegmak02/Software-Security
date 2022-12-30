const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

const port = 3000;

const checkJwt = auth({
    audience: 'https://kpi.eu.auth0.com/api/v2/',
    issuerBaseURL: 'https://kpi.eu.auth0.com/'
});

app.use(/^\/$/, async (req, res, next) => {
    if (!req.query.code) {
        return res.redirect("https://kpi.eu.auth0.com/authorize?client_id=JIvCO5c2IBHlAe2patn6l6q5H35qxti0&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&response_mode=query");
    } else {
        let code = req.query.code;
        var options = { 
            method: 'POST',
            url: 'https://kpi.eu.auth0.com/oauth/token',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost:3000/',
                code: code,
                audience: 'https://kpi.eu.auth0.com/api/v2/',
                client_id: 'JIvCO5c2IBHlAe2patn6l6q5H35qxti0',
                client_secret: 'ZRF8Op0tWM36p1_hxXTU-B0K_Gq_-eAVtlrQpY24CasYiDmcXBhNS6IJMNcz1EgB',
            }
        };

        await request(options, function(err, result, body) {
            body = JSON.parse(body);
            if (!err) {
                req.access_token = body.access_token;
                next();
            } else {
                res.status(401).send();
            }
        });
    }
});

app.use(/^\/home$/, checkJwt);

app.get("/home", function(req, res) {
    res.json({login: "oleg", logout: `http://localhost:${port}/logout`});
});

app.get("/", function(req, res) {
    res.set("Set-Cookie", `token=${req.access_token}`);
    return res.sendFile(path.join(__dirname + '/index.html'));
});

app.post("/login", async function(req, res) {
    var options = { method: 'POST',
        url: 'https://kpi.eu.auth0.com/oauth/token',
        headers: {
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
