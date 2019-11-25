const   express = require("express"),
        router = express.Router(),
        Recipe = require("../models/recipe"),
        User = require("../models/user"),
        middleware = require("../middleware"),
        { check, validationResult } = require('express-validator'),
        formatNewline = require('nl2br'),
        multer = require('multer'),
        cloudinary = require('cloudinary').v2;

//  IMAGE FILE UPLOAD CONFIG
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var fileFilter = function (req, file, callback) {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error('We only accept these formats: jpg, jpeg, png, gif'), false);
    }
    callback(null, true);
};

var upload = multer({ storage, fileFilter });

cloudinary.config({
    cloud_name: 'dqqdqhiid',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//  USER RECIPES INDEX ROUTE
router.get("/recipes", (req, res) => {
    if(req.user) {
        let recipeIds = [];
        req.user.recipes.forEach((recipe) => {
            recipeIds.push(recipe.id);
        });
        Recipe.find({ _id: recipeIds}, (err, userRecipes) => {
            if(err || !userRecipes) {
                console.log('Error finding user\'s recipes: ', err);
                req.flash("error", "We are having trouble finding your recipes");
                res.redirect('back');
            } else {
                let sortedRecipes = userRecipes;
                let recipesSorted = false;
                if(req.query.sort == 'lastMade') {
                    sortedRecipes.sort(date_sort_desc);
                    recipesSorted = true;
                }
                res.render("recipes", {recipes: sortedRecipes, pageTitle: 'My Recipes', recipesSorted});
            }
        });
    } else {
        res.render('recipes');
    }
});

//  ALL RECIPES ROUTE
router.get("/discover", (req, res) => {
    let searchTerm = {}
    let activeTag = ''
    if(req.query.search) searchTerm = {name: new RegExp(escapeRegex(req.query.search), 'gi')};
    if(req.query.tag) activeTag = req.query.tag;
    
    Recipe.find(searchTerm, (err, searchedRecipes) => {
        if(err) {
            console.log('Error finding user\'s recipes: ', err);
            req.flash("error", "We are having trouble finding recipes");
            res.redirect('back');
        } else {
            if(req.query.tag) {
                const filteredRecipes = searchedRecipes.filter(recipe => recipe.tags.includes(activeTag));
                return res.render('discover', { recipes: filteredRecipes, pageTitle: 'Discover', searchTerm: req.query.search, activeTag });
            }
            res.render('discover', { recipes: searchedRecipes, pageTitle: 'Discover', searchTerm: req.query.search });
        }
    });
});

// CREATE ROUTE
router.post("/recipes", middleware.isLoggedIn, upload.single('image'), [
    check('name').isLength({ max: 48 }),
    check('imageUrl').optional({checkFalsy: true}).isURL(),
    check('url').optional({checkFalsy: true}).isURL(),
], (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()) {
        const { name, imageUrl, url, ingredients, instructions, servings, tags } = req.body;
        const sanitizedInstructions = req.sanitize(instructions);
        let newRecipe = {
            name,
            image: '',
            imageId: '',
            url,
            servings,
            ingredients,
            instructions: sanitizedInstructions,
            author: {
                id: req.user._id,
                username: req.user.username,
            },
            tags,
        };
        const addRecipe = () => {
            Recipe.create(newRecipe, (err, createdRecipe) => {
                if(err || !createdRecipe) {
                    console.log('Error creating recipe: ', err);
                    req.flash('error', 'We could not add the recipe');
                    res.redirect('/recipes');
                } else {
                    req.user.recipes = [
                        ...req.user.recipes,
                        {
                            id: createdRecipe._id,
                            lastMade: new Date()
                        }
                    ];
                    req.user.save();
                    req.flash("success", "1 recipe added");
                    res.redirect("/recipes");
                }
            });
        };
        if(imageUrl !== '') {
            newRecipe.image = imageUrl;
            addRecipe();
        } else if(req.file) {
            var cloudinaryPromise = new Promise((resolve, reject) => {
                cloudinary.uploader.upload( req.file.path, (err, result) => {
                    if(err) {
                        console.log('Error uploading image: ', err);
                        reject(err);
                    }
                    newRecipe.image = result.secure_url;
                    newRecipe.imageId = result.public_id;
                    resolve();
                });
            });
            cloudinaryPromise.then( result => {
                addRecipe();
            }).catch(err => {
                console.log('Error uploading to Cloudinary: ', err);
                req.flash('error', 'We had trouble upoading your image');
                res.redirect('back');
            });
        } else {
            addRecipe();
        }
    } else {
        console.log('errors ', errors.errors);
        errors.errors.forEach((error) => {
            if(error.param == 'name') {
                req.flash("error", "Recipes names can not exceed 48 characters");
            }
            if(error.param == 'imageUrl') {
                req.flash("error", " Invalid image url provided");
            }
            if(error.param == 'name') {
                req.flash("error", " Invalid link url provided");
            }
            return
        });
        res.redirect('/recipes/new');
    }
});

//  ADD CREATED RECIPE
router.post("/recipes/:id/add", middleware.isLoggedIn, (req, res) => {
    let recipeIds = [];
    req.user.recipes.forEach((recipe) => {
        recipeIds.push(recipe.id);
    });
    if(!recipeIds.includes(req.params.id)) {
        Recipe.find({_id: req.params.id}, (err, foundRecipe) => {
            if(err || !foundRecipe) {
                console.log('Error finding recipe: ', err);
                req.flash("error", "That recipe does not exist");
                res.redirect('back');
            } else{
                req.user.recipes = [
                    ...req.user.recipes,
                    {
                        id: req.params.id,
                        lastMade: new Date()
                    }
                ];
                req.user.save();
                req.flash("success", "1 recipe added");
                res.redirect("/recipes");
            }
        });
    } else {
        req.flash('error', 'You\'ve already added that recipe');
        res.redirect('/recipes');
    }
});

//  NEW ROUTE
router.get("/recipes/new", middleware.isLoggedIn, (req, res) => {
    res.render("new", { pageTitle: 'New Recipe' });
});

//  SHOW ROUTE
router.get("/recipes/:id", (req, res) => {
    Recipe.findById(req.params.id, (err, foundRecipe) => {
        if(err || !foundRecipe) {
            console.log('Error finding recipe: ', err);
            req.flash("error", 'Recipe not found');
            res.redirect('back');
        }else {
            User.findById(foundRecipe.author.id, (err, foundUser) => {
                let author = '';
                if(err || !foundUser) {
                    console.log('Error finding user: ', err);
                    author = 'unknown';
                } else {
                    author = foundUser.username;
                }
                if(!req.isAuthenticated()) { 
                    res.render('show', {recipe: foundRecipe, pageTitle: foundRecipe.name, author, instructions: formatNewline(foundRecipe.instructions, false)});
                } else {
                    let recipeIds = [];
                    req.user.recipes.forEach((recipe) => {
                        recipeIds.push(recipe.id);
                    });
                    const createdByUser = foundRecipe.author.id.equals(req.user._id);
                    const userHasRecipe = recipeIds.includes(foundRecipe._id.toString());
                    res.render('show', {recipe: foundRecipe, pageTitle: foundRecipe.name, author, createdByUser, userHasRecipe, instructions: formatNewline(foundRecipe.instructions, false) });
                }
            });
        }
    })
});

//  EDIT ROUTE
router.get("/recipes/:id/edit", middleware.checkRecipeOwner, (req, res) => {
    Recipe.findById(req.params.id, (err, foundRecipe) => {
        res.render('edit', {recipe: foundRecipe});
    });
});

//  UPDATE ROUTE
router.put("/recipes/:id", middleware.checkRecipeOwner, upload.single('image'), [
    check('name').isLength({ max: 36 }),
    check('image').optional({checkFalsy: true}).isURL(),
    check('url').optional({checkFalsy: true}).isURL(),
], (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()) {
        Recipe.findById(req.params.id, (err, foundRecipe) => {
            if(err || !foundRecipe) {
                console.log('Error finding recipe: ', err);
                req.flash("error", 'Recipe not found');
                return res.redirect('back');
            }
            const { name, imageUrl, url, ingredients, instructions, tags, servings } = req.body;
            const sanitizedInstructions = req.sanitize(instructions);
            let updatedRecipe = {
                name,
                image: '',
                imageId: '',
                url,
                servings,
                ingredients,
                instructions: sanitizedInstructions,
                author: {
                    id: req.user._id,
                    username: req.user.username,
                },
                tags,
            };
            const updateRecipe = () => {
                Recipe.findByIdAndUpdate(req.params.id, updatedRecipe, (err, updatedRecipe) => {
                    if(err) {
                        console.log('Error updating recipe: ', err);
                        req.flash('error', 'We could not edit the recipe');
                        res.redirect('/recipes');
                    } else {
                        req.flash("success", "Recipe succesfully updated");
                        res.redirect(`/recipes/${req.params.id}`);
                    }
                });
            };
            if(req.file && foundRecipe.imageId !== '') {
                cloudindaryUpdatePromise = new Promise((resolve, reject) => {
                    cloudinary.uploader.destroy(foundRecipe.imageId, (err) => {
                        if(err) {
                            console.log('Error deleting image: ', err);
                            reject(err);
                        }
                        cloudinary.uploader.upload( req.file.path, (err, result) => {
                            if(err) {
                                console.log('Error uploading image: ', err);
                                reject(err);
                            }
                            updatedRecipe.image = result.secure_url;
                            updatedRecipe.imageId = result.public_id;
                            resolve();
                        });
                    });
                });
                cloudindaryUpdatePromise.then(result => {
                    updateRecipe();
                }).catch(err => {
                    console.log('Error updating image in Cloudinary: ', err);
                    req.flash('error', 'We had trouble updating your image');
                    res.redirect('back');
                });
            } else if(req.file && foundRecipe.imageId == '') {
                var cloudinaryPromise = new Promise((resolve, reject) => {
                    cloudinary.uploader.upload( req.file.path, (err, result) => {
                        if(err) {
                            console.log('Error uploading image: ', err);
                            reject(err);
                        }
                        updatedRecipe.image = result.secure_url;
                        updatedRecipe.imageId = result.public_id;
                        resolve();
                    });
                });
                cloudinaryPromise.then( result => {
                    updateRecipe();
                }).catch(err => {
                    console.log('Error uploading to Cloudinary: ', err);
                    req.flash('error', 'We had trouble upoading your image');
                    res.redirect('back');
                });
            } else if(!req.file && foundRecipe.imageId !== '') {
                var cloudinaryDeletePromise = new Promise((resolve, reject) => {
                    cloudinary.uploader.destroy(foundRecipe.imageId, (err) => {
                        if(err) {
                            console.log('Error deleting image: ', err);
                            reject(err);
                        }
                        resolve();
                    });
                });
                cloudinaryDeletePromise.then(result => {
                    updateRecipe();
                }).catch(err => {
                    console.log('Error uploading to Cloudinary: ', err);
                    req.flash('error', 'We had trouble deleteing your image');
                    res.redirect('back');
                });
            } else if(imageUrl !== foundRecipe.image) {
                updatedRecipe.image = imageUrl;
                updatedRecipe.imageId = '';
                updateRecipe();
            }
        });
    } else {
        errors.errors.forEach((error) => {
            if(error.param == 'name') {
                req.flash("error", "Recipes names can not exceed 48 characters");
            }
            if(error.param == 'image') {
                req.flash("error", " Invalid image url provided");
            }
            if(error.param == 'name') {
                req.flash("error", " Invalid link url provided");
            }
            return
        });
        res.redirect('/recipes/new');
    }
});

