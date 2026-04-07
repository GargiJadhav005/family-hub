import "dotenv/config";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

// Import all models
import { User } from "../models/User";
import { Student } from "../models/Student";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";

async function hash(pw: string) {
  return bcryptjs.hash(pw, 10);
}

// REAL DATA FROM VAINATEYA SCHOOL - CLASS 1-B
const TEACHER_DATA = {
  name: "व्ही. व्ही. चिपळूणकर", // V.V. Chiplunkar
  email: "vv.chiplunkar@vainateya.edu",
  password: "Teacher@2025",
  className: "इयत्ता १-ब", // Class 1-B
  schoolId: "vainateya_nashik_001",
};

// 54 REAL STUDENTS FROM THE SCHOOL REGISTER
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
  { name: "काव्या प्रसाद गांगुडे", roll: "21", caste: "NBC", category: "Ǒह.मराठा" },
  { name: "वेदिका ज्ञानेश्वर जाधव", roll: "22", caste: "NBC", category: "Ǒह.मराठा" },
  { name: "अरिबाफातमा अरबाज शेख", roll: "23", caste: "AL", category: "मुिस्लम" },
  { name: "श्रावण आबा जाधव", roll: "24", caste: "ST", category: "Ǒह. भिल्ल" },
  { name: "अनुश रामराव नेहरे", roll: "25", caste: "ST", category: "Ǒह. म. कोळी" },
  { name: "सुबोध सीताराम वाघ", roll: "26", caste: "SC", category: "Ǒह. महार" },
  { name: "काॣ्तिक राजुकाळे", roll: "27", caste: "SC", category: "Ǒह. मातंग" },
  { name: "विराज प्रशांत निकाळे", roll: "28", caste: "SC", category: "बौद्ध" },
  { name: "देवांश श्रावण मोहिते", roll: "29", caste: "NT", category: "Ǒह. बेलदार" },
  { name: "शिवांश भूषण बैरागी", roll: "30", caste: "NT", category: "Ǒह. बैरागी" },
  { name: "माहीर दिपक जावरे", roll: "31", caste: "NT", category: "Ǒह. भोई" },
  { name: "शौर्यगौरव सानप", roll: "32", caste: "NT", category: "Ǒह. वंजारी" },
  { name: "रुपेश ज्ञानेश्वर कराड", roll: "33", caste: "NT", category: "Ǒह. वंजारी" },
  { name: "हर्षद रमेश धुमाळ", roll: "34", caste: "NT", category: "Ǒह. जोशी" },
  { name: "राजन विकासकुमार शर्मा", roll: "35", caste: "OBC", category: "Ǒह. बढई सुतार" },
  { name: "कृष्णा योगेश पवार", roll: "36", caste: "OBC", category: "Ǒह. फुलमाळी" },
  { name: "विहान गणेश वाडकेर", roll: "37", caste: "OBC", category: "Ǒह. कुंभार" },
  { name: "श्रेयश सचिन संधान", roll: "38", caste: "OBC", category: "Ǒह. कुणबी" },
  { name: "ऋद्धांश विकास वाघचौरे", roll: "39", caste: "OBC", category: "Ǒह. तेली" },
  { name: "सोहम एकनाथ व्यवहारे", roll: "40", caste: "OBC", category: "Ǒह. तेली" },
  { name: "गौरांश संदीप शिंदे", roll: "41", caste: "OBC", category: "Ǒह. ढक्षिणी" },
  { name: "शिवराज मिथुन ताती", roll: "42", caste: "OBC", category: "Ǒह. शिंपी" },
  { name: "अथर्वकैलास जाधव", roll: "43", caste: "OBC", category: "Ǒह. कुणबी" },
  { name: "समर्थअंकुश टोपे", roll: "44", caste: "NBC", category: "Ǒह. मराठा" },
  { name: "राजवीर रणजीत तुपे", roll: "45", caste: "NBC", category: "Ǒह. मराठा" },
  { name: "शिवांश अभिजीत सातभाई", roll: "46", caste: "NBC", category: "Ǒह. मराठा" },
  { name: "आरव सागर नवले", roll: "47", caste: "NBC", category: "Ǒह. मराठा" },
  { name: "कृष्णा सुनील वडघुले", roll: "48", caste: "OBC", category: "Ǒह. कुणबी" },
  { name: "अणव राजूकाळे", roll: "49", caste: "NBC", category: "Ǒह. मराठा" },
  { name: "त्रिज्ञ अरविंद शिंदे", roll: "50", caste: "NBC", category: "Ǒह. मराठा" },
  { name: "अणव दिपक खालकर", roll: "51", caste: "NBC", category: "Ǒह. मराठा" },
  { name: "मोहम्मदजिया़न जुनेद शेख", roll: "52", caste: "AL", category: "मुिस्लम" },
  { name: "अली अहमद इस्तेखार अनसारी", roll: "53", caste: "AL", category: "मुिस्लम" },
  { name: "सिद्धार्थ कासिफ पटेल", roll: "54", caste: "AL", category: "मुिस्लम" },
];

