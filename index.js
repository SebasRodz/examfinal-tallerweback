const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.json());
app.use(
    cors({
        // origin: ["https://main.d21qxmuvcvmgb9.amplifyapp.com"],
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        key: "userId",
        secret: "subscribe",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24,
        },
    })
);

const db = mysql.createConnection({
    user: "root",
    host: "mysql.cibdep1mea2n.us-east-1.rds.amazonaws.com",
    //host: "localhost",
    password: "Contrasena123.",
    database: "tallerweb",
    port: 3306
});

app.post("/register", (req, res) => {
    const idrol = 3;
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }

        db.query(
            "INSERT INTO users (idrol, username, password) VALUES (?,?,?)",
            [idrol, username, hash],
            (err, result) => {
                console.log(err);
            }
        );
    });

    newNote = {
        "username": username,
        "password": password
    }

    res.status(201).json(newNote)
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
        "SELECT * FROM users WHERE username = ?;",
        username,
        (err, result) => {
            if (err) {
                res.send({ err: err });
            }

            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user = result;
                        console.log(req.session.user);
                        // res.send(result);
                        res.send({ loggedIn: true, user: result });
                    } else {
                        // res.send({ message: "Contraseña incorrecta" });
                        res.send({ loggedIn: false, user: result });
                    }
                });
            } else {
                // res.send({ message: "Usuario no existente" });
                res.send({ loggedIn: false, user: result });
            }
        }
    );
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})