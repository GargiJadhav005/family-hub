require("dotenv").config();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const { User } = require("../models/User");
const { Student } = require("../models/Student");

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";

async function hash(pw) {
  return bcryptjs.hash(pw, 10);
}

// Helper: Generate username from name
async function generateUsername(name) {
  const parts = name.toLowerCase().trim().split(/\s+/);
  let baseUsername = parts.length >= 2 
    ? `${parts[0]}.${parts[parts.length - 1]}`
    : parts[0];
  baseUsername = baseUsername.replace(/[^a-z0-9.]/g, '');
  
  let username = baseUsername;
  let counter = 1;
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  return username;
}

const TEACHER_DATA = {
  name: "व्ही. व्ही. चिपळूणकर",
  email: "vv.chiplunkar@vainateya.edu",
  password: "Teacher@2025",
  className: "इयत्ता १-ब",
  schoolId: "vainateya_nashik_001",
};

const STUDENTS_DATA = [
  { name: "आरी कैलास हेम्सध्योने", roll: "01", caste: "SC", category: "Ǒह. चांभार" },
  { name: "मेधा केशव चाहण", roll: "02", caste: "SC", category: "Ǒह. चांभार" },
  { name: "सᴘिश्रा विनोद निकाळे", roll: "03", caste: "SC", category: "Ǒह. महार" },
  { name: "सा⁇दा धनंजय आंबेकर", roll: "04", caste: "ST", category: "Ǒह. भिल्ल" },
  { name: "श्रावी विनोद घटमाळे", roll: "05", caste: "NT", category: "Ǒह. भोई" },
  { name: "मानवी किशोर जावरे", roll: "06", caste: "NT", category: "Ǒह. भोई" },
  { name: "पायल विजय मोरे", roll: "07", caste: "NT", category: "Ǒह. भोई" },
  { name: "तपस्वी गोकुळ ढेपले", roll: "08", caste: "NT", category: "Ǒह. धनगर" },
  { name: "ईश्वरी सोमनाथ नागरे", roll: "09", caste: "NT", category: "Ǒह. वंजारी" },
  { name: "सेजल सागर शिंदे", roll: "10", caste: "OBC", category: "Ǒह. फुलमाळी" },
  { name: "कस्तुरी मनोज जैतमाल", roll: "11", caste: "OBC", category: "Ǒह. सुतार" },
  { name: "आराध्या निर्मित दुसाने", roll: "12", caste: "OBC", category: "Ǒह. सोनार" },
  { name: "वैभवी हेमराज भामरे", roll: "13", caste: "OBC", category: "Ǒह. कुणबी" },
  { name: "सुप्रिया दिनेश धारराव", roll: "14", caste: "OBC", category: "Ǒह. कुणबी" },
  { name: "अदिती निलेश उगले", roll: "15", caste: "NBC", category: "Ǒह.मराठा" },
  { name: "स्वरा नवनाथ नवले", roll: "16", caste: "NBC", category: "Ǒह.मराठा" },
  { name: "तेजस्वी अर्जुन कापसे", roll: "17", caste: "NBC", category: "Ǒह.मराठा" },
  { name: "स्वरा विजय काळे", roll: "18", caste: "NBC", category: "Ǒह.मराठा" },
  { name: "धनश्री सुनील वडघुले", roll: "19", caste: "OBC", category: "Ǒह.कुणबी" },
  { name: "काव्या प्रवीण कापसे", roll: "20", caste: "NBC", category: "Ǒह.मराठा" },
];

