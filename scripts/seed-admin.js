db = db.getSiblingDB('iep');

var adminEmail = process.env.ADMIN_EMAIL;

if (!adminEmail) {
  print("ERROR: ADMIN_EMAIL environment variable is required.");
  print("Usage: ADMIN_EMAIL=user@example.com mongosh < scripts/seed-admin.js");
  quit(1);
}

print("Looking up user with email: " + adminEmail);
var existingUser = db.users.findOne({ email: adminEmail });

if (!existingUser) {
  print("ERROR: No user found with email " + adminEmail + ". Please log in first to synchronize the user profile.");
  quit(1);
}

print("Upgrading " + adminEmail + " to admin...");
var upgradeResult = db.users.updateOne(
  { email: adminEmail },
  { $set: { role: "admin" } }
);

printjson(upgradeResult);

if (upgradeResult.matchedCount === 0) {
  print("ERROR: Failed to update user.");
  quit(1);
} else {
  print("Migration complete.");
}
