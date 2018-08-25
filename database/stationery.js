module.exports = class StationerySQL {
  constructor(id, name, availability, quality, quantity, purchase_date ,description, type_id, picture) {
    this.id = id;
    this.name = name;
    this.availability = availability;
    this.quality = quality;
    this.quantity = quantity;
    this.purchase_date = purchase_date;
    this.description = description;
    this.type_id = type_id;
    this.picture = picture;
}

  returnAll() {
    return this.id + " " + this.name + " " + this.quality + " " + this.quantity + " " + this.description + " " + this.type_id + " " + this.picture;
  }
}
