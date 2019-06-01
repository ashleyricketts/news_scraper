// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Requiring Comment and Article models
var Comment = require("./models/comments.js");
var Article = require("./models/articles.js");

// Requiring routing controllers
var htmlRouter = require("./controllers/html-routes.js");
var articleRouter = require("./controllers/article-routes.js");

// Scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var port = process.env.PORT || 8080;
var app = express();

// Use body parser with the app
app.use(bodyParser.urlencoded({
  extended: false
}));

// Initialize Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routing
app.use("/", htmlRouter);
app.use("/", articleRouter);

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


app.listen(port, function() {
  console.log("App running on port 8080!");
});