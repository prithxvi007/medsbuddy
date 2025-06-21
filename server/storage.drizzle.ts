import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { medications, medicationLogs, users, type InsertMedication, type InsertMedicationLog, type InsertUser, type User, type Medication, type MedicationLog } from "@shared/schema";

export function drizzleStorage(db: typeof import("drizzle-orm").db) {
  return {
    // USER
    async getUser(id: number) {
      return db.query.users.findFirst({ where: eq(users.id, id) });
    },

    async getUserByEmail(email: string) {
      return db.query.users.findFirst({ where: eq(users.email, email) });
    },

    async getUserByUsername(username: string) {
      return db.query.users.findFirst({ where: eq(users.username, username) });
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
      return db.query.medications.findFirst({ where: eq(medications.id, id) });
    },

    async createMedication(data: InsertMedication) {
      const [created] = await db.insert(medications).values(data).returning();
      return created;
    },

    async updateMedication(id: number, data: Partial<Medication>) {
      const [updated] = await db.update(medications)
        .set(data)
        .where(eq(medications.id, id))
        .returning();
      return updated;
    },

    async deleteMedication(id: number) {
      await db.delete(medications).where(eq(medications.id, id));
      return true;
    },

    // MEDICATION LOG
    async getMedicationLogs(userId: number, startDate?: string, endDate?: string) {
      let query = db.select().from(medicationLogs).where(eq(medicationLogs.userId, userId));
      if (startDate && endDate) {
        query = query.where(
          and(
            eq(medicationLogs.userId, userId),
            medicationLogs.scheduledFor >= startDate,
            medicationLogs.scheduledFor <= endDate
          )
        );
      }
      return query;
    },

    async getMedicationLogsForDate(userId: number, date: string) {
      return db.select().from(medicationLogs).where(
        and(
          eq(medicationLogs.userId, userId),
          eq(medicationLogs.scheduledFor, date)
        )
      );
    },

    async createMedicationLog(data: InsertMedicationLog) {
      const [created] = await db.insert(medicationLogs).values(data).returning();
      return created;
    },
  };
}
