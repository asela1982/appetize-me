// Global variables
var images_json_list;
var totalFiles = 0;
var processedCount = 0;
// Locate "#preview" DIV and file input for image processing
var $preview = document.querySelector('#preview');
// API key & URL
api_key = "AIzaSyB1E6Cjq3r3A4LTF6LLwBVRqVb-GIes5o8";
var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + api_key;

// Process the submit event
$(function () {
  $('#fileform').on('submit', uploadFiles);
});

// Highlight the Files input if they uploaded a file (triggered on element change)
function highlight() {
    $('input#imagebrowser').css({'font-weight':'bold', 'color': 'green'});
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
        images_json_list = [];
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
        setTimeout(function(){ processImageData(); }, 2000);
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
    loc_storage_key = "image_id_" + parseInt(processedCount+1);
    localStorage.setItem(loc_storage_key, image_id);

    // Create new image
    var $image = new Image();
    $image.title = file.name;
    $image.src = fileobj.result;

    // Create new DIV element to receive image label
    var $divlabel = document.createElement("div");
    $divlabel.className = "imageLabel"; 
    $divlabel.textContent = "Loading labels...";

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
    var imageContainers = document.querySelectorAll("#preview .imageContainer");
    iter = 1;
    imageContainers.forEach(function(imageContainer) {
        // Get id for labels localStorage value
        var loc_storage_labels_id = "image_labels_" + iter;
        labels = localStorage.getItem(loc_storage_labels_id);

        // Get ID for image LocalStorage value
        var loc_storage_image_id = "image_id_" + iter;
        image_id = localStorage.getItem(loc_storage_image_id);

        // If there is a match from Image id to DIV ID, display the labels under the current image
        if (image_id == imageContainer.id) {
            imageContainer.childNodes[1].textContent = labels;          
        }
        iter += 1;
    });
}
