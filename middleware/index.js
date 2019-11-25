const Recipe = require('../models/recipe');
const middleware = {};

middleware.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please log in");
    res.redirect("/login");
};

middleware.checkRecipeOwner = (req, res, next) => {
    if(req.isAuthenticated()) {
        Recipe.findById(req.params.id, (err, foundRecipe) => {
            if(err || !foundRecipe) {
                console.log("Error finding recipe in db: ", err);
                req.flash("error", 'Recipe not found');
                res.redirect("back");
            }else {
                if(foundRecipe.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You did not create that recipe");
                    res.redirect('back');
                }
            }
        });
    } else {
        res.redirect("/login");
    }
};

module.exports = middleware;