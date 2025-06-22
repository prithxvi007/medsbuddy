import {
  users,
  medications,
  medicationLogs,
  type User,
  type InsertUser,
  type Medication,
  type InsertMedication,
  type MedicationLog,
  type InsertMedicationLog,
} from "@shared/schema";

import { drizzleStorage } from "./storage.drizzle";
import { db } from "./db";

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
  updateMedication(
    id: number,
    medication: Partial<Medication>
  ): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;

  // Medication log operations
  getMedicationLogs(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<MedicationLog[]>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  getMedicationLogsForDate(
    userId: number,
    date: string
  ): Promise<MedicationLog[]>;
}

export const storage: IStorage = drizzleStorage(db);
