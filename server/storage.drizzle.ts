import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  medications,
  medicationLogs,
  type InsertUser,
  type InsertMedication,
  type InsertMedicationLog,
  type Medication,
  type MedicationLog,
  type User,
} from "@shared/schema";

export function drizzleStorage(dbInstance: typeof db) {
  return {
    // User
    async getUserByEmail(email: string): Promise<User | undefined> {
      const [user] = await dbInstance.select().from(users).where(eq(users.email, email));
      return user;
    },

    async getUserByUsername(username: string): Promise<User | undefined> {
      const [user] = await dbInstance.select().from(users).where(eq(users.username, username));
      return user;
    },

    async getUser(id: number): Promise<User | undefined> {
      const [user] = await dbInstance.select().from(users).where(eq(users.id, id));
      return user;
    },

    async createUser(user: InsertUser): Promise<User> {
      const result = await dbInstance.insert(users).values(user).returning();
      return result[0];
    },

    // Medication
    async getMedicationsByUserId(userId: number): Promise<Medication[]> {
      return dbInstance.select().from(medications).where(eq(medications.userId, userId));
    },

    async getMedication(id: number): Promise<Medication | undefined> {
      const [med] = await dbInstance.select().from(medications).where(eq(medications.id, id));
      return med;
    },

    async createMedication(med: InsertMedication): Promise<Medication> {
      const result = await dbInstance.insert(medications).values(med).returning();
      return result[0];
    },

    async updateMedication(
      id: number,
      medication: Partial<Medication>
    ): Promise<Medication | undefined> {
      const result = await dbInstance
        .update(medications)
        .set(medication)
        .where(eq(medications.id, id))
        .returning();
      return result[0];
    },

    async deleteMedication(id: number): Promise<boolean> {
      await dbInstance.delete(medications).where(eq(medications.id, id));
      return true;
    },

    // Logs
    async createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog> {
      const result = await dbInstance.insert(medicationLogs).values(log).returning();
      return result[0];
    },

    async getMedicationLogs(
      userId: number,
      startDate?: string,
      endDate?: string
    ): Promise<MedicationLog[]> {
      if (startDate && endDate) {
        return dbInstance
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

      return dbInstance
        .select()
        .from(medicationLogs)
        .where(eq(medicationLogs.userId, userId));
    },

    async getMedicationLogsForDate(
      userId: number,
      date: string
    ): Promise<MedicationLog[]> {
      return dbInstance
        .select()
        .from(medicationLogs)
        .where(
          and(
            eq(medicationLogs.userId, userId),
            eq(medicationLogs.scheduledFor, date)
          )
        );
    },
  };
}
