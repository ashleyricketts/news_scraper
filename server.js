var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// scraping tools
var cheerio = require("cheerio");
var axios = require("axios");

var db = require("./models");

var PORT = 8080;

// initialize express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/NPRscraper", { useNewUrlParser: true });


// Routes

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

        }); 
    
        res.send("Scrape Complete");
    });
});






