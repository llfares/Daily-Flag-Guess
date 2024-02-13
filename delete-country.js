function deleteCountry(countryID, countryName) {
    // Display a confirmation dialog
    const confirmation = confirm(`Are you sure you want to delete ${countryName} from the countries list?`);

    if (confirmation) {
        let data = {
            id: countryID
        };

        // Setting up AJAX request
        var xhttp = new XMLHttpRequest();
        xhttp.open("DELETE", "/delete-country-ajax", true);
        xhttp.setRequestHeader("Content-type", "application/json");

        // Tell AJAX request how to resolve
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 204) {

                // Add the new data to the table
                deleteRow(countryID);

            } else if (xhttp.readyState == 4 && xhttp.status != 204) {
                console.log("There was an error with the input.")
            }
        }

        // Send the request and wait for the response
        xhttp.send(JSON.stringify(data));
    }
}

function deleteRow(countryID) {
    let table = document.getElementById("countries-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
        if (table.rows[i].getAttribute("data-value") == countryID) {
            table.deleteRow(i);
            break;
        }
    }
}
