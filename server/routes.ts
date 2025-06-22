import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { drizzleStorage } from "./storage.drizzle";
import { db, rawDB } from "./db";
import {
  loginSchema,
  signupSchema,
  addMedicationSchema,
  type User,
} from "@shared/schema";
import { ZodError } from "zod";

const storage = drizzleStorage(db);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

// Custom request interface
interface AuthenticatedRequest extends Request {
  userId: number;
}

// Auth middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as AuthenticatedRequest).userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      const existing = await storage.getUserByEmail(userData.email);
      if (existing) return res.status(400).json({ message: "User exists" });
      const hash = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const user = await storage.createUser({ ...userData, password: hash });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: "Validation", errors: err.errors });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid credentials" });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user });
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: "Validation", errors: err.errors });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/medications", authenticateToken, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const medications = await storage.getMedicationsByUserId(userId);
      res.json(medications);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/medications", authenticateToken, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const med = addMedicationSchema.parse(req.body);
      const created = await storage.createMedication({
        ...med,
        userId,
        times: JSON.stringify(med.times),
      });
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: "Validation", errors: err.errors });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/medications/:id", authenticateToken, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const id = parseInt(req.params.id);
      const med = await storage.getMedication(id);
      if (!med || med.userId !== userId) return res.status(404).json({ message: "Not found" });
      await storage.deleteMedication(id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/medications/:id/mark-taken", authenticateToken, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const id = parseInt(req.params.id);
      const med = await storage.getMedication(id);
      if (!med || med.userId !== userId) return res.status(404).json({ message: "Not found" });
      const date = new Date().toISOString().split("T")[0];
      const logs = await storage.getMedicationLogsForDate(userId, date);
      if (logs.some(l => l.medicationId === id)) return res.status(400).json({ message: "Already marked" });
      const log = await storage.createMedicationLog({
        medicationId: id,
        userId,
        takenAt: new Date(),
        scheduledFor: date,
      });
      res.status(201).json(log);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/medication-logs", authenticateToken, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate required" });
      }
      const logs = await storage.getMedicationLogs(userId, startDate, endDate);
      res.json(logs);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/adherence", authenticateToken, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const meds = await storage.getMedicationsByUserId(userId);
      const end = new Date().toISOString().split("T")[0];
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const logs = await storage.getMedicationLogs(userId, start, end);
      const totalExpected = meds.length * 30;
      const adherence = totalExpected ? Math.round((logs.length / totalExpected) * 100) : 0;
      res.json({
        adherenceRate: adherence,
        totalExpectedDoses: totalExpected,
        totalTakenDoses: logs.length,
        period: `${start} to ${end}`,
      });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/db/query", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") return res.status(400).json({ message: "Query required" });
      const q = query.trim().toUpperCase();
      if (!q.startsWith("SELECT") && !q.startsWith("WITH")) return res.status(403).json({ message: "Only SELECT queries allowed" });
      const stmt = rawDB.prepare(query);
      const rows = stmt.all();
      const cols = stmt.columns().map((c: any) => c.name);
      const formatted = rows.map((r: any) => cols.map(c => r[c]));
      res.json({ columns: cols, rows: formatted, count: rows.length });
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "Query failed" });
    }
  });

  return createServer(app);
}
