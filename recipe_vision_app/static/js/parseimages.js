// Global variables
var DEBUGGING = false; // *** SET TO false WHEN DONE DEBUGGING ***
var totalFiles = 0;
var processedCount = 0;
var images_json_list = [];

// Locate "#preview" DIV and reset button elements
var $preview = document.querySelector('#preview');
var $results = document.querySelector('#results');
var $resultsing = document.querySelector('#results #ingredients');
var $recipeForm = document.querySelector('#recipe_form');
var $resetBtn = document.querySelector("#reset");
var $imageBrowser = document.querySelector("#imagebrowser");

// API key & URL
api_key = "AIzaSyB1E6Cjq3r3A4LTF6LLwBVRqVb-GIes5o8";
var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + api_key;

// Process the submit event
$(function () {
    // zero out global variables
    totalFiles = 0;
    processedCount = 0;
    images_json_list = [];

    // Clear localStorage deck
    localStorage.clear();
  
    // Call function to process files, on form submit
    $('#fileform').on('submit', uploadFiles);
    
    // Add an event listener to the reset button
    $resetBtn.addEventListener("click", resetFiles);

    // FOR DEBUGGING ONLY - Call function to generate form submission debug code
    if (DEBUGGING == true) {
        debug_recipe_generator();
    }
});

// Highlight the Files input if they uploaded a file (triggered on element change)
function highlight() {
    $('input#imagebrowser').css({'font-weight':'bold', 'color': 'green'});
}

function resetFiles() {
    // Clear Local storage from previous runs
    event.preventDefault(); // Prevent the default form post
    
    // Clear files input
    $imageBrowser.value = "";

    // Clear localStorage
    localStorage.clear();

    // Clear content
    $preview.innerHTML = "";
    $resultsing.innerHTML = "";
    $recipeForm.innerHTML = "";

    // Clear variables
    totalFiles = 0;
    processedCount = 0;
    images_json_list = [];    
}

/**
 * 'submit' event handler - reads the image bytes and sends it to the Cloud
 * Vision API.
 */
function uploadFiles (event) {
    // Clear Local storage from previous runs
    event.preventDefault(); // Prevent the default form post

    // Grab the file and asynchronously convert to base64.
    var files = document.querySelector('input[type=file]').files;
    totalFiles = files.length;
    // Process files
    if (files) {
        totalFiles = files.length;

        // loop through files
        for (var i = 0; i < files.length; i++) {
            // get item
            file = files.item(i);
            /*
                Read each image file and process it as base64 encoding
            */
            // Make sure `file.name` matches our extensions criteria
            if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
                var reader = new FileReader();

                // Trigger the processFile function after the image is uploaded
                reader.onloadend = processFile;
                reader.onload = (function(theFile){
                    return function(){
                        onLoadHandler(this,theFile);
                    };
                })(file);

                // Finally, read the image
                reader.readAsDataURL(file);
            }
        }

        // Call image data processing function after 2 seconds
        setTimeout(function(){ processImageData(); }, 3000);
    }
}

function onLoadHandler(fileobj, file) {
    // Define each image property so we can display it in the Preview div
    // Create new DIV element to receive image
    var $div = document.createElement("div");

    // Create new H3 element heading
    var $h3heading = document.createElement("h3");
    $h3heading.textContent = "Preview images";

    // Assign whitespace-stripped file name to become imageContainer DIV's ID
    image_id = file.name.replace(/\s/g, '');
    $div.className = "imageContainer";
    $div.id = image_id;

    // Set localStorage values for current image name
    loc_storage_key = "image_id_" + parseInt(processedCount+1);
    localStorage.setItem(loc_storage_key, image_id);
    loc_storage_key = image_id;
    localStorage.setItem(loc_storage_key, parseInt(processedCount+1));

    // Create new image
    var $image = new Image();
    $image.title = file.name;
    $image.src = fileobj.result;

    // Create new DIV element to receive image label
    var $divlabel = document.createElement("div");
    $divlabel.className = "imageLabel"; 
    //$divlabel.textContent = "Loading labels...";

    // Append heading, div containers, and images to the document
    $div.appendChild($image);
    $div.appendChild($divlabel);
    if (processedCount == 0) $preview.appendChild($h3heading);
    $preview.appendChild($div);
}

/**
 * Event handler for a file's data url - extract the image data and pass it off.
 */
function processFile (event) {
    var content = event.target.result;    
    sendFileToCloudVision(content.replace('data:image/jpeg;base64,', ''));

    processedCount++;
}

/**
 * Sends the given file contents to the Cloud Vision API and outputs the
 * results.
 */
