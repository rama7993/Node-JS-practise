const Joi = require("joi");
const express = require("express");
const app = express();
// Middleware for parsing JSON in incoming request bodies (req.body)
app.use(express.json());

const recipes = [
  {
    id: 1,
    name: "Classic Margherita Pizza",
  },
  {
    id: 2,
    name: "Chicken Biryani",
  },
  {
    id: 3,
    name: "Aloo Keema",
  },
  {
    id: 4,
    name: "Beef and Broccoli Stir-Fry",
  },
];

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/recipes", (req, res) => {
  if (!recipes.length) return res.status(400).send("Please add some recipes.");
  res.send(recipes);
});

app.get("/api/recipes/:id", (req, res) => {
  const recipe = recipes.find((recipe) => recipe.id === +req.params.id); // + or parseInt (returns string)
  if (!recipe)
    return res.status(400).send("Sorry, the requested recipe was not found.");
  res.send(recipe);
});

app.post("/api/recipes", (req, res) => {
  const { error } = validateRecipe(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // if (!req.body.name || req.body.name.length < 5) {
  //   res.status(400).send("Name is required and should be minimum length of 5");
  // }

  const recipe = {
    id: recipes.length + 1,
    name: req.body.name,
  };
  recipes.push(recipe);
  res.send(recipe);
});

function validateRecipe(recipe) {
  const schema = Joi.object({
    name: Joi.string().min(5).required().messages({
      "string.base": "The recipe name should be a text.",
      "string.empty": "Recipe name cannot be empty. Please provide a name.",
      "string.min": "Recipe name should be at least {#limit} characters long.",
      "any.required": "Recipe name is required. Please provide a valid name.",
    }),
  });

  return schema.validate(recipe);
}

app.put("/api/recipes/:id", (req, res) => {
  const recipe = recipes.find((recipe) => recipe.id === +req.params.id); // + or parseInt (returns string)
  if (!recipe) return res.status(400).send("Recipe not found.");

  const { error } = validateRecipe(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  recipe.name = req.body.name;
  res.send(recipe);
});

app.delete("/api/recipes/:id", (req, res) => {
  const recipe = recipes.find((recipe) => recipe.id === +req.params.id); // + or parseInt (returns string)
  if (!recipe) return res.status(400).send("Recipe not found.");

  const index = recipes.indexOf(recipe);
  recipes.splice(index, 1);
  res.send(recipe);
});

// PORT (set PORT=5000 in commands for changing)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
