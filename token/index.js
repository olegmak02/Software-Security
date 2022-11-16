const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
// Використання middleware для парсингу кук та тіла запитів

const jwtKey = "some_secret_key";
// Ключ для шифрування jwt токенів
const port = 8080;
const credentials = {abcdef: "123456", username: "pass"};
// Дані користувачів, де ключ - логін, значення - пароль
const expTokenTime = 180;
// Час життя токену


app.get("/", function(req, res) {
    let token = req.get("Authorization"); // Дістати токен із заголовка запиту
    let payload;
    if (token) {
        try {
            payload = jwt.verify(token, jwtKey); // Верифікація токену, що передав користувач
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                return res.sendFile(path.join(__dirname + '/index.html')); // Повернути сторінку для входу у разі неправильного або неаутентифікованого токену
            }
        }
    } else {
        return res.sendFile(path.join(__dirname + '/index.html'));
    }

    res.json({login: payload.login, logout: `http://localhost:${port}/logout`});
	// Повернути запиту з валідним та аутентифікованим токеном JSON з даними користувача
});


app.post("/login", function(req, res) {
    if (credentials[req.body.login] == req.body.password) {
        const token = jwt.sign({ login: req.body.login }, jwtKey, {
            algorithm: "HS256",
            expiresIn: expTokenTime,
        }) // Створення токену для користувача при вході
        res.json({token: token}); // Повернення створеного токену користувачу
        return;
    }

    res.status(401);
    res.send();
});

app.listen(port);
// Запуск даного сервісу