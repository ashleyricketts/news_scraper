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
        // console.log(hbsObject);

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

// save an article
app.post("/articles/save/:id", function(req, res) {
    // Use the article id to find and update its saved boolean
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true})
    // Execute the above query
    .exec(function(err, doc) {
      // Log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// route for getting article by ObjectId
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ "_id": req.params.id })
    // ..and populate all of the notes associated with it
    .populate("comment")
    // now, execute our query
    .exec(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
  });

  // delete an article
  app.post("/articles/delete/:id", function(req, res) {
    // Use the article id to find and update its saved boolean
    Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": false, "notes": []})
    // Execute the above query
    .exec(function(err, doc) {
      // Log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// create new comment
app.post("/comments/save/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newComment = new Comment({
      body: req.body.text,
      article: req.params.id
    });
    console.log(req.body)
    // And save the new note the db
    newComment.save(function(error, note) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise
      else {
        // Use the article id to find and update it's notes
        db.Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "comment": note } })
        // Execute the above query
        .exec(function(err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send(note);
          }
        });
      }
    });
  });

  // delete a comment
  app.delete("/comment/delete/:comment_id/:article_id", function(req, res) {
    // Use the comment id to find and delete it
    db.Note.findOneAndRemove({ "_id": req.params.comment_id }, function(err) {
      // Log any errors
      if (err) {
        console.log(err);
        res.send(err);
      }
      else {
        db.Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {"comment": req.params.comment_id}})
         // Execute the above query
          .exec(function(err) {
            // Log any errors
            if (err) {
              console.log(err);
              res.send(err);
            }
            else {
              // Or send the comment to the browser
              res.send("Comment Deleted");
            }
          });
      }
    });
  });
  


// start the server
app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});






