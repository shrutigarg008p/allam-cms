const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const quizRoutes = require("./routes/quiz");
const competitionRoutes = require("./routes/competition");
const specialCompetitionRoutes = require("./routes/special_competition");
const referendumRoutes = require("./routes/referendum");
const categoryRoutes = require("./routes/category");
const leagueRoutes = require("./routes/league");
const gcRoutes = require("./routes/gc");

// const socketRoutes = require("./routes/socket/socket");
const server = require('http').Server(app);
const io = require('socket.io')(server);
const socketRoutes = require('./routes/socket/socket')(io);

const morgan = require("morgan");
const cors = require("cors");

//https 
var http = require('http');
var https = require('https');
var fs = require('fs');

const hostname = '0.0.0.0';
var http_port    =   process.env.PORT || 9001;
var https_port    =   process.env.PORT_HTTPS || 9000;

var https_options = {
  // key: fs.readFileSync("/var/www/html/ssl/privkey.pem"),
  // cert: fs.readFileSync("/var/www/html/ssl/fullchain.pem"),
  key: fs.readFileSync("./ssl/privkey.pem"),
  cert: fs.readFileSync("./ssl/fullchain.pem"),
};


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.use (function (req, res, next) { console.log('host ', req.headers.host);
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});

app.use(morgan("tiny"));
app.use("/user", userRoutes);
app.use("/quiz", quizRoutes);
app.use("/competition", competitionRoutes);
app.use("/special_competition", specialCompetitionRoutes);
app.use("/referendum", referendumRoutes);
app.use("/category", categoryRoutes);
app.use("/league", leagueRoutes);
app.use("/gc", gcRoutes);


//for socket
app.use("/socket/server", socketRoutes);

app.use(express.static(__dirname));

app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

/* server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
}); */

https.createServer(https_options, app).listen(https_port, function () {
  //console.log('Magic happens on port ' + https_port); 
  console.log(`Server running at https://${hostname}:${https_port}/`);
});

//for socket
// var io = require('socket.io')(server);
// app.set('socketio', io);