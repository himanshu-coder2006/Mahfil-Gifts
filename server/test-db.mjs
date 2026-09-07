import mongoose from 'mongoose';
const uri = 'mongodb://himuuu:Mahfil2024@ac-thckz7t-shard-00-00.my3xyc4.mongodb.net:27017/mahfilgifts?ssl=true&authSource=admin&directConnection=true';
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 });
  console.log('CONNECTED OK');
  process.exit(0);
} catch (e) {
  console.error('FAIL:', e.message);
  process.exit(1);
}
