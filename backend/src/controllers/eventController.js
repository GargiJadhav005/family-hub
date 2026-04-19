const { Event, Notification, User } = require("../models");
const { getMetaValue } = require("../utils/auth");
const mongoose = require("mongoose");

const toClientEvent = (event) => ({
  id: event._id.toString(),
  title: event.title,
  description: event.description,
  date: event.date,
  type: event.type,
  icon: event.icon,
  targetAudience: event.targetAudience,
  targetClasses: event.targetClasses ?? [],
});

async function listEvents(req, res) {
  try {
    const type = req.query.type;
    const audience = req.query.audience;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (type) filter.type = type;

    if (audience) {
      filter.$or = [
        { targetAudience: audience },
        { targetAudience: "all" },
      ];
    }

    const viewerClass = req.query.viewerClass;
    if (viewerClass) {
      const classClause = {
        $or: [
          { targetClasses: { $exists: false } },
          { targetClasses: { $eq: [] } },
          { targetClasses: viewerClass },
        ],
      };
      if (filter.$and) {
        filter.$and.push(classClause);
      } else {
        filter.$and = [classClause];
      }
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Event.countDocuments(filter),
    ]);

    res.json({
      events: events.map(toClientEvent),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GetEvents error:", err);
    res.status(500).json({ 
      error: "Failed to fetch events",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function createEvent(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!["teacher", "admin"].includes(user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { title, description, date, type, icon, targetAudience, targetClasses } = req.body;

    const teacherClass = user.role === "teacher" ? getMetaValue(user.meta, "class") : "";
    let classes = targetClasses;
    if (user.role === "teacher" && teacherClass) {
      if (!classes || !classes.length) {
        classes = [teacherClass];
      }
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      type,
      icon,
      targetAudience,
      targetClasses: classes ?? [],
      createdBy: user._id,
    });

    try {
      let userFilter = {};

      if (targetAudience !== "all") {
        const roleMap = {
          students: "student",
          parents: "parent",
          teachers: "teacher",
        };
        userFilter.role = roleMap[targetAudience];
      }

      const users = await User.find(userFilter)
        .select("_id")
        .lean();

      if (users.length > 0) {
        const notifications = users.map((u) => ({
          userId: u._id,
          event: "event_created",
          title: event.title,
          message: event.description,
          relatedId: event._id,
          relatedModel: "Event",
        }));

        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.status(201).json({
      event: toClientEvent(event),
    });
  } catch (err) {
    console.error("createEvent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteEvent(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    if (!["teacher", "admin"].includes(user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  listEvents,
  createEvent,
  deleteEvent,
};
