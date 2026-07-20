db = db.getSiblingDB('iep');
var result = db.users.updateMany(
  {},
  { $set: { role: "admin" } }
);
printjson(result);
