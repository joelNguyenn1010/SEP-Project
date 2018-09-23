function returnItem() {
    var id, popUp, popUpMessage;

    id = document.getElementById("itemID").value;
    popUp = document.getElementById("popUp");
    popUpMessage = document.getElementById("popUpMessage");

    if (errorCheck(id, popUp, popUpMessage)) {
      //SQL here to return stationary with given ID in the database
      popUpMessage.innerHTML = "Succesfully Returned Item with the ID " + id;
      popUp.style.display = "block";
    }
}

function errorCheck(id, popUp, popUpMessage) {
  if (/*SQL here to determine if the provided ID was not borrowed*/false) {
    popUpMessage.innerHTML = "Error: An Item With The Given ID Could Not Be Found or Was Not Pending Return";
    popUp.style.display = "block";
    return false;
  }
  return true;
}