//  DELETE ROUTE
router.delete("/recipes/:id", middleware.checkRecipeOwner, (req, res) => {
    const deleteRecipe = () => {
        Recipe.findByIdAndDelete(req.params.id, (err) => {
            if(err) {
                console.log('Error deleting recipe: ', err);
                req.flash('error', 'We could not delete that recipe')
                res.redirect('/recipes');
            } else {
                req.flash("success", "1 recipe deleted");
                res.redirect('/recipes');
            }
        });
    };
    Recipe.findById(req.params.id, (err, foundRecipe) => {
        if(err || !foundRecipe) {
            console.log('Error finding recipe: ', err);
            req.flash("error", 'Recipe not found');
            return res.redirect('back');
        }
        if(foundRecipe.imageId !== '') {
            var cloudinaryDeletePromise = new Promise((resolve, reject) => {
                cloudinary.uploader.destroy(foundRecipe.imageId, (err) => {
                    if(err) {
                        console.log('Error deleting image: ', err);
                        reject(err);
                    }
                    resolve();
                });
            });
            cloudinaryDeletePromise.then(result => {
                deleteRecipe();
            }).catch(err => {
                console.log('Error uploading to Cloudinary: ', err);
                req.flash('error', 'We had trouble deleteing your image');
                res.redirect('back');
            });
        } else {
            deleteRecipe();
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

var date_sort_asc = function (date1, date2) {
    if (date1 > date2) return 1;
    if (date1 < date2) return -1;
    return 0;
};

var date_sort_desc = function (date1, date2) {
    if (date1 > date2) return -1;
    if (date1 < date2) return 1;
    return 0;
};

module.exports = router;