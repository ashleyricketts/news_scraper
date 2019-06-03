var mongoose = require("mongoose");

var Comment = require("./Comment");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

    title: {
        type: String,
        required: true,
        unique: true
    },

    link: {
        type: String,
        required: true
    },

    summary: {
        type: String,
        // required: true
    },
    // comment is an object that stores a comment id
    //ref property links the ObjectId to the comment model
    // allows for population of article with associated comment
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],

    saved: {
        type: Boolean,
        default: false
    }
});

// creates model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;