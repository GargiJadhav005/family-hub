const { Quiz, QuizResult, Student } = require("../models");
const { getMetaValue } = require("../utils/auth");

async function listQuizzes(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = req.user;
    let filter = {};
    const teacherClass = getMetaValue(user.meta, "class");

    if (user.role === "teacher") {
      filter.createdByTeacherId = user._id;
      if (teacherClass) {
        filter.className = teacherClass;
      } else if (req.query.className) {
        filter.className = req.query.className;
      }
    } else if (user.role === "student") {
      const studentDoc = await Student.findOne({ studentUserId: user._id }).select("className").lean();
      const cn = studentDoc?.className || getMetaValue(user.meta, "class");
      if (cn) filter.className = cn;
    } else if (user.role === "parent") {
      const children = await Student.find({ parentUserId: user._id }).select("className").lean();
      const classes = [...new Set(children.map((c) => c.className).filter(Boolean))];
      if (classes.length === 0) {
        return res.json({ quizzes: [] });
      }
      filter.className = { $in: classes };
    } else if (req.query.className) {
      filter.className = req.query.className;
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    console.error("GetQuizzes error:", err);
    res.status(500).json({ 
      error: "Failed to fetch quizzes",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function createQuiz(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { title, subject, className, icon, dueDate, questions } = req.body;

    const teacherClass = getMetaValue(req.user.meta, "class");
    const finalClassName = teacherClass || className;
    if (teacherClass && className !== teacherClass) {
      return res.status(403).json({ error: "Quizzes can only be created for your assigned class" });
    }

    if (!title || !subject || !finalClassName || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const quiz = await Quiz.create({
      title,
      subject,
      className: finalClassName,
      icon,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      questions,
      createdByTeacherId: req.user._id,
    });
    res.status(201).json({ quiz });
  } catch (err) {
    console.error("createQuiz error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getQuiz(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    const isTeacher = req.user.role === "teacher";
    if (!isTeacher) {
      const studentDoc = await Student.findOne({ studentUserId: req.user._id }).select("className").lean();
      const parentChild = req.user.role === "parent"
        ? await Student.findOne({ parentUserId: req.user._id, className: quiz.className }).select("_id").lean()
        : null;
      const allowed =
        (req.user.role === "student" && studentDoc?.className === quiz.className) ||
        (req.user.role === "parent" && parentChild);
      if (!allowed) {
        return res.status(403).json({ error: "Not allowed to view this quiz" });
      }
    } else {
      const teacherClass = getMetaValue(req.user.meta, "class");
      if (teacherClass && quiz.className !== teacherClass) {
        return res.status(403).json({ error: "Not allowed to view this quiz" });
      }
    }
    
    const quizObj = quiz.toObject();
    if (!isTeacher) {
      quizObj.questions = quizObj.questions.map(({ correctIndex, ...q }) => q);
    }
    res.json({ quiz: quizObj });
  } catch (err) {
    console.error("getQuiz error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function submitQuiz(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const student = await Student.findOne({ studentUserId: req.user._id });
    if (!student) {
      return res.status(404).json({ error: "Student record not found" });
    }
    if (student.className !== quiz.className) {
      return res.status(403).json({ error: "This quiz is not for your class" });
    }

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });

    const result = await QuizResult.findOneAndUpdate(
      { quizId: quiz._id, studentId: student._id },
      { answers, score, total: quiz.questions.length, submittedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(201).json({ result, score, total: quiz.questions.length });
  } catch (err) {
    console.error("submitQuiz error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getQuizResults(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.createdByTeacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the quiz creator can view results" });
    }

    const results = await QuizResult.find({ quizId: quiz._id })
      .populate("studentId", "name roll className")
      .sort({ submittedAt: -1 });

    const formattedResults = results.map((r) => ({
      id: r._id.toString(),
      studentId: r.studentId._id.toString(),
      studentName: r.studentId.name,
      studentRoll: r.studentId.roll,
      score: r.score,
      total: r.total,
      percentage: Math.round((r.score / r.total) * 100),
      submittedAt: r.submittedAt,
    }));

    res.json({ quizId: quiz._id, results: formattedResults });
  } catch (err) {
    console.error("getQuizResults error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  listQuizzes,
  createQuiz,
  getQuiz,
  submitQuiz,
  getQuizResults,
};
