// One-time script to create a teacher user in MongoDB
// Usage: node create-teacher.cjs
// Make sure to replace <db_password> with your real password.

/* eslint-disable @typescript-eslint/no-var-requires */
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');

// IMPORTANT: replace <db_password> with your actual DB user password
const uri =
  'mongodb+srv://gargijadhav005_db_user:<db_password>@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db('family_hub'); // same as MONGODB_DB_NAME

    const email = 'jayshrishirsath80@gmail.com';
    const plainPassword = 'Jayu@123';

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const users = db.collection('users');

    // If a user with this email already exists, update them instead of inserting a duplicate
    const existing = await users.findOne({ email });
    if (existing) {
      await users.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: existing.name || 'Jayashri Shirsath',
            passwordHash,
            role: 'teacher',
            meta: existing.meta || {
              class: 'इयत्ता ४-ब',
              subject: 'वर्गशिक्षक',
            },
          },
        }
      );
      console.log('Updated existing teacher user with email:', email);
    } else {
      const userDoc = {
        name: 'Jayashri Shirsath',
        email,
        passwordHash,
        role: 'teacher',
        avatar: null,
        meta: {
          class: 'इयत्ता ४-ब',
          subject: 'वर्गशिक्षक',
        },
      };

      const result = await users.insertOne(userDoc);
      console.log('Teacher user created with _id:', result.insertedId);
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error creating teacher user:', err);
  } finally {
    await client.close();
  }
}

run().catch(console.error);

