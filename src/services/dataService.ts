/**
 * Mock Data Service for Harmonize EcoConnect
 * Simulates SQLite local storage and sync via Appwrite.
 */

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

const STORAGE_KEYS = {
  AGRI: "harmonize_agri_logs",
  HEALTH: "harmonize_health_records",
};

export const dataStore = {
  saveAgriLog: (log: Omit<AgriLog, "id" | "timestamp">) => {
    const logs = dataStore.getAgriLogs();
    const newLog: AgriLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.AGRI, JSON.stringify([newLog, ...logs]));
    return newLog;
  },

  getAgriLogs: (): AgriLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AGRI);
    return data ? JSON.parse(data) : [];
  },

  saveHealthRecord: (record: Omit<HealthRecord, "id" | "timestamp">) => {
    const records = dataStore.getHealthRecords();
    const newRecord: HealthRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },

  getHealthRecords: (): HealthRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HEALTH);
    return data ? JSON.parse(data) : [];
  },
};
