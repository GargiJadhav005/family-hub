import "dotenv/config";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

// Import all models
import { User } from "../models/User";
import { Student } from "../models/Student";
import { Homework } from "../models/Homework";
import { Score } from "../models/Score";
import { Event } from "../models/Event";
import { Meeting } from "../models/Meeting";
import { Instruction } from "../models/Instruction";
import { Quiz } from "../models/Quiz";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";

async function hash(pw: string) {
  return bcryptjs.hash(pw, 10);
}

async function seedAll() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "family_hub" });
    console.log("✅ Connected to MongoDB");

    // ── Clear old seed data ────────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({ "meta.seeded": "true" }),
      Student.deleteMany({}),
      Homework.deleteMany({}),
      Score.deleteMany({}),
      Event.deleteMany({}),
      Meeting.deleteMany({}),
      Instruction.deleteMany({}),
      Quiz.deleteMany({}),
    ]);
    console.log("🗑️  Cleared old seed data");

    // ── Teacher ────────────────────────────────────────────────────────────
    let teacher = await User.findOne({ email: "teacher@familyhub.com" });
    if (!teacher) {
      teacher = await User.create({
        name: "श्री. सचिन मोरे",
        email: "teacher@familyhub.com",
        passwordHash: await hash("Teacher123!"),
        role: "teacher",
        meta: { class: "इयत्ता ४-ब", subject: "वर्गशिक्षक", seeded: "true" },
        isActive: true,
      });
      console.log("👩‍🏫 Teacher created → teacher@familyhub.com / Teacher123!");
    } else {
      console.log("👩‍🏫 Teacher already exists");
    }

    // ── Students & Parents ─────────────────────────────────────────────────
    const studentsData = [
      { name: "आरव पाटील", parentName: "सौ. पाटील", roll: "01", className: "इयत्ता ४-ब" },
      { name: "लियो बेकर", parentName: "श्री. बेकर", roll: "02", className: "इयत्ता ४-ब" },
      { name: "मिया चेन", parentName: "सौ. चेन", roll: "03", className: "इयत्ता ४-ब" },
    ];

    const createdStudents: any[] = [];

    for (const sd of studentsData) {
      const base = sd.name.toLowerCase().replace(/\s+/g, ".").replace(/[^\w.]/g, "");
      const studentEmail = `${base}@school.edu`;
      const parentEmail = `parent.${base}@school.edu`;
      const studentPw = "Student123!";
      const parentPw = "Parent123!";

      const studentUser = await User.create({
        name: sd.name,
        email: studentEmail,
        passwordHash: await hash(studentPw),
        role: "student",
        meta: { class: sd.className, roll: sd.roll, seeded: "true" },
        isActive: true,
      });

      const parentUser = await User.create({
        name: sd.parentName,
        email: parentEmail,
        passwordHash: await hash(parentPw),
        role: "parent",
        meta: { child: sd.name, class: sd.className, seeded: "true" },
        isActive: true,
      });

      const s = await Student.create({
        name: sd.name,
        roll: sd.roll,
        className: sd.className,
        parentName: sd.parentName,
        studentEmail,
        parentEmail,
        studentUserId: studentUser._id,
        parentUserId: parentUser._id,
        createdByTeacherId: teacher!._id,
      });

      createdStudents.push({ student: s, studentUser, parentUser, studentEmail, parentEmail, studentPw, parentPw });
      console.log(`  🎒 Student: ${sd.name} | ${studentEmail} / ${studentPw}`);
      console.log(`  👨‍👩‍👦 Parent:  ${sd.parentName} | ${parentEmail} / ${parentPw}`);
    }

    const firstStudent = createdStudents[0];

    // ── Homework ───────────────────────────────────────────────────────────
    const homeworkItems = await Homework.insertMany([
      {
        subject: "गणित",
        title: "अपूर्णांक वर्कशीट",
        description: "पाठ्यपुस्तकातील पृष्ठ ४५ ते ४७ पूर्ण करा",
        dueDate: new Date(Date.now() + 1 * 86400000),
        createdByTeacherId: teacher!._id,
      },
      {
        subject: "मराठी",
        title: "निबंध लेखन",
        description: "माझा आवडता सण या विषयावर निबंध लिहा",
        dueDate: new Date(Date.now() + 3 * 86400000),
        createdByTeacherId: teacher!._id,
      },
      {
        subject: "विज्ञान",
        title: "प्रयोगाचा अहवाल",
        description: "आज केलेल्या प्रयोगाचा अहवाल तयार करा",
        dueDate: new Date(Date.now() + 5 * 86400000),
        createdByTeacherId: teacher!._id,
      },
    ]);
    console.log(`📚 ${homeworkItems.length} homework items created`);

    // ── Scores ─────────────────────────────────────────────────────────────
    await Score.insertMany([
      { studentId: firstStudent.student._id, subject: "गणित", testName: "घटक चाचणी ३", scorePercent: 85, grade: "A", date: new Date() },
      { studentId: firstStudent.student._id, subject: "मराठी", testName: "साप्ताहिक चाचणी", scorePercent: 92, grade: "A+", date: new Date() },
      { studentId: firstStudent.student._id, subject: "विज्ञान", testName: "प्रकल्प मूल्यांकन", scorePercent: 78, grade: "B+", date: new Date() },
    ]);
    console.log("📊 Scores seeded for first student");

    // ── Events & Notices ───────────────────────────────────────────────────
    await Event.insertMany([
      {
        title: "वार्षिक विज्ञान प्रदर्शन नोंदणी",
        description: "इयत्ता ३री आणि ४थी च्या विद्यार्थ्यांसाठी नोंदणी सुरू.",
        date: new Date(Date.now() + 20 * 86400000),
        type: "notice",
        icon: "🔬",
        targetAudience: "all",
        createdByTeacherId: teacher!._id,
      },
      {
        title: "गणवेश अपडेट: हिवाळी हंगाम",
        description: "येत्या सोमवारपासून हिवाळी गणवेश अनिवार्य आहे.",
        date: new Date(Date.now() + 3 * 86400000),
        type: "notice",
        icon: "👔",
        targetAudience: "all",
        createdByTeacherId: teacher!._id,
      },
      {
        title: "वार्षिक क्रीडा दिवस",
        description: "सर्व विद्यार्थ्यांनी सहभागी व्हावे",
        date: new Date(Date.now() + 15 * 86400000),
        type: "event",
        icon: "🏆",
        targetAudience: "all",
        createdByTeacherId: teacher!._id,
      },
      {
        title: "बालदिन कार्यक्रम",
        description: "शाळेत विशेष कार्यक्रम आयोजित केला जाईल",
        date: new Date(Date.now() + 14 * 86400000),
        type: "event",
        icon: "🎉",
        targetAudience: "all",
        createdByTeacherId: teacher!._id,
      },
    ]);
    console.log("📢 Events & notices seeded");

    // ── Meetings ───────────────────────────────────────────────────────────
    await Meeting.insertMany([
      {
        teacherId: teacher!._id,
        teacherName: "श्री. सचिन मोरे",
        parentId: firstStudent.parentUser._id,
        studentId: firstStudent.student._id,
        studentName: firstStudent.student.name,
        date: new Date(Date.now() + 7 * 86400000),
        timeLabel: "3:30 PM - 4:00 PM",
        mode: "प्रत्यक्ष",
        status: "नियोजित",
      },
    ]);
    console.log("📅 Meeting seeded");

    // ── Instructions ───────────────────────────────────────────────────────
    await Instruction.insertMany([
      {
        teacherId: teacher!._id,
        teacherName: "श्री. सचिन मोरे",
        studentId: firstStudent.student._id,
        message: "कृपया आरवला दररोज गणिताच्या गुणाकार सारणीचा सराव करवा. ७ आणि ८ च्या सारण्या कमकुवत आहेत.",
      },
      {
        teacherId: teacher!._id,
        teacherName: "श्री. सचिन मोरे",
        studentId: firstStudent.student._id,
        message: "आरवने आज विज्ञानाच्या प्रयोगात खूप छान सादरीकरण केले. शुद्धलेखनाचा सराव करणे आवश्यक आहे.",
      },
    ]);
    console.log("💬 Instructions seeded");

    // ── Quizzes ────────────────────────────────────────────────────────────
    await Quiz.create({
      title: "गणित क्विझ - अपूर्णांक",
      subject: "गणित",
      className: "इयत्ता ४-ब",
      icon: "📐",
      createdByTeacherId: teacher!._id,
      questions: [
        { question: "१/२ + १/२ = ?", options: ["१", "२", "१/४", "०"], correctIndex: 0 },
        { question: "३/४ चा दुप्पट किती?", options: ["३/२", "६/४", "दोन्ही बरोबर", "३/८"], correctIndex: 2 },
        { question: "२/५ + ३/५ = ?", options: ["५/५", "१", "दोन्ही बरोबर", "५/१०"], correctIndex: 2 },
      ],
    });
    console.log("🎮 Quiz seeded");

    console.log("\n═══════════════════════════════════════════════════");
    console.log("✅ SEED COMPLETE — Login Credentials");
    console.log("═══════════════════════════════════════════════════");
    console.log("TEACHER  → teacher@familyhub.com  / Teacher123!");
    for (const cs of createdStudents) {
      console.log(`STUDENT  → ${cs.studentEmail}  / ${cs.studentPw}`);
      console.log(`PARENT   → ${cs.parentEmail}  / ${cs.parentPw}`);
    }
    console.log("═══════════════════════════════════════════════════\n");

  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
    process.exit(0);
  }
}

seedAll();
