// server/storage.drizzle.ts
import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  medications,
  medicationLogs,
  type InsertUser,
  type InsertMedication,
  type InsertMedicationLog,
} from "@shared/schema";

export function drizzleStorage(dbInstance: typeof db) {
  return {
    // User
    async getUserByEmail(email: string) {
      const [user] = await dbInstance.select().from(users).where(eq(users.email, email));
      return user;
    },

    async getUser(id: number) {
      const [user] = await dbInstance.select().from(users).where(eq(users.id, id));
      return user;
    },

    async createUser(user: InsertUser) {
      const result = await dbInstance.insert(users).values(user).returning();
      return result[0];
    },

    // Medication
    async getMedicationsByUserId(userId: number) {
      return dbInstance.select().from(medications).where(eq(medications.userId, userId));
    },

    async getMedication(id: number) {
      const [med] = await dbInstance.select().from(medications).where(eq(medications.id, id));
      return med;
    },

    async createMedication(med: InsertMedication) {
      const result = await dbInstance.insert(medications).values(med).returning();
      return result[0];
    },

    async deleteMedication(id: number) {
      await dbInstance.delete(medications).where(eq(medications.id, id));
    },

    // Logs
    async createMedicationLog(log: InsertMedicationLog) {
      const result = await dbInstance.insert(medicationLogs).values(log).returning();
      return result[0];
    },

    async getMedicationLogs(userId: number, startDate: string, endDate: string) {
      return dbInstance
        .select()
        .from(medicationLogs)
        .where(eq(medicationLogs.userId, userId))
        .where((log) => log.scheduledFor >= startDate && log.scheduledFor <= endDate);
    },

    async getMedicationLogsForDate(userId: number, date: string) {
      return dbInstance
        .select()
        .from(medicationLogs)
        .where(eq(medicationLogs.userId, userId))
        .where(eq(medicationLogs.scheduledFor, date));
    },
  };
}
