const express = require("express");
const app = express();
var session = require("express-session");
const bodyParser = require("body-parser");
const categoryRoutes = require("./routes/category");
const headerRoutes = require("./routes/header");
const userRoutes = require("./routes/user");
const competitionRoutes = require("./routes/competition");
const leagueRoutes = require("./routes/league");

///////studyexam seprate module
const pocquestionRoutes = require("./routes/pocquestion");
const curriculumSingleRoutes = require("./routes/curriculum-single");
const competitiveSingleRoutes = require("./routes/competitive-single");
const studyExamRoutes = require("./routes/study-exam");
/////study exam cms module////
const pocquestionCmsRoutes = require("./routes/cms/pocquestion");
const curriculumSingleCmsRoutes = require("./routes/cms/curriculum-single");
const competitiveSingleCmsRoutes = require("./routes/cms/competitive-single");
const studyExamCmsRoutes = require("./routes/cms/study-exam");

const survayRoutes = require("./routes/survay");
const masterdataRoutes = require("./routes/masterdata");
const gcRoutes = require("./routes/gc");

const morgan = require("morgan");
const cors = require("cors");
//https 
var http = require('http');
var https = require('https');
var secure = require('express-force-https');
var fs = require('fs');

const hostname = '0.0.0.0';
var http_port    =   process.env.PORT || 3000;
var https_port    =   process.env.PORT_HTTPS || 3000;

var https_options = {
  key: fs.readFileSync("/var/www/html/ssl/privkey.pem"),
  cert: fs.readFileSync("/var/www/html/ssl/fullchain.pem"),
};

app.use(cors());
//app.use(bodyParser.json());

app.use(
  session({
    secret: "mysecret",
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  })
);

//app.use(secure); // https redirect

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({limit: '500000mb'}));
app.use(bodyParser.urlencoded({limit: '50000mb', extended: true, parameterLimit: 500000000}));

// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.use (function (req, res, next) { console.log('host ', req.headers.host); console.log('url ', req.url);
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});

// Make Images "Uploads" Folder Publicly Available
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(morgan("tiny"));
app.use("/category", categoryRoutes);
app.use("/header", headerRoutes);
app.use("/user", userRoutes);
app.use("/competition", competitionRoutes);
app.use("/league", leagueRoutes);

//seprate study exam
app.use("/pocquestion", pocquestionRoutes);
app.use("/study-exam", studyExamRoutes);
app.use("/curriculum-single", curriculumSingleRoutes);
app.use("/competitive-single", competitiveSingleRoutes);
//cms study exam
app.use("/cms-pocquestion", pocquestionCmsRoutes);
app.use("/cms-curriculum-single", curriculumSingleCmsRoutes);
app.use("/cms-competitive-single", competitiveSingleCmsRoutes);
app.use("/cms-study-exam", studyExamCmsRoutes);
app.use("/survay", survayRoutes);
app.use("/masterdata", masterdataRoutes);
//gc
app.use("/gc", gcRoutes);


app.use(express.static('public'));

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



// app.listen(7000, function() {
//   console.log("Server starting on port 7000!");
// });

// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

var server = https.createServer(https_options, app).listen(https_port, function () {
  //console.log('Magic happens on port ' + https_port); 
  server.timeout = 0;
  console.log(`Server running at https://${hostname}:${https_port}/`);
});

// Redirect from http port 3001 to https

// Redirect from http port to https
/* http.createServer(function (req, res) {
  res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(http_port,https_port) + req.url });
  console.log("http request, will go to >> ");
  console.log("https://" + req.headers['host'].replace(http_port,https_port) + req.url );
  res.end();
}).listen(http_port); */