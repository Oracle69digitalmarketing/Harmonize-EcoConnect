/**
 * Data Service for Harmonize EcoConnect
 * Integrates Appwrite for local/remote sync and SQLite-like resilience.
 */

import { Client, Databases, ID, Query } from "appwrite";

// Appwrite Configuration
const client = new Client()
    .setEndpoint("http://192.168.4.1/v1") // Local Node Endpoint
    .setProject("harmonize-ecoconnect"); // Default project ID

const databases = new Databases(client);

const DB_ID = "harmonize_db";
const COLLECTIONS = {
  AGRI: "agri_logs",
  HEALTH: "health_records",
};

export interface AgriLog {
  id: string;
  type: "crop" | "soil" | "fish" | "waste" | "disease";
  value: string;
  description?: string;
  image?: string;
  timestamp: string;
}

export interface HealthRecord {
  id: string;
  name: string;
  symptoms: string;
  image?: string;
  status: "Assessed" | "Pending" | "Critical";
  timestamp: string;
}

export const dataStore = {
  saveAgriLog: async (log: Omit<AgriLog, "id" | "timestamp">) => {
    try {
      const response = await databases.createDocument(
        DB_ID,
        COLLECTIONS.AGRI,
        ID.unique(),
        {
          ...log,
          timestamp: new Date().toISOString(),
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to save Agri Log to Appwrite, caching locally:", error);
      // Fallback to local storage for offline support
      const cached = JSON.parse(localStorage.getItem("offline_agri") || "[]");
      cached.push(log);
      localStorage.setItem("offline_agri", JSON.stringify(cached));
      return { ...log, id: "cached", timestamp: new Date().toISOString() };
    }
  },

  getAgriLogs: async (): Promise<AgriLog[]> => {
    try {
      const response = await databases.listDocuments(DB_ID, COLLECTIONS.AGRI, [
        Query.orderDesc("timestamp"),
        Query.limit(50)
      ]);
      return response.documents as unknown as AgriLog[];
    } catch (error) {
      console.warn("Offline: fetching from cache");
      const cached = JSON.parse(localStorage.getItem("offline_agri") || "[]");
      return cached;
    }
  },

  saveHealthRecord: async (record: Omit<HealthRecord, "id" | "timestamp">) => {
    try {
      const response = await databases.createDocument(
        DB_ID,
        COLLECTIONS.HEALTH,
        ID.unique(),
        {
          ...record,
          timestamp: new Date().toISOString(),
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to save Health Record to Appwrite, caching locally:", error);
      const cached = JSON.parse(localStorage.getItem("offline_health") || "[]");
      cached.push(record);
      localStorage.setItem("offline_health", JSON.stringify(cached));
      return { ...record, id: "cached", timestamp: new Date().toISOString() };
    }
  },

  getHealthRecords: async (): Promise<HealthRecord[]> => {
    try {
      const response = await databases.listDocuments(DB_ID, COLLECTIONS.HEALTH, [
        Query.orderDesc("timestamp"),
        Query.limit(50)
      ]);
      return response.documents as unknown as HealthRecord[];
    } catch (error) {
      console.warn("Offline: fetching from cache");
      const cached = JSON.parse(localStorage.getItem("offline_health") || "[]");
      return cached;
    }
  },
};
