request = require("request")
express = require("jade")
express = require("express")
MongoClient = require('mongodb').MongoClient
format = require('util').format

app = express()
pub = __dirname

# setup middleware
app = express()
app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router
app.use express.static(pub)
app.use express.errorHandler()
app.set "views", __dirname + "/views"
app.set "view engine", "jade"

# Set the client credentials and the OAuth2 server
credentials =
  clientID: "908a73dbaa38fbc94b454a81e4a695c0b78160247d43acc7"
  clientSecret: "0a976cf48c55552abb7aa370929529bb83a170691c9da660"
  site: "https://api.rewardstyle.com"

# rS token for accessing API
dbPath = 'mongodb://valetServerSide:server@ds043398.mongolab.com:43398/valet'
token = ""
buyer = null
db = null
buyersCollection = null

# Initialize the OAuth2 Library
OAuth2 = require("simple-oauth2")(credentials)

# Authorization OAuth2 URI
authorization_uri = OAuth2.AuthCode.authorizeURL(
  redirect_uri: "http://localhost:3000/callback"
  scope: "favorites"
  state: ""
)

# Initial page redirecting to rS
app.get "/auth", (req, res) ->
  res.redirect authorization_uri

# Callback service parsing the authorization token and asking for the access token
app.get "/callback", (req, res) ->
  code = req.query.code
  console.log "/callback code:" + code
  util = require("util")
  exec = require("child_process").exec
  command = "curl -X POST -F client_id=" + credentials.clientID + " -F client_secret=" + credentials.clientSecret + " -F code=" + code + " https://api.rewardstyle.com/oauth/token"
  console.log "command:: " + command
  child = exec(command, (error, stdout, stderr) ->
    token = JSON.parse(stdout).access_token
    console.log token
    
    # request.get({url:'https://api.rewardstyle.com/v1/search', qs:{oauth_token:token, keywords:'cool+socks'}, json:true}, function(err, res, body) {
    
    #   if(err){
    #     console.log(err);
    #   }
    #   else{
    #     console.log(body);
    #   }
    
    # });
    res.redirect "/dashboard"
  )

# Main Page
app.get "/", (req, res) ->
  res.render "index"

# Main Page
app.get "/login", (req, res) ->
  res.render "login"

# Main Page
app.put "/validateLogin", (req, res) ->
  
  email = req.body.email
  password = req.body.password

  MongoClient.connect dbPath, (err, newDBConn) ->
    
    if err
      console.log 'unable to connect to server'

    # Save open DB connection
    db = newDBConn

    buyersCollection = newDBConn.collection('buyers')
    console.log email
    buyersCollection.find({email: email}).toArray (err, buyers) ->
      
      if buyers[0]
        buyer = buyers[0]
        if buyer.token?
          res.send '{"status": "valid", "hasToken": true}'
        else
          res.send '{"status": "valid", "hasToken": false}'

      else
        buyer = null
        res.send '{"status": "failed"}'

      console.log buyer

# Dashboard
app.get "/dashboard", (req, res) ->

  # Send user back home if not logged in
  if buyer is null
    res.redirect '/'
  
  # Else load up dashboard
  else

    # If user does not have token, save
    if buyer.token is undefined
      console.log 'no token'
      buyer.token = token
      buyersCollection.save buyer, (err, savedBuyer) ->
        console.log savedBuyer

    console.log buyer

    # Prep data variables for front-end
    users =
      firstName: 'Thomas'

    # Render dashboard with data
    res.render "dashboard", 
      users: users
      rsToken: token

# Dashboard
app.get "/logout", (req, res) ->

  token = ""
  buyer = null
  buyersCollection = null

  if db?
    db.close()
  
  res.redirect '/'

app.listen 3000
console.log "Express server started on port 3000"

