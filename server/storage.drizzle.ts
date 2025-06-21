import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  medications,
  medicationLogs,
  users,
  type InsertMedication,
  type InsertMedicationLog,
  type InsertUser,
  type User,
  type Medication,
  type MedicationLog,
} from "@shared/schema";

export function drizzleStorage(db: typeof import("drizzle-orm").db) {
  return {
    // USER
    async getUser(id: number) {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    },

    async getUserByEmail(email: string) {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    },

    async getUserByUsername(username: string) {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    },

    async createUser(data: InsertUser) {
      const [created] = await db.insert(users).values(data).returning();
      return created;
    },

    // MEDICATION
    async getMedicationsByUserId(userId: number) {
      return db.select().from(medications).where(eq(medications.userId, userId));
    },

    async getMedication(id: number) {
      const [medication] = await db.select().from(medications).where(eq(medications.id, id));
      return medication;
    },

    async createMedication(data: InsertMedication) {
      const [created] = await db.insert(medications).values(data).returning();
      return created;
    },

    async updateMedication(id: number, data: Partial<Medication>) {
      const [updated] = await db
        .update(medications)
        .set(data)
        .where(eq(medications.id, id))
        .returning();
      return updated;
    },

    async deleteMedication(id: number) {
      await db.delete(medications).where(eq(medications.id, id));
      return true;
    },

    // MEDICATION LOGS
    async getMedicationLogs(userId: number, startDate?: string, endDate?: string) {
      let query = db.select().from(medicationLogs).where(eq(medicationLogs.userId, userId));
      if (startDate && endDate) {
        query = db
          .select()
          .from(medicationLogs)
          .where(
            and(
              eq(medicationLogs.userId, userId),
              gte(medicationLogs.scheduledFor, startDate),
              lte(medicationLogs.scheduledFor, endDate)
            )
          );
      }
      return query;
    },

    async getMedicationLogsForDate(userId: number, date: string) {
      return db
        .select()
        .from(medicationLogs)
        .where(and(eq(medicationLogs.userId, userId), eq(medicationLogs.scheduledFor, date)));
    },

    async createMedicationLog(data: InsertMedicationLog) {
      const [created] = await db.insert(medicationLogs).values(data).returning();
      return created;
    },
  };
}
