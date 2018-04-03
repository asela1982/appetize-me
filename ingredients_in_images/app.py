from flask import Flask, request

# Debugging variables
flask_debugging = True  # Set to True when in Flask debug mode (DISABLE BEFORE DEPLOYING LIVE)

# Initialize Flask
app = Flask(__name__)

#
# *** Main script execution ***
#
if __name__ == "__main__":
    app.run(debug=flask_debugging)
