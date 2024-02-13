function deleteFlag(flagID) {
    let data = {
      id: flagID
    };
  
// Setting up AJAX request
var xhttp = new XMLHttpRequest();
xhttp.open("DELETE", "/delete-flag-ajax", true);
xhttp.setRequestHeader("Content-type", "application/json");

// Tell our AJAX request how to resolve
xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 204) {

        // Add the new data to the table
        deleteRow(flagID);

    }
    else if (xhttp.readyState == 4 && xhttp.status != 204) {
        console.log("There was an error with the input.")
    }
}
// Send the request and wait for the response
xhttp.send(JSON.stringify(data));
}

  
  function deleteRow(flagID){
      let table = document.getElementById("flags-table");
      for (let i = 0, row; row = table.rows[i]; i++) {
         if (table.rows[i].getAttribute("data-value") == flagID) {
              table.deleteRow(i);
              break;
         }
      }
  }
  
  