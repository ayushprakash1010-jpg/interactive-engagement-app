const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/iep');
  await mongoose.connection.db.collection('feature_flags').updateOne(
    { key: 'AI Studio' },
    { $set: { key: 'ai-studio', name: 'AI Studio' } }
  );
  console.log('Fixed DB');
  process.exit(0);
}
run();
