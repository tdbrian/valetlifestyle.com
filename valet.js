var MongoClient, OAuth2, app, authorization_uri, buyer, buyersCollection, credentials, db, dbPath, express, format, pub, request, token;

request = require("request");

express = require("jade");

express = require("express");

MongoClient = require('mongodb').MongoClient;

format = require('util').format;

app = express();

pub = __dirname;

app = express();

app.use(express.bodyParser());

app.use(express.methodOverride());

app.use(app.router);

app.use(express["static"](pub));

app.use(express.errorHandler());

app.set("views", __dirname + "/views");

app.set("view engine", "jade");

credentials = {
  clientID: "908a73dbaa38fbc94b454a81e4a695c0b78160247d43acc7",
  clientSecret: "0a976cf48c55552abb7aa370929529bb83a170691c9da660",
  site: "https://api.rewardstyle.com"
};

dbPath = 'mongodb://valetServerSide:server@ds043398.mongolab.com:43398/valet';

token = "";

buyer = null;

db = null;

buyersCollection = null;

OAuth2 = require("simple-oauth2")(credentials);

authorization_uri = OAuth2.AuthCode.authorizeURL({
  redirect_uri: "http://localhost:3000/callback",
  scope: "favorites",
  state: ""
});

app.get("/auth", function(req, res) {
  return res.redirect(authorization_uri);
});

app.get("/callback", function(req, res) {
  var child, code, command, exec, util;
  code = req.query.code;
  console.log("/callback code:" + code);
  util = require("util");
  exec = require("child_process").exec;
  command = "curl -X POST -F client_id=" + credentials.clientID + " -F client_secret=" + credentials.clientSecret + " -F code=" + code + " https://api.rewardstyle.com/oauth/token";
  console.log("command:: " + command);
  return child = exec(command, function(error, stdout, stderr) {
    token = JSON.parse(stdout).access_token;
    console.log(token);
    return res.redirect("/dashboard");
  });
});

app.get("/", function(req, res) {
  return res.render("index");
});

app.get("/login", function(req, res) {
  return res.render("login");
});

app.put("/validateLogin", function(req, res) {
  var email, password;
  email = req.body.email;
  password = req.body.password;
  return MongoClient.connect(dbPath, function(err, newDBConn) {
    if (err) {
      console.log('unable to connect to server');
    }
    db = newDBConn;
    buyersCollection = newDBConn.collection('buyers');
    console.log(email);
    return buyersCollection.find({
      email: email
    }).toArray(function(err, buyers) {
      if (buyers[0]) {
        buyer = buyers[0];
        if (buyer.token != null) {
          res.send('{"status": "valid", "hasToken": true}');
        } else {
          res.send('{"status": "valid", "hasToken": false}');
        }
      } else {
        buyer = null;
        res.send('{"status": "failed"}');
      }
      return console.log(buyer);
    });
  });
});

app.get("/dashboard", function(req, res) {
  if (buyer === null) {
    return res.redirect('/');
  } else {
    if (buyer.token === void 0) {
      buyer.token = token;
      buyersCollection.save(buyer, function(err, savedBuyer) {
        return console.log(savedBuyer);
      });
    }
    return res.render("dashboard", {
      buyer: buyer
    });
  }
});

app.get("/logout", function(req, res) {
  token = "";
  buyer = null;
  buyersCollection = null;
  if (db != null) {
    db.close();
  }
  return res.redirect('/');
});

app.listen(8856);

console.log("Express server started on port 8856");

/*
//@ sourceMappingURL=valet.js.map
*/