function removeItem() {
    var id, popUp, popUpMessage;

    id = document.getElementById("itemID").value;
    popUp = document.getElementById("popUp");
    popUpMessage = document.getElementById("popUpMessage");

    if (errorCheck(id, popUp, popUpMessage)) {
      //SQL here to remove stationary with given ID from the database
      popUpMessage.innerHTML = "Succesfully Removed Item with the ID " + id;
      popUp.style.display = "block";
    }
}

function errorCheck(id, popUp, popUpMessage) {
  if (/*SQL here to determine if the provided ID does not already exists*/false) {
    popUpMessage.innerHTML = "Error: An Item With The Given ID Could Not Be Found";
    popUp.style.display = "block";
    return false;
  }
  return true;
}
