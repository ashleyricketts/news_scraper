var cheerio = require("cheerio");
var axios = require("axios");


axios.get("https://www.npr.org/sections/news/")
    .then(function(response) {
        
        var $ = cheerio.load(response.data);

        var results = [];

        $("div.item-info").each(function(i, element) {

            var title = $(element).children("h2").text();
            // console.log("+" + title);

            var summary = $(element).children("p.teaser").text();
            // console.log("&" + summary);

            var link = $(element).children("h2").children("a").attr("href");
            // console.log("*" + link);
        });
    });