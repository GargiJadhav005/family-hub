import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Student } from "../models/Student";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";

async function cleanOldDataAndReseed() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "family_hub" });
    console.log("✅ Connected to MongoDB\n");

    console.log("🗑️  Cleaning old demo/test data...");

    // Get the vainateya teacher
    const vainateyaTeacher = await User.findOne({
      email: "vv.chiplunkar@vainateya.edu",
    });

    if (vainateyaTeacher) {
      // Find all students created by this teacher or old demo students
      const studentsToDelete = await User.find({
        $or: [
          { email: { $in: ["student1@school.edu", "parent@school.edu", "parent1@school.edu", "student2@school.edu", "parent2@school.edu", "student3@school.edu", "parent3@school.edu"] } },
          { email: { $regex: "@vainateya.edu$" }, role: { $in: ["student", "parent"] } },
        ],
      });

      console.log(`Found ${studentsToDelete.length} user accounts to clean up`);

      for (const user of studentsToDelete) {
        await User.deleteOne({ _id: user._id });
      }

      // Also delete the vainateya teacher
      await User.deleteOne({ _id: vainateyaTeacher._id });
      console.log(`Deleted teacher: ${vainateyaTeacher.name}`);
    }

    console.log("✅ Cleanup complete\n");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

cleanOldDataAndReseed();
