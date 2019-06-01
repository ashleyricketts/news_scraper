// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the comment schema
var CommentSchema = new Schema({
  // The comment text
  body: {
    type: String
  }
});


var Comment = mongoose.model("Comment", CommentSchema);

// Export the Comment model
module.exports = Comment;