function sendFileToCloudVision (content) {
    var type = 'LABEL_DETECTION';

    // Strip out the file prefix when you convert to json.
    /* Sample API request:
        {
            "requests": [
            {
                "features": [
                {
                    "type": "LABEL_DETECTION"
                }
                ],
                "image": {
                    "content":"/9j/7QBEUGhvdG9...image contents...eYxxxzj/Coa6Bax//Z"
                }
            }
            ]
        }
    */
    var request = {
        requests: [{
                image: {
                content: content
            },
            features: [{
                type: type,
                maxResults: 200
            }]
        }]
    };
  
  // Post the JSON to Google API to process image data
  $.post({
    url: CV_URL,
    data: JSON.stringify(request),
    contentType: 'application/json'
  }).fail(function (jqXHR, textStatus, errorThrown) {
    $('#results').text('ERRORS: ' + textStatus + ' ' + errorThrown);
  }).done(storeJSON);
}

/** 
Store JSON variable into hidden form variable 
*/
function storeJSON(data) {
    // Process data from response
    var contents_string = JSON.stringify(data, null, 4);

    // Track current iteration (1-based)
    cur_iter = parseInt(processedCount+1);

    // Append response JSON into global list
    images_json_list.push(contents_string);

    // Append updated array to local storage value
    len_images = images_json_list.length;
    loc_storage_key = "image_response_" + len_images;
    localStorage.setItem(loc_storage_key, contents_string);

    // Loop through all 'labelAnnotations' for the current image, and display + store list as string 
    curImageLabels = [];   
    var contents = JSON.parse(contents_string);
    labelAnnotations = contents.responses[0].labelAnnotations;
    for(var j in labelAnnotations) {
        curImageLabels.push(labelAnnotations[j].description);
    }

    // Add current image labels list to local storage for this image ID
    loc_storage_key = "image_labels_" + len_images;
    localStorage.setItem(loc_storage_key, curImageLabels.join(", "));  
}

function processImageData() {
    // Loop through all Image DIVs and assign the labels based on matching image IDs
    //var imageContainers = document.querySelectorAll("#preview .imageContainer");
    
    var $resultsDiv = document.querySelector("#results #ingredients");
    var master_ingredients_list = "";
    // Loop through 0 to processedCount
    for (var iter = 1; iter <= processedCount; iter++) {
        console.log("iter: " + iter);

        // Get id for labels localStorage value
        var loc_storage_labels_id = "image_labels_" + iter;
        labels = localStorage.getItem(loc_storage_labels_id);

        // Create new DIV element to receive image label
        var $div_label = document.createElement("div");
        $div_label.className = "ingredientsLabel"; 
        $div_label.innerHTML = "<b>Ingredients found</b>: " + labels;
        $resultsDiv.appendChild($div_label); 

        // Append current labels into 'master_ingredients_list'
        if (iter>1) labels = ", " + labels;
        master_ingredients_list += labels;
    }

    //
    // Put form elements here for receipe generator
    //
    // Generate form for user to submit ingredients to receipe generator
    var $formHeading = document.createElement("h4");
    $formHeading.innerHTML = "<br>Run these ingredients through the recipe generator!";
    var $recipeFormSubmit = document.createElement("input");
    $recipeFormSubmit.setAttribute("type", "submit");
    $recipeFormSubmit.setAttribute("value", "Generate");
    $recipeFormSubmit.name = "submitrecipe";

    // Form hidden element to hold our ingredients list
    var $hiddenInput = document.createElement("input");
    master_ingredients_list = 
    $hiddenInput.setAttribute("value", master_ingredients_list);
    $hiddenInput.setAttribute("type", "hidden");
    $hiddenInput.name = "ingredients";

    // Append values into DOM
    var $recipeForm = document.querySelector('#recipe_form');
    $recipeForm.appendChild($formHeading);
    $recipeForm.appendChild($hiddenInput);
    $recipeForm.appendChild($recipeFormSubmit);
}

function debug_recipe_generator() {
    //ingr_list = "fruit, avocado, natural foods, produce, superfood, food, diet food, ingredient, dish, food, soup, cuisine, vegetarian food, curry, garnish, cabbage soup diet, broth, avial, recipe, stew, ciorbă, tripe soups, asparagus, vegetable, asparagus, vegetarian food, produce, food";
    ingr_list = "asparagus";
    
    var $formHeading = document.createElement("h4");
    $formHeading.innerHTML = "<br>Run these ingredients through the recipe generator!";
    var $recipeFormSubmit = document.createElement("input");
    $recipeFormSubmit.setAttribute("type", "submit");
    $recipeFormSubmit.setAttribute("value", "Generate");
    $recipeFormSubmit.name = "submitrecipe";

    // Form hidden element to hold our ingredients list
    var $hiddenInput = document.createElement("input");
    master_ingredients_list = 
    $hiddenInput.setAttribute("value", ingr_list);
    $hiddenInput.setAttribute("type", "hidden");
    $hiddenInput.name = "ingredients";

    // Append values into DOM
    var $recipeForm = document.querySelector('#recipe_form');
    $recipeForm.appendChild($formHeading);
    $recipeForm.appendChild($hiddenInput);
    $recipeForm.appendChild($recipeFormSubmit);
}