function addItems() {
    var id, name, quantity, imageURL, popUp, popUpMessage;

    id = document.getElementById("itemID").value;
    name = document.getElementById("itemName").value;
    quantity = document.getElementById("itemQuantity").value;
    imageURL = document.getElementById("itemImage").value;
    popUp = document.getElementById("popUp");
    popUpMessage = document.getElementById("popUpMessage");
    itemImagePopUp = document.getElementById("itemImagePopUp");

    if (errorCheck(id, name, quantity, popUp, popUpMessage, itemImagePopUp)) {
      //SQL here to add stationary to database with provided input
      popUpMessage.innerHTML = "Succesfully Added " + quantity + " " + name + "(s) With the ID " + id;
      itemImagePopUp.src=imageURL;
      itemImagePopUp.style.display = "block";
      popUp.style.display = "block";
    }
}

function errorCheck(id, name, quantity, popUp, popUpMessage, itemImagePopUp) {
  if (/*SQL here to determine if the provided ID already exists*/false) {
    popUpMessage.innerHTML = "Error: An Item With The Given ID Already Exists";
    itemImagePopUp.style.display = "none";
    popUp.style.display = "block";
    return false;
  } else if ((id === "") || isNaN(id) || (id < 0.1) || (id - Math.floor(id) !== 0)) {
    popUpMessage.innerHTML = "Error: ID Must Be a Valid Positive Integer";
    itemImagePopUp.style.display = "none";
    popUp.style.display = "block";
    return false;
  } else if (name === "") {
    popUpMessage.innerHTML = "Error: Item Must Have a Name";
    itemImagePopUp.style.display = "none";
    popUp.style.display = "block";
    return false;
  } else if ((quantity === "") || isNaN(quantity) || (quantity < 0.1) || (quantity - Math.floor(quantity) !== 0)) {
    popUpMessage.innerHTML = "Error: Quantity Must Be a Valid Positive Integer";
    itemImagePopUp.style.display = "none";
    popUp.style.display = "block";
    return false;
  }
  return true;
}
