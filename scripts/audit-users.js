const { MongoClient } = require('mongodb');

async function audit() {
  const client = new MongoClient('mongodb://localhost:27017/iep');
  await client.connect();
  const db = client.db('iep');
  const users = await db.collection('users').find({}).toArray();
  
  console.log(`Total users: ${users.length}`);
  const fallbackUsers = users.filter(u => u.email && u.email.endsWith('@users.noreply.iep'));
  console.log(`Fallback users: ${fallbackUsers.length}`);
  
  console.log('\n--- Duplicate Analysis by auth0Sub ---');
  const subMap = {};
  users.forEach(u => {
    if (!subMap[u.auth0Sub]) subMap[u.auth0Sub] = [];
    subMap[u.auth0Sub].push(u);
  });
  
  let duplicateCount = 0;
  for (const [sub, duplicates] of Object.entries(subMap)) {
    if (duplicates.length > 1) {
      duplicateCount++;
      console.log(`\nDuplicate auth0Sub found: ${sub}`);
      duplicates.forEach(d => {
        console.log(`  - _id: ${d._id}, email: ${d.email}, name: ${d.name}`);
      });
    }
  }
  if (duplicateCount === 0) console.log('No duplicates by auth0Sub found.');
  
  console.log('\n--- Duplicate Analysis by Email (excluding fallbacks) ---');
  const emailMap = {};
  users.filter(u => !u.email.endsWith('@users.noreply.iep')).forEach(u => {
    const e = u.email.toLowerCase();
    if (!emailMap[e]) emailMap[e] = [];
    emailMap[e].push(u);
  });
  
  let emailDuplicateCount = 0;
  for (const [email, duplicates] of Object.entries(emailMap)) {
    if (duplicates.length > 1) {
      emailDuplicateCount++;
      console.log(`\nDuplicate email found: ${email}`);
      duplicates.forEach(d => {
        console.log(`  - _id: ${d._id}, auth0Sub: ${d.auth0Sub}, name: ${d.name}`);
      });
    }
  }
  if (emailDuplicateCount === 0) console.log('No duplicates by email found.');

  client.close();
}

audit().catch(console.error);
