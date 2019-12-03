var mongoose = require("mongoose");
var Recipe = require("./models/recipe");

async function startDB() {
    await Recipe.remove({}, err => {
        if(err) {
            console.log("Error removing all recipes: ", err);
        } else {
            console.log("removed all recipes")
        }

        data.forEach(seed => {
            Recipe.create(seed, (err, data) => {
                if(err) {
                    console.log('Error seeding db: ', err);
                } else {
                    console.log('Seed added to db');
                }
            });

        });
    });
}

async function endDB() {
    await mongoose.connection.close();
}

module.exports = {
    startDB,
    endDB
};

// DUMMY DATA

const data = [
    {
        name: 'Recipe 1',
        image: 'https://www.budgetbytes.com/wp-content/uploads/2019/11/Smoky-Black-Bean-Soup-bowls-V2.jpg',
        imageId: '',
        ingredients: [ 'ingredient 1', 'ingredient 2', 'ingredient 3' ],
        instructions: "Dice the onion and mince the garlic. Remove the stem and seeds from the jalapeño, then dice the remaining jalapeño flesh.\r\n\r\nAdd the onion, garlic, jalapeño, and olive oil to a soup pot and sauté over medium heat for about 5 minutes, or until the onions are soft and translucent.\r\n\r\nWhile the onion, garlic, and jalapeño are sautèing, use a blender to purée two of the three cans of black beans (with liquid from the can). If the beans are too thick to purée, add just enough water to make them blend.\r\nAdd all three cans of black beans to the soup pot (one can of whole beans with liquid, two puréed), along with the can of fire roasted diced tomatoes (with juices), the cumin, oregano, and smoked paprika. Stir to combine.\r\n\r\nPlace a lid on the pot and allow the soup to come up to a simmer. Allow the soup to simmer, stirring often, for about 15 minutes. After simmering for 15 minutes, taste and add salt to taste (I added 1/2 tsp). Serve hot with your choice of toppings.\r\n\r\n*For a mild soup, skip the jalapeño and use smoked paprika. For a spicy soup, add the jalapeño and use chipotle powder in place of, or in addition to, smoked paprika.",
        url: 'https://www.budgetbytes.com/smoky-black-bean-soup/',
        servings: '4',
        author: {
            id: "5ddd3b26efbefacc3848bb3f",
            username: 'test-user'
        },
        tags: [ 'vegan', 'vegetarian' ]
    },
    {
        name: 'Recipe 2',
        image: 'https://www.budgetbytes.com/wp-content/uploads/2019/11/Roasted-Apple-Cranberry-Cornbread-Stuffing-pot-V1.jpg',
        imageId: '',
        ingredients: [ 'ingredient 1', 'ingredient 2', 'ingredient 3', 'ingredient 4' ],
        instructions: "Preheat the oven to 400ºF. Core and dice the apples. Add the apples, cranberries, brown sugar, and salt to a large baking dish. Stir until the apples and cranberries are evenly coated in sugar. Transfer to the oven and roast for 20 minutes. Stir the apples and cranberries, return them to the oven and roast for an additional 10-15 minutes, or until the cranberries have burst and appear wrinkled.\r\n\r\nMeanwhile, dice the celery and onion. Add the butter, celery and onion to a large pot. Sauté over medium heat for about 5 minutes, or until the onions are soft and translucent. Chop the pecans.\r\n\r\nAdd 3 cups water to the pot with the celery and onion, place a lid on top, turn the heat up to high, and bring the water up to a boil. Once boiling, add the cornbread stuffing mix and stir briefly to combine. Turn off the heat, place the lid on top and let the stuffing rest for 5 minutes to absorb the liquid.\r\nAfter the stuffing has rested, add the roasted apples and cranberries and chopped pecans. Fold them into the stuffing. Serve immediately, or transfer to a baking dish and bake for about 15 minutes at 350ºF to make the top crispy.",
        url: 'https://www.budgetbytes.com/roasted-apple-cranberry-cornbread-stuffing/',
        servings: '8',
        author: {
            id: "5ddd3b26efbefacc3848bb3f",
            username: 'test-user'
        },
        tags: [ 'meal prep' ]
    },
    {
        name: 'Recipe 3',
        image: 'https://www.budgetbytes.com/wp-content/uploads/2019/11/Mushroom-and-Spinach-Pasta-with-Ricotta-plate-V1.jpg',
        imageId: '',
        ingredients: [ 'ingredient 1', 'ingredient 2' ],
        instructions: "Bring a large pot of water to a boil for the pasta. Once boiling, add the bowtie pasta and continue to boil until tender (about 7 minutes). Reserve 1/2 cup of the starchy pasta water before draining in a colander.\r\n\r\nWhile the pasta is cooking, prepare the rest of the dish. Wash and slice the mushrooms, then add them to a large skillet along with the olive oil. Sauté over medium heat until the mushrooms have released all their water, the water has evaporated, and the mushrooms begin to brown (about 7 minutes).\r\n\r\nWhile the mushrooms are cooking, mince the garlic. Add the garlic and butter to the browned mushrooms and continue to cook over medium for 1-2 minutes more, or just until the garlic softens a bit.\r\nBy this time the pasta should be finished cooking. Add about 1/4 cup of the reserved pasta water to the skillet and stir to dissolve any browned bits off the bottom of the skillet. The starchy pasta water and butter will make a slurry that will act as a light sauce that helps the salt and pepper adhere to the surface of the pasta.",
        url: 'https://www.budgetbytes.com/mushroom-and-spinach-pasta-with-ricotta/',
        servings: '4',
        author: {
            id: "5ddd3b26efbefacc3848bb3f",
            username: 'test-user'
        },
        tags: [ ]
    },
]