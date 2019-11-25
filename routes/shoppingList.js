var express = require("express");
var router = express.Router();
var Recipe = require("../models/recipe");
var middleware = require("../middleware");

//  ADD TO SHOPPING LIST ROUTE
router.post("/shoppinglist/:id", middleware.isLoggedIn, (req, res) => {
    Recipe.findById(req.params.id, (err, foundRecipe) => {
        if(err || !foundRecipe) {
            console.log('Error finding recipe: ', err);
            req.flash("error", err.message);
            res.redirect('back');
        } else {
            req.user.shoppingList = [
                ...req.user.shoppingList,
                ...foundRecipe.ingredients
            ];
            req.user.recipes.forEach((recipe) => {
                if(recipe.id == req.params.id) {
                    recipe.lastMade = new Date();
                    recipe.markModified('lastMade');
                }
            });
            req.user.save();
            res.redirect("/shoppingList");
        }
    });
});

//  SHOW SHOPPING LIST ROUTE
router.get("/shoppinglist", middleware.isLoggedIn, (req, res) => {
    res.render("shoppingList", { shoppingList: req.user.shoppingList, pageTitle: 'Shopping List' });
});

//  CLEAR SHOPPING LIST ROUTE
router.delete("/shoppinglist", middleware.isLoggedIn, (req, res) => {
    req.user.shoppingList = [];
    req.user.save();
    res.redirect("/shoppinglist");
});

module.exports = router;