var express = require("express");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var axios = require("axios");

// intialize express
var app = express();

// database configuration 
var databaseUrl = "news_scraper";
var collections = ["scrapedNews"];

// hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// main route (simple Hello World Message)
app.get("/", function(req, res) {
    res.send("Hello world");
  });


// Retrieve data from the db
app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedNews.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });

// scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res){
    axios.get("https://www.aljazeera.com/topics/regions/us-canada.html").then(function(response) {

    var $ = cheerio.load(response.data);

    var results = [];

    $("h2").each(function(i, element) {

        var title = $(element).parent().text();
        var link = $(element).parent().parent().find("a").attr("href");
        // var summary = $(element).parent().find("p");

        if(title && link) {
            db.scrapedNews.insert({
                title: title,
                link: link
            },
            function(err, inserted){
                if (err){
                    console.log(err);
                }
                else{
                    console.log(inserted);
                }
            });
        }

    });
    });
    res.send("Scrape Complete");
});

//listen on port 8080
app.listen(8080, function() {
    console.log("App running on port 8080!")
})


