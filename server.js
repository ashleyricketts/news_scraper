var cheerio = require("cheerio");
var axios = require("axios");

axios.get("https://www.aljazeera.com/topics/regions/us-canada.html").then(function(response) {

    var $ = cheerio.load(response.data);

    var results = [];

    $("h2").each(function(i, element) {

        var title = $(element).parent().text();
        var link = $(element).parent().parent().find("a").attr("href");
        
        results.push({
            title: title,
            link: link
          });
    });

    console.log(results);
});
