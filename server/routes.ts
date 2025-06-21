import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { 
  loginSchema, 
  signupSchema, 
  addMedicationSchema,
  type User 
} from "@shared/schema";
import { ZodError } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

// Middleware to verify JWT token
async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Medication routes
  app.get('/api/medications', authenticateToken, async (req: any, res) => {
    try {
      const medications = await storage.getMedicationsByUserId(req.userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/medications', authenticateToken, async (req: any, res) => {
    try {
      const medicationData = addMedicationSchema.parse(req.body);
      
      const medication = await storage.createMedication({
        ...medicationData,
        userId: req.userId,
        times: medicationData.times ? JSON.stringify(medicationData.times) : null
      });

      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/medications/:id', authenticateToken, async (req: any, res) => {
    try {
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedication(medicationId);
      
      if (!medication || medication.userId !== req.userId) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      await storage.deleteMedication(medicationId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Medication logging routes
  app.post('/api/medications/:id/mark-taken', authenticateToken, async (req: any, res) => {
    try {
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedication(medicationId);
      
      if (!medication || medication.userId !== req.userId) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Check if already marked as taken today
      const existingLogs = await storage.getMedicationLogsForDate(req.userId, today);
      const alreadyTaken = existingLogs.some(log => log.medicationId === medicationId);
      
      if (alreadyTaken) {
        return res.status(400).json({ message: 'Medication already marked as taken today' });
      }

      const log = await storage.createMedicationLog({
        medicationId,
        userId: req.userId,
        takenAt: new Date(),
        scheduledFor: today
      });

      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/medication-logs', authenticateToken, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      const logs = await storage.getMedicationLogs(req.userId, startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/adherence', authenticateToken, async (req: any, res) => {
    try {
      const medications = await storage.getMedicationsByUserId(req.userId);
      
      // Calculate adherence for the last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const logs = await storage.getMedicationLogs(req.userId, startDate, endDate);
      
      // Calculate expected doses vs taken doses
      const daysInPeriod = 30;
      let totalExpectedDoses = 0;
      let totalTakenDoses = logs.length;
      
      medications.forEach(med => {
        // Simplified calculation - assume once daily for now
        totalExpectedDoses += daysInPeriod;
      });
      
      const adherenceRate = totalExpectedDoses > 0 
        ? Math.round((totalTakenDoses / totalExpectedDoses) * 100)
        : 0;
      
      res.json({
        adherenceRate,
        totalExpectedDoses,
        totalTakenDoses,
        period: `${startDate} to ${endDate}`
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Database query endpoint for development/admin use
  app.post('/api/db/query', async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Query is required' });
      }

      // Basic security check - only allow SELECT, COUNT queries for safety
      const trimmedQuery = query.trim().toUpperCase();
      if (!trimmedQuery.startsWith('SELECT') && !trimmedQuery.startsWith('WITH')) {
        return res.status(403).json({ message: 'Only SELECT queries are allowed' });
      }

      const { db } = await import('./db');
      
      // Execute raw SQL query
      const rawDb = (db as any)._.session.db;
      const statement = rawDb.prepare(query);
      const rows = statement.all();
      
      // Get column names
      const columns = statement.columns().map((col: any) => col.name);
      
      // Convert rows to array format for easier display
      const rowsArray = rows.map((row: any) => columns.map(col => row[col]));
      
      res.json({
        columns,
        rows: rowsArray,
        count: rows.length
      });
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Database query failed' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
