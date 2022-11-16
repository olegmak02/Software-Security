const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

const port = 8080;
const COOKIE = 'session';
const credentials = {abcdef: "123456", username: "pass"};

class Session {
    sessions = {};

    constructor() {
        this.sessions = JSON.parse(fs.readFileSync(path.join(__dirname, '\\store.txt')));
    }

    save() {
        fs.writeFileSync(path.join(__dirname, '\\store.txt'), JSON.stringify(this.sessions));
    }

    add(key, value) {
        this.sessions[key] = value;
        this.save();
    }

    get(key) {
        return this.sessions[key];
    }

    delete(key) {
        delete this.sessions[key];
        this.save();
    }
}

const session_store = new Session();

app.use(function(req, res, next) {
    let sessionId = req.cookies[COOKIE];
    
    let session = session_store.get(sessionId);

    if (!sessionId || !session) {
        sessionId = uuid.v4();
        session = {};
        session_store.add(sessionId, session);
        res.header('Set-Cookie', `${COOKIE}=${sessionId}; HttpOnly`);
    }

    req.session = session;

    next();

    session_store.add(sessionId, req.session);
});

app.get("/", function(req, res) {
    console.log("login in session: " + req.session.login);
    if (!req.session.login) {
        console.log("Send index.html file to user");
        res.sendFile(path.join(__dirname + '/index.html'));
    } else {
	    res.json({
            login: req.session.login,
            logout: `http://localhost:${port}/logout`,
        });
    }
});

app.get("/logout", function(req, res) {
    const sessionId = req.cookies[COOKIE];
    if (sessionId) {
        session_store.delete(sessionId);
        res.set('Set-Cookie', `${COOKIE}=; HttpOnly`);
    }
    res.redirect("/");
})

app.post("/login", function(req, res) {
    if (credentials[req.body.login] == req.body.password) {
        req.session = {
            login: req.body.login,
            password: req.body.password
        }
        res.json({login: req.body.login});
    }

    res.status(401);
    res.send();
});

app.listen(port);
