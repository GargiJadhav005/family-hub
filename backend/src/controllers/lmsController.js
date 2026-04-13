const { Course } = require("../models/Course");
const { getMetaValue } = require("../utils/auth");
const { Student } = require("../models");

const DEFAULT_COURSES = [
  { title: 'अपूर्णांकांची ओळख', subject: 'गणित • घटक ४', progress: 65, color: 'bg-primary' },
  { title: 'वनस्पती आणि प्रकाशसंश्लेषण', subject: 'विज्ञान • घटक २', progress: 20, color: 'bg-success' },
  { title: 'प्राचीन संस्कृती', subject: 'इतिहास • घटक १', progress: 90, color: 'bg-foreground' },
];

async function getCourses(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    let query = {};

    if (req.user.role === "teacher") {
      const cls = getMetaValue(req.user.meta, "class");
      if (cls) query.className = cls;
      query.teacherId = req.user._id;
    } else if (req.user.role === "student") {
      const cls = getMetaValue(req.user.meta, "class");
      if (cls) query.className = cls;
    } else if (req.user.role === "parent") {
      const children = await Student.find({ parentUserId: req.user._id }).select("className").lean();
      const classes = [...new Set(children.map((c) => c.className))];
      if (classes.length === 0) {
        return res.json({ courses: [], materials: [] });
      }
      query.className = { $in: classes };
    }

    let courses = await Course.find(query).lean();

    if (courses.length === 0 && req.user.role === "teacher") {
      const className = getMetaValue(req.user.meta, "class") || "General";
      const defaults = DEFAULT_COURSES.map(c => ({
        ...c,
        className,
        teacherId: req.user._id,
        materials: [],
      }));
      await Course.insertMany(defaults);
      courses = await Course.find(query).lean();
    }

    res.json({ courses, materials: [] });
  } catch (error) {
    console.error("getCourses error:", error);
    res.status(500).json({ error: "Failed to fetch courses", details: process.env.NODE_ENV === 'development' ? error?.message : undefined });
  }
}

module.exports = {
  getCourses,
};
