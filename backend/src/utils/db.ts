import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "family_hub";

  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName,
    });

    console.log("? Connected to MongoDB");
  } catch (err) {
    console.error("? Failed to connect to MongoDB:", err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("? Disconnected from MongoDB");
  } catch (err) {
    console.error("? Failed to disconnect from MongoDB:", err);
    throw err;
  }
}
