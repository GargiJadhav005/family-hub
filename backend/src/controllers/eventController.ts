import { Request, Response } from "express";
import { Event } from "../models";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const CreateEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().datetime(),
  type: z.enum(["notice", "event"]),
  icon: z.string().optional(),
  targetAudience: z.enum(["all", "students", "parents", "teachers"]).optional(),
});

// GET /api/events → public list (for parent/student dashboards)
export async function listEvents(req: Request, res: Response): Promise<void> {
  try {
    const type = req.query.type as string | undefined;
    const audience = req.query.audience as string | undefined;
    const filter: any = {};
    if (type) filter.type = type;
    if (audience) filter.$or = [{ targetAudience: audience }, { targetAudience: "all" }];
    const events = await Event.find(filter).sort({ date: -1 }).limit(20);
    res.json({ events });
  } catch (err) {
    console.error("listEvents error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/events → teacher creates an event or notice
export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = CreateEventSchema.parse(req.body);
    const event = await Event.create({
      ...body,
      date: new Date(body.date),
      createdByTeacherId: req.user._id,
    });
    res.status(201).json({ event });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("createEvent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /api/events/:id → teacher deletes an event
export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
