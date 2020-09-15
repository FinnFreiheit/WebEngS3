// -----------------------------------------------------------------------------
// All below may still contain bugs or at least typos in the comments !!
// It should be sufficent to run our Webengineering lab Exercises, however you are
// very much invited to change this..
//------------------------------------------------------------------------------
// This node.js application uses the express package as its implementation of a
// web server
// for more info, see: http://expressjs.com
// --------------------------------------------------------------
// Here we define all the required modules and services
var express = require('express');        // critical module for building a Web Server App
// Here are some basic packages we need together with express
var bodyParser = require('body-parser'); // helper routines to parse data as JSON in request body
var request = require('request');        // http requests used for our proxy and cloudant outbound call
var basicAuth = require('express-basic-auth'); // Some basic HTTP Header Authorization
//----------------------------------------------------------------------------
// create a new express based Web Server
// ---------------------------------------------------------------------------
var app = express();
// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');
// app.use('/static', express.static('/views/HTML'))
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// -----------------------------------------------------------------------------
// This is a HTPP Basic Authentication Code fragment for potential use
// in this example we force a http basic authentication if there is a request
// with localhost:6001/admin
// -----------------------------------------------------------------------------
app.use('/admin',basicAuth( { authorizer: myAuthorizer,
                    challenge: true} ))
function myAuthorizer(username, password) {
    console.log("Erstmal anmelden hier");
    return username.startsWith('Asomething') && password.startsWith('secretstrange')
}
// -----------------------------------------------------------------------------
// Below commented code enables CORS, just in case you want to explore this
// option
// -----------------------------------------------------------------------------
/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}); */
// -----------------------------------------------------------------------------
// the WebServer now listens to http://localhost:6001 / http gets and posts
// -----------------------------------------------------------------------------
var server = app.listen(6001, function() {
  console.log('***********************************');
  console.log('listening:', 6001);
  console.log('***********************************');
});
// -----------------------------------------------------------------------------
// The following serve for different url paths
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// localhost:6001/static/filename.ext
// send a static file out of public/ext/filename.ext to the client
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// as default for static files you can also use
// localhost:6001/ext/filename.ext..
// node will use the public folder and concatenates the url path in order to
// find the file
// -----------------------------------------------------------------------------
app.get('/static/:document.:extension', function(req, res){
   var docname = "/" + req.params.extension + "/" + req.params.document+ "." + req.params.extension ;
   var options = {
   root: __dirname + '/public/',
   }
   res.sendFile(docname, options, function (err) { // send the file !!
    if (err) {res.send(err);}
     else {console.log('Sent:', docname);
    }
  });
});
// -----------------------------------------------------------------------------
// localhost:6001/redirect
// will redirect us to the offical DHBW Homepage
// -----------------------------------------------------------------------------
app.get('/redirect', function(req, res){
   res.redirect('https://www.dhbw-stuttgart.de/home/');
});
// -----------------------------------------------------------------------------
// localhost:6001/home
//  we show the map.htm which is the Google Map at the local Stuttgart
// -----------------------------------------------------------------------------
app.get('/home', function(req, res){
  var docname = "/htm/map.htm";
  var options = {root: __dirname + '/public/'}
  res.sendFile(docname, options, function (err) { // send this file
   if (err) {
     res.send(err);
   } else {
     console.log('Sent:', docname);
   }
 });
});
//------------------------------------------------------------------------------
// localhost:6001/proxy?url_to_be_proxied
// The incoming request will transfered using the request package
//------------------------------------------------------------------------------
app.all('/proxy', function(req, res){
    var decompose = req.originalUrl.split("?");
    var fullurl = decompose[1] + "?" + decompose[2];
    fullurl = fullurl.replace("url=","");
    console.log("Proxy Server reached", fullurl);
    var o = {uri: fullurl,method: req.method,json: true};
    request(o, function(e, r, b){
      if(e) {
          res.send({error: e, status: "Fehler", request: o, response: e});
      } else {
          res.send({error: e, status: r.statusCode, request: o, response: b});
      }
    });
});
// -------------------------------------------------------------------
// News processing using the request service.
// a localhost:6001/news1 will send the tagesschau  RSS (XML Data)
// -------------------------------------------------------------------
app.get('/news1', function(req, res){
  var o = {
    uri: "http://www.tagesschau.de/xml/rss2",
    method: req.method,
    json: false
            };
    request(o, function(e, r, b){
    try {
      res.setHeader('Content-type', 'text/plain' );
      res.send(b);
    } catch (err) {
      res.setHeader('Content-type', 'text/plain' );
      console.log("Fehler beim Transfer", err)
      res.send(err);
    } finally {
      return;
    }
  });
  });

// -----------------------------------------------------------------------------
//  Chat Management using Cloudant as DB in the Cloud
// -----------------------------------------------------------------------------
app.all('/chat', function (req,res) {
  console.log(req.body.cmd);
  if (req.body.Group == undefined || req.body.Group == "") {req.body.Group = "GlobalChat"}
  var o = {
    uri: "https://juergenschneider.eu-gb.mybluemix.net/chat",
    method: "POST",
    json: true
            };
    o.body = req.body;
    request(o, function(e, r, b){
      if (e) {res.send({Status:"NOK", Data:e})}  // Error Case in Request Service
      else { res.send(b) } // Send back the already formated results
    });
  });
