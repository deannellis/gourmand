var mongoose = require("mongoose");
var Recipe = require("./models/recipe");

function seedDB() {
    Recipe.remove({}, err => {
        if(err) {
            console.log("Error removing all recipes ", err);
        }
        console.log("removed all recipes")
    });
}

module.exports = seedDB;
