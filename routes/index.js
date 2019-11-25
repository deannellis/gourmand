const   express = require("express"),
        router = express.Router(),
        passport = require('passport'),
        User = require("../models/user"),
        Recipe = require("../models/recipe"),
        { check, validationResult } = require('express-validator');

router.get("/", (req, res) => {
    Recipe.find({}, (err, recipes) => {
        if(err || !recipes) {
            res.render("index", { isFullWidth: true , recipes: null})
        } else {
            res.render("index", { isFullWidth: true , recipes})
        }
    }).limit(3);
});

//  AUTH ROUTES
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", [
    check('username')
        .isLength({ min: 3 })
        .trim(),
    check('password')
        .isLength({ min: 6 })
], (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()) {
        User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
            if(err) {
                console.log('Error registering new user: ', err);
                req.flash("error", err.message);
                return res.redirect("/register");
            }
            passport.authenticate("local")(req, res, () => {
                req.flash('success', `Welcome to Gourmand ${req.body.username}!`);
                res.redirect("/recipes");
            })
        });
    } else {
        if(errors.errors[0].param == 'username' || errors.errors[1].param == 'username') {
            req.flash("error", "Username must be at least 3 characters long");
        }
        if(errors.errors[0].param == 'password' || errors.errors[1].param == 'password') {
            req.flash("error", " Password must be at least 6 characters long");
        }
        res.redirect('/register');
    }
});

router.get("/login", (req, res) => {
    res.render('login');
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/recipes", 
    failureRedirect: "/login",
}), (req, res) => { });

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You have successfully logged out");
    res.redirect("/");
});

module.exports = router;