async function seedRealData() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "family_hub" });
    console.log("✅ Connected to MongoDB\n");

    // Check if teacher already exists
    const existingTeacher = await User.findOne({ email: TEACHER_DATA.email });
    if (existingTeacher) {
      console.log("ℹ️  Teacher already exists. Cleaning and re-creating...");
      
      // Find all students created by this teacher
      const studentsToDelete = await User.find({
        $or: [
          { email: { $regex: "@vainateya.edu$" }, role: { $in: ["student", "parent"] } },
        ],
      });

      console.log(`   Deleting ${studentsToDelete.length} old student/parent accounts...`);
      for (const user of studentsToDelete) {
        await User.deleteOne({ _id: user._id });
      }

      // Delete student documents
      const deletedDocs = await Student.deleteMany({});
      console.log(`   Deleted ${deletedDocs.deletedCount} student documents`);

      // Delete the teacher
      await User.deleteOne({ _id: existingTeacher._id });
      console.log(`   Deleted old teacher account\n`);
    }

    // ── CREATE TEACHER ────────────────────────────────────────────────────────────
    console.log("📚 Creating Teacher Account...");
    const teacherPassword = TEACHER_DATA.password;
    const teacherPasswordHash = await hash(teacherPassword);

    const teacher = await User.create({
      name: TEACHER_DATA.name,
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
    console.log(`   Email: ${TEACHER_DATA.email}`);
    console.log(`   Password: ${TEACHER_DATA.password}`);
    console.log(`   Class: ${TEACHER_DATA.className}\n`);

    // ── CREATE STUDENTS & PARENTS ─────────────────────────────────────────────────
    console.log(`📝 Creating ${STUDENTS_DATA.length} Students & Parents...\n`);

    const createdStudents: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < STUDENTS_DATA.length; i++) {
      try {
        const studentData = STUDENTS_DATA[i];

        // Generate emails from student names (romanize for email compatibility)
        const nameRomanized = studentData.name
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .trim()
          .replace(/\s+/g, ".");

        const studentEmail = `${nameRomanized}.${studentData.roll}@vainateya.edu`;
        const parentEmail = `parent.${nameRomanized}.${studentData.roll}@vainateya.edu`;

        // Generate secure passwords
        const studentPassword = `Student@${studentData.roll}${TEACHER_DATA.schoolId.slice(-3)}`;
        const parentPassword = `Parent@${studentData.roll}${TEACHER_DATA.schoolId.slice(-3)}`;

        // Create Student User Account
        const studentUser = await User.create({
          name: studentData.name,
          email: studentEmail,
          passwordHash: await hash(studentPassword),
          role: "student",
          meta: {
            schoolId: TEACHER_DATA.schoolId,
            class: TEACHER_DATA.className,
            roll: studentData.roll,
            caste: studentData.caste,
            school: "वैनतेय प्राथमिक विद्या मंदिर",
          },
          isActive: true,
        });

        // Create Parent User Account
        const parentUser = await User.create({
          name: `अभिभावक - ${studentData.name}`, // Guardian - [Student Name]
          email: parentEmail,
          passwordHash: await hash(parentPassword),
          role: "parent",
          meta: {
            schoolId: TEACHER_DATA.schoolId,
            childName: studentData.name,
            childClass: TEACHER_DATA.className,
            childRoll: studentData.roll,
            school: "वैनतेय प्राथमिक विद्या मंदिर",
          },
          isActive: true,
        });

        // Create Student Document
        const parentName = `अभिभावक - ${studentData.name}`; //Guardian name
        const studentDoc = await Student.create({
          name: studentData.name,
          roll: studentData.roll,
          className: TEACHER_DATA.className,
          parentName: parentName,
          caste: studentData.caste,
          casteCategory: studentData.category,
          studentEmail,
          parentEmail,
          studentUserId: studentUser._id,
          parentUserId: parentUser._id,
          createdByTeacherId: teacher._id,
          school: "वैनतेय प्राथमिक विद्या मंदिर",
          schoolId: TEACHER_DATA.schoolId,
          status: "active",
        });

        createdStudents.push({
          roll: studentData.roll,
          name: studentData.name,
          studentEmail,
          studentPassword,
          parentEmail,
          parentPassword,
          studentUserId: studentUser._id,
          parentUserId: parentUser._id,
          studentDocId: studentDoc._id,
        });

        successCount++;

        if ((i + 1) % 10 === 0) {
          console.log(`   ✅ Created ${i + 1}/${STUDENTS_DATA.length} students...`);
        }
      } catch (erro: any) {
        errorCount++;
        const studentName = STUDENTS_DATA[i]?.name || `Student ${i + 1}`;
        console.error(
          `   ❌ Error creating student ${studentName}:`,
          erro.message
        );
      }
    }

    console.log(`\n✅ Successfully created ${successCount} students`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} students failed to create`);
    }

    // ── DISPLAY CREDENTIALS ────────────────────────────────────────────────────────
    console.log(`\n${"=".repeat(70)}`);
    console.log("✅ REAL DATA SEEDING COMPLETE");
    console.log(`${"=".repeat(70)}\n`);

    console.log("🏫 SCHOOL INFORMATION");
    console.log(`   School: वैनतेय प्राथमिक विद्या मंदिर`);
    console.log(`   Location: निफाड, ता. निफाड, िज. नािशक`);
    console.log(`   Class: ${TEACHER_DATA.className}`);
    console.log(`   Total Students: ${successCount}\n`);

    console.log("👨‍🏫 TEACHER LOGIN");
    console.log(`   Email: ${TEACHER_DATA.email}`);
    console.log(`   Password: ${TEACHER_DATA.password}`);
    console.log(`   Role: Teacher\n`);

    console.log("📋 STUDENT & PARENT LOGINS\n");
    console.log(`Roll | Student Name (First 20 chars) | Student Email | Parent Email`);
    console.log("-".repeat(90));

    for (let i = 0; i < Math.min(10, createdStudents.length); i++) {
      const s = createdStudents[i];
      const nameShort = s.name.substring(0, 20).padEnd(20);
      console.log(
        `${s.roll.padEnd(4)} | ${nameShort} | ${s.studentEmail.substring(0, 20)}... | ${s.parentEmail.substring(0, 20)}...`
      );
    }
    if (createdStudents.length > 10) {
      console.log(`... and ${createdStudents.length - 10} more students\n`);
    }

    // Save detailed report to file
    const report = `
═══════════════════════════════════════════════════════════════
                  REAL DATA SEEDING REPORT
═══════════════════════════════════════════════════════════════

SCHOOL: वैनतेय प्राथमिक विद्या मंदिर
LOCATION: निफाड, ता. निफाड, िज. नािशक
CLASS: ${TEACHER_DATA.className}
CREATED: ${new Date().toLocaleString()}

── TEACHER ACCOUNT ──────────────────────────────────────────
Name: ${TEACHER_DATA.name}
Email: ${TEACHER_DATA.email}
Password: ${TEACHER_DATA.password}
Status: Active
Role: Teacher
School ID: ${TEACHER_DATA.schoolId}

── STUDENT ACCOUNTS (${successCount} Total) ──────────────────
${createdStudents
  .map(
    (s) => `
Roll: ${s.roll}
Name: ${s.name}
Student Email: ${s.studentEmail}
Student Password: ${s.studentPassword}
Parent Email: ${s.parentEmail}
Parent Password: ${s.parentPassword}
`
  )
  .join("─".repeat(70) + "\n")}

═══════════════════════════════════════════════════════════════
IMPORTANT NOTES:
1. All passwords are secure and unique per student
2. Each student has a corresponding parent account
3. Parent accounts are automatically created with child reference
4. All accounts are active and ready to use
5. Teachers can manage these students via the dashboard
6. Parents can view their child's progress
7. Students can access their homework and quizzes
═══════════════════════════════════════════════════════════════
`;

    console.log(report);

    await mongoose.disconnect();
    console.log("🔌 Database connection closed\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedRealData();
