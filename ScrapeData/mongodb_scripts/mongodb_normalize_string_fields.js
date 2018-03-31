// Switch to the correct database
use master_chef;

// Split "ingredients" string field into array field containing individual ingredients
db.recipes.find().snapshot().forEach(function (el) {
    // If the field hasn't already been converted to an array...
    if (typeof el.ingredients == "string") {
        // Parse only the part of the string that doesn't include bracket and double quote characters
        el.ingredients = el.ingredients.substring(2,el.ingredients.length-2);   
        // Strip out single quote characters around array values
        el.ingredients = el.ingredients.replace(/[']/g, "");
        // Create the array by Splitting on comma-plus-space
        el.ingredients = el.ingredients.split(', ');
        
        // Save changes to the record
        db.recipes.save(el); 
    }
});

// Split "tags" string field into array field containing individual tags
db.recipes.find().snapshot().forEach(function (el) {
    // If the field hasn't already been converted to an array...
    if (typeof el.tags == "string") {
        // Parse only the part of the string that doesn't include bracket and double quote characters
        el.tags = el.tags.substring(2,el.tags.length-2);   
        // Strip out single quote characters around array values
        el.tags = el.tags.replace(/[']/g, "");
        // Create the array by Splitting on comma-plus-space
        el.tags = el.tags.split(', ');

        // Save changes to the record
        db.recipes.save(el); 
    }
});
