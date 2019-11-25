var mongoose = require("mongoose");

var recipeSchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    ingredients: [ String ],
    instructions: String,
    url: String,
    servings: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    tags: [ String ]
});

module.exports = mongoose.model("Recipe", recipeSchema);