async function seedRealData() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "family_hub" });
    console.log("✅ Connected to MongoDB\n");

    const existingTeacher = await User.findOne({ email: TEACHER_DATA.email });
    if (existingTeacher) {
      console.log("ℹ️  Teacher already exists. Cleaning and re-creating...");
      
      const studentsToDelete = await User.find({
        $or: [
          { email: { $regex: "@vainateya.edu$" }, role: { $in: ["student", "parent"] } },
        ],
      });

      console.log(`   Deleting ${studentsToDelete.length} old student/parent accounts...`);
      for (const user of studentsToDelete) {
        await User.deleteOne({ _id: user._id });
      }

      const deletedDocs = await Student.deleteMany({});
      console.log(`   Deleted ${deletedDocs.deletedCount} student documents`);

      await User.deleteOne({ _id: existingTeacher._id });
      console.log(`   Deleted old teacher account\n`);
    }

    console.log("📚 Creating Teacher Account...");
    const teacherPassword = TEACHER_DATA.password;
    const teacherPasswordHash = await hash(teacherPassword);
    const teacherUsername = await generateUsername(TEACHER_DATA.name);

    const teacher = await User.create({
      name: TEACHER_DATA.name,
      username: teacherUsername,
      email: TEACHER_DATA.email,
      passwordHash: teacherPasswordHash,
      role: "teacher",
      meta: {
        schoolId: TEACHER_DATA.schoolId,
        class: TEACHER_DATA.className,
        school: "वैनतेय प्राथमिक विद्या मंदिर",
        schoolLocation: "निफाड, ता. निफाड, िज. नािशक",
        schoolCode: "शिक्षक प्राथ./8/924",
      },
      isActive: true,
    });

    console.log(`✅ Teacher Created!`);
    console.log(`   Name: ${TEACHER_DATA.name}`);
    console.log(`   Username: ${teacherUsername}`);
    console.log(`   Email: ${TEACHER_DATA.email}`);
    console.log(`   Password: ${TEACHER_DATA.password}`);
    console.log(`   Class: ${TEACHER_DATA.className}\n`);

    console.log(`📝 Creating ${STUDENTS_DATA.length} Students...\n`);
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < STUDENTS_DATA.length; i++) {
      try {
        const studentData = STUDENTS_DATA[i];
        const studentEmail = `${studentData.name.toLowerCase().replace(/\s/g, ".")}@vainateya.edu`;
        const studentPassword = "Student@2025";
        const studentHash = await hash(studentPassword);
        const studentUsername = await generateUsername(studentData.name);

        const studentUser = new User({
          name: studentData.name,
          username: studentUsername,
          email: studentEmail,
          passwordHash: studentHash,
          role: "student",
          meta: new Map([
            ["class", TEACHER_DATA.className],
            ["roll", studentData.roll],
          ]),
        });

        await studentUser.save();

        const student = new Student({
          name: studentData.name,
          roll: studentData.roll,
          className: TEACHER_DATA.className,
          studentUserId: studentUser._id,
          createdByTeacherId: teacher._id,
          caste: studentData.caste,
          category: studentData.category,
        });

        await student.save();
        successCount++;
        
        if ((i + 1) % 5 === 0) {
          console.log(`   ✓ Created ${i + 1}/${STUDENTS_DATA.length} students`);
        }
      } catch (err) {
        errorCount++;
        console.warn(`   ⚠️  Error creating student ${i + 1}: ${err.message}`);
      }
    }

    console.log(`\n✅ Seed Complete!`);
    console.log(`   Total: ${successCount} students created, ${errorCount} errors`);
    console.log(`   Teacher Username: ${teacherUsername}`);
    console.log(`   Teacher Password: ${TEACHER_DATA.password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedRealData();

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < STUDENTS_DATA.length; i++) {
      try {
        const studentData = STUDENTS_DATA[i];
        const studentEmail = `${studentData.name.toLowerCase().replace(/\s/g, ".")}@vainateya.edu`;
        const studentPassword = "Student@2025";
        const studentHash = await hash(studentPassword);

        const studentUser = new User({
          name: studentData.name,
          email: studentEmail,
          passwordHash: studentHash,
          role: "student",
          meta: new Map([
            ["class", TEACHER_DATA.className],
            ["roll", studentData.roll],
          ]),
        });

        await studentUser.save();

        const student = new Student({
          name: studentData.name,
          roll: studentData.roll,
          className: TEACHER_DATA.className,
          studentUserId: studentUser._id,
          createdByTeacherId: teacher._id,
          caste: studentData.caste,
          category: studentData.category,
        });

        await student.save();
        successCount++;
        
        if ((i + 1) % 5 === 0) {
          console.log(`   ✓ Created ${i + 1}/${STUDENTS_DATA.length} students`);
        }
      } catch (err) {
        errorCount++;
        console.warn(`   ⚠️  Error creating student ${i + 1}: ${err.message}`);
      }
    }

    console.log(`\n✅ Seed Complete!`);
    console.log(`   Total: ${successCount} students created, ${errorCount} errors`);
    console.log(`   Teacher Email: ${TEACHER_DATA.email}`);
    console.log(`   Teacher Password: ${TEACHER_DATA.password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedRealData();
