/**
 * Online Cloud Database Memory & Sync Module
 * Powered by zero-auth REST cloud memory service.
 * Persists hospital branding, doctors, custom surgery rates, and patient bills online globally across all devices & browsers.
 */

class CloudDBStore {
  constructor() {
    this.STORAGE_KEY_CLOUD = "hospital_billing_cloud_config_v2";
    this.config = this.loadConfig();
    this.syncStatus = "offline"; // 'synced', 'syncing', 'offline'
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
      appKey: "hospital_billing_ashutosh", // Shared online cloud secret key
      dataKey: "master",
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

  safeBtoa(str) {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
    } catch (e) {
      return btoa(str);
    }
  }

  safeAtob(str) {
    try {
      return decodeURIComponent(Array.prototype.map.call(atob(str), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch (e) {
      return atob(str);
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
    const appKey = this.config.appKey || "hospital_billing_ashutosh";
    const dataKey = this.config.dataKey || "master";

    try {
      const res = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${appKey}/${dataKey}`);
      if (res.ok) {
        const rawText = await res.json();
        if (rawText && typeof rawText === 'string' && rawText.length > 5) {
          const jsonStr = this.safeAtob(rawText);
          const record = JSON.parse(jsonStr);
          if (record && (record.headerSettings || record.historyBills || record.customSurgeries)) {
            this.setSyncStatus("synced");
            this.config.lastSyncedAt = new Date().toISOString();
            this.saveConfig(this.config);
            return record;
          }
        }
      }
    } catch (e) {
      console.warn("Online Cloud DB fetch note:", e);
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
    const appKey = this.config.appKey || "hospital_billing_ashutosh";
    const dataKey = this.config.dataKey || "master";

    try {
      const payload = this.getFullPayload();
      const str = JSON.stringify(payload);
      const b64 = this.safeBtoa(str);

      const res = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${appKey}/${dataKey}/${b64}`, {
        method: "POST"
      });

      if (res.ok) {
        const text = await res.text();
        if (text === "true" || text.includes("true")) {
          this.setSyncStatus("synced");
          this.config.lastSyncedAt = new Date().toISOString();
          this.saveConfig(this.config);
          return true;
        }
      }
    } catch (e) {
      console.warn("Online Cloud DB push note:", e);
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
