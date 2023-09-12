const bodyParser = require("body-parser");
const express = require("express");
const mysql = require("mysql");
const { reset } = require("nodemon");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: true }));

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const db = mysql.createConnection({
  host: "localhost",
  database: "scholl",
  password: "",
  user: "root",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connection");

  // Get Data
  app.get("/", (req, res) => {
    const sql = `SELECT * FROM user`;
    db.query(sql, (req, result) => {
      const users = JSON.parse(JSON.stringify(result));
      res.render("index", {
        users: users,
        title: "List of junior high school students",
      });
    });
  });

  app.get("/chat", (req, res) => {
    res.render("chat", {
      loginTitle: "Enter the chat😎",
      chatTitle: "Chat Whatever🙈",
    });
  });

  // Add data
  app.post("/add", (req, res) => {
    const insertData = `INSERT INTO user (name, kelas, Sekolah) VALUES ('${req.body.name}', '${req.body.kelas}', '${req.body.sekolah}')`;
    db.query(insertData, (err, result) => {
      if (err) throw err;
      res.redirect("/");
    });
  });
});

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    const { id, message } = data;
    socket.broadcast.emit("message", id, message);
  });
});

server.listen(8000, () => {
  console.log("server Ready...");
});
