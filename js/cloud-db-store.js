/**
 * Online Cloud Database Sync Module
 * Enables global online memory across all devices & browsers hosted on GitHub Pages.
 * Persists hospital settings, signatures, doctors, custom rates, and bill records online.
 */

class CloudDBStore {
  constructor() {
    this.STORAGE_KEY_CLOUD = "hospital_billing_cloud_config_v1";
    this.config = this.loadConfig();
    this.syncStatus = "synced"; // 'synced', 'syncing', 'offline'
    this.listeners = [];
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY_CLOUD);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load cloud config", e);
    }
    return {
      autoSync: true,
      cloudBinId: "66c8b9d0acd3cb34a8775f0a", // Default online cloud memory bin ID
      lastSyncedAt: null
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(this.STORAGE_KEY_CLOUD, JSON.stringify(this.config));
    } catch (e) {
      console.error("Failed to save cloud config", e);
    }
  }

  /**
   * Compiles complete local database state into single JSON payload
   */
  getFullPayload() {
    return {
      version: "1.0",
      updatedAt: new Date().toISOString(),
      headerSettings: window.headerFooterStore ? window.headerFooterStore.getSettings() : {},
      historyBills: window.historyStore ? window.historyStore.getAllBills() : [],
      customSurgeries: window.surgeryPresetStore ? window.surgeryPresetStore.customPresets : []
    };
  }

  /**
   * Fetches latest master online data from cloud storage
   */
  async fetchFromCloud() {
    this.setSyncStatus("syncing");
    try {
      // Use fallback JSONBin / Cloud API endpoint
      const binId = this.config.cloudBinId || "66c8b9d0acd3cb34a8775f0a";
      const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        method: "GET",
        headers: {
          "X-Master-Key": "$2a$10$8.uLp1PzD1O50.G4nO62J.P2kC1uJ1nN9qL5oD3wR2m8V7s9t0e2W"
        }
      });

      if (res.ok) {
        const json = await res.json();
        const record = json.record || json;
        if (record && (record.headerSettings || record.historyBills)) {
          this.setSyncStatus("synced");
          this.config.lastSyncedAt = new Date().toISOString();
          this.saveConfig(this.config);
          return record;
        }
      }
    } catch (e) {
      console.warn("Online Cloud DB fetch fallback note:", e);
    }
    this.setSyncStatus("offline");
    return null;
  }

  /**
   * Pushes latest database state to online cloud memory
   */
  async pushToCloud() {
    if (!this.config.autoSync) return false;
    this.setSyncStatus("syncing");
    
    try {
      const binId = this.config.cloudBinId || "66c8b9d0acd3cb34a8775f0a";
      const payload = this.getFullPayload();

      const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": "$2a$10$8.uLp1PzD1O50.G4nO62J.P2kC1uJ1nN9qL5oD3wR2m8V7s9t0e2W"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.setSyncStatus("synced");
        this.config.lastSyncedAt = new Date().toISOString();
        this.saveConfig(this.config);
        return true;
      }
    } catch (e) {
      console.warn("Online Cloud DB push fallback note:", e);
    }
    this.setSyncStatus("offline");
    return false;
  }

  setSyncStatus(status) {
    this.syncStatus = status;
    this.notifyListeners(status);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(status) {
    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch (e) {}
    }
  }
}

if (typeof window !== "undefined") {
  window.cloudDBStore = new CloudDBStore();
}
