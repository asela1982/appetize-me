import ast
import json
from flask import Flask, render_template, request, jsonify
from Similarity.similarity import get_recipes

# Debugging variables
app_debugging = False    # Set to True when debugging the app
json_debugging = False
flask_debugging = True  # Set to True when in Flask debug mode (DISABLE BEFORE DEPLOYING LIVE)

# Initialize Flask
app = Flask(__name__)

#################################################
# Routes
#################################################
@app.route("/recipegenerator", methods=["GET", "POST"])
def recipegenerator():
    if request.method == "POST":        
        # Obtain ingredients list form FORM POST
        ingredients = request.form["ingredients"]

        # Convert ingredients into a list
        ingredients_list = [i for i in ingredients.split(", ")]

        # Call get_recipes to receive JSON list of recipes
        recipes_dict = get_recipes(ingredients_list)

        if json_debugging == True:
            
            return jsonify(recipes_dict)    

        else:

            # Add the ingredients as a new dictionary value
            recipes_dict["ingredients"] = ingredients

            # Add tags values as comma separated lists
            recipes_dict["tags_1"] = ", ".join(ast.literal_eval(recipes_dict["tags_refined"][0]))
            recipes_dict["tags_2"] = ", ".join(ast.literal_eval(recipes_dict["tags_refined"][1]))
            recipes_dict["tags_3"] = ", ".join(ast.literal_eval(recipes_dict["tags_refined"][2]))
            recipes_dict["tags_4"] = ", ".join(ast.literal_eval(recipes_dict["tags_refined"][3]))

            # Render template, passing our JSON dict for values
            return render_template("index.html", dict=recipes_dict)

#
# *** Main script execution ***
#
if __name__ == "__main__":
    app.run(debug=flask_debugging)