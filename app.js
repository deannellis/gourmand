require('dotenv').config();

var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    path = require('path'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    flash = require('connect-flash'),
    User = require("./models/user"),
    Recipe = require("./models/recipe");

var indexRoutes = require("./routes/index"),
    recipeRoutes = require("./routes/recipe"),
    shoppingListRoutes = require("./routes/shoppingList");

//  APP CONFIG
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to Database!');
}).catch(err => {
    console.log('Error: ', err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'pug');
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());
//  PASSPORT CONFIG
app.use(require("express-session")({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.error = req.flash("error"); 
    res.locals.success = req.flash("success"); 
    next();
});

app.use(indexRoutes);
app.use(recipeRoutes);
app.use(shoppingListRoutes);

//  * ROUTE IS LAST
app.get("*", function(req, res) {
    res.render("notFound");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, () => {
    console.log(
        `App is running on port ${process.env.PORT}` + '\n' +'\n' +
        '   (         )      ' + '\n' +
        '    )       (       ' + '\n' +
        '// ""--.._' + '\n' +
        '||  (_)  _ "-._' + '\n' +
        '||    _ (_)    \'-.' + '\n' +
        '||   (_)   __..-\'' + '\n' +
        ' \\\\ __..--\"\"' + '\n' 
    );
});