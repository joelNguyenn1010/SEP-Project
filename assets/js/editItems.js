function editItem() {
    var id, name, quantity, imageURL, popUp, popUpMessage;

    id = document.getElementById("itemID").value;
    name = document.getElementById("itemName").value;
    quantity = document.getElementById("itemQuantity").value;
    imageURL = document.getElementById("itemImage").value;
    popUp = document.getElementById("popUp");
    popUpMessage = document.getElementById("popUpMessage");
    itemImagePopUp = document.getElementById("itemImagePopUp");

    if (errorCheck(id, name, quantity, popUp, popUpMessage, itemImagePopUp)) {
      //SQL here to edit stationary with the given id in the database with provided input
      popUpMessage.innerHTML = "Succesfully Edited " + name + "(s). New ID " + id + ". New Quantity " + quantity;
      itemImagePopUp.src=imageURL;
      itemImagePopUp.style.display = "block";
      popUp.style.display = "block";
    }
}

function errorCheck(id, name, quantity, popUp, popUpMessage, itemImagePopUp) {
  if (/*SQL here to determine if the provided ID does not already exists*/false) {
    popUpMessage.innerHTML = "Error: An Item With The Given ID Could Not Be Found";
    popUp.style.display = "block";
    itemImagePopUp.style.display = "none";
    return false;
  } else if (id === "") {
    popUpMessage.innerHTML = "Error: You Must Provide an ID";
    popUp.style.display = "block";
    itemImagePopUp.style.display = "none";
    return false;
  } else if (name === "") {
    popUpMessage.innerHTML = "Error: Item Must Have a Name";
    popUp.style.display = "block";
    itemImagePopUp.style.display = "none";
    return false;
  } else if ((quantity === "") || isNaN(quantity) || (quantity < 0.1) || (quantity - Math.floor(quantity) !== 0)) {
    popUpMessage.innerHTML = "Error: Quantity Must Be a Valid Positive Integer";
    popUp.style.display = "block";
    itemImagePopUp.style.display = "none";
    return false;
  }
  return true;
}
