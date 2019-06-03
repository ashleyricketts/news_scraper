var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// scraping tools
var cheerio = require("cheerio");
var axios = require("axios");

var db = require("./models");

var PORT = process.env.PORT || 8080;

// initialize express
var app = express();

// handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// database configuration
// var databaseUrl = "NPRscraper";
// var collections = ["Articles"]

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/NPRscraper", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);



// Routes

// route for homepage
app.get("/", function(req, res) {
    db.Article.find({"saved": false}, function(err, data) {
        if(err) {
            return res.status(500).end();
        }
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);

        res.render("index", hbsObject);
    });
});

// get route to scrape NPR website
app.get("/scrape", function(req, res) {

    axios.get("https://www.npr.org/sections/news/")
    .then(function(response) {
        
        var $ = cheerio.load(response.data);

        $("div.item-info").each(function(i, element) {

            var result= {};
            result.title = $(this).children("h2").text();
            // console.log("+" + title);
            result.summary = $(element).children("p.teaser").text();
            // console.log("&" + summary);
            result.link = $(element).children("h2").children("a").attr("href");
            // console.log("*" + link);
            // console.log(result);

            db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    console.log(err);
                });
        }); 
    
        res.send("Scrape Complete");
    });
});

// route for getting all Articles from db
app.get("/articles", function(req, res) {
    db.Article.find({})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// route for getting saved articles
app.get("/saved", function(req, res) {
    db.Article.find({"saved": true}).populate("comment").exec(function(err, articles) {
        if(err) {
            return res.status(500).end();
        }

        var hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject)
    });
});



// start the server
app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});






