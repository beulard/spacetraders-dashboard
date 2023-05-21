const loki = require("lokijs");

const db = new loki("spacetrader.db");

console.log(db.listCollections());

const systems = db.getCollection("systems");

console.log(systems.find({ symbol: "X1-JK50" }));
