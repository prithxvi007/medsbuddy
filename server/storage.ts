import { 
  users, 
  medications, 
  medicationLogs,
  type User, 
  type InsertUser, 
  type Medication, 
  type InsertMedication,
  type MedicationLog,
  type InsertMedicationLog
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Medication operations
  getMedicationsByUserId(userId: number): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<Medication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  
  // Medication log operations
  getMedicationLogs(userId: number, startDate?: string, endDate?: string): Promise<MedicationLog[]>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  getMedicationLogsForDate(userId: number, date: string): Promise<MedicationLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medications: Map<number, Medication>;
  private medicationLogs: Map<number, MedicationLog>;
  private currentUserId: number;
  private currentMedicationId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.medications = new Map();
    this.medicationLogs = new Map();
    this.currentUserId = 1;
    this.currentMedicationId = 1;
    this.currentLogId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getMedicationsByUserId(userId: number): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(med => med.userId === userId);
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.currentMedicationId++;
    const medication: Medication = {
      ...insertMedication,
      id,
      createdAt: new Date()
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: number, updateData: Partial<Medication>): Promise<Medication | undefined> {
    const existing = this.medications.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }

  async getMedicationLogs(userId: number, startDate?: string, endDate?: string): Promise<MedicationLog[]> {
    let logs = Array.from(this.medicationLogs.values()).filter(log => log.userId === userId);
    
    if (startDate) {
      logs = logs.filter(log => log.scheduledFor >= startDate);
    }
    
    if (endDate) {
      logs = logs.filter(log => log.scheduledFor <= endDate);
    }
    
    return logs;
  }

  async createMedicationLog(insertLog: InsertMedicationLog): Promise<MedicationLog> {
    const id = this.currentLogId++;
    const log: MedicationLog = {
      ...insertLog,
      id,
      createdAt: new Date()
    };
    this.medicationLogs.set(id, log);
    return log;
  }

  async getMedicationLogsForDate(userId: number, date: string): Promise<MedicationLog[]> {
    return Array.from(this.medicationLogs.values()).filter(
      log => log.userId === userId && log.scheduledFor === date
    );
  }
}

export const storage = new MemStorage();
