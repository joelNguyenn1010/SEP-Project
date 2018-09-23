function confirmBorrow() {
    var popUp, popUpMessage, userID, itemIDArray;

    //user ID as tapped in
    //array of all IDs of scanned in items
    popUp = document.getElementById("popUp");
    popUpMessage = document.getElementById("popUpMessage");

    if (errorCheck(id, popUp, popUpMessage)) {
      //SQL here to borrow stationary with given ID in the database to the UserID
      popUpMessage.innerHTML = "Succesfully Borrowed Items with the ID " + id/*Array of borrowed items ID here*/;
      popUp.style.display = "block";
    }
}

function errorCheck(id, popUp, popUpMessage) {
  if (/*SQL here to determine if any of the itemID's are not valid to be borrowed*/false) {
    popUpMessage.innerHTML = "Error: A Scanned Item Could Not Be Borrowed. Please Try Again";
    popUp.style.display = "block";
    return false;
  }
  return true;
}
