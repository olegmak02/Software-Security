const express = require("express");
const app = express();

const password = "qwerty";
const login = "username";
const port = 8080;

app.use(function(req, res, next) {
    const auth = req.get("Authorization");

    if (!auth) {
        res.setHeader('WWW-Authenticate', 'Basic realm="basic"');
        res.status(401);
        res.send('Unauthorized');
        return;
    }

    const credentials = Buffer.from(auth.split(" ")[1], 'base64').toString('ascii').split(":");

    if (credentials[0] == login && credentials[1] == password) {
        req.info = login;
        next();
        return;
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="basic"');
    res.status(401);
    res.send('Unauthorized');
});

app.get("/", function(req, res) {
	res.send(`<h1>hello, ${req.info}</h1>`);
});

app.listen(port);
