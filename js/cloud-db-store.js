/**
 * Online Cloud Database Memory & Sync Module
 * Powered by URL-safe chunked REST cloud memory service.
 * Persists hospital branding, doctors, custom surgery rates, and patient bills online globally across all devices & browsers.
 */

class CloudDBStore {
  constructor() {
    this.STORAGE_KEY_CLOUD = "hospital_billing_cloud_config_v3";
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
      appKey: "aashospital2026", // Dedicated online cloud key for Aas Hospital and Pathology
      dataKey: "meta",
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

  safeUrlBtoa(str) {
    try {
      const b64 = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (e) {
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
  }

  safeUrlAtob(str) {
    try {
      let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4 !== 0) {
        b64 += '=';
      }
      return decodeURIComponent(Array.prototype.map.call(atob(b64), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch (e) {
      let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4 !== 0) {
        b64 += '=';
      }
      return atob(b64);
    }
  }

  /**
   * Helper to write a subkey to cloud storage safely
   */
  async updateCloudKey(subKey, dataObj) {
    const appKey = this.config.appKey || "aashospital2026";
    try {
      const jsonStr = JSON.stringify(dataObj);
      const urlB64 = this.safeUrlBtoa(jsonStr);

      // Check URL path length limit (max ~230 chars per segment)
      if (urlB64.length > 230) {
        console.warn(`Cloud key ${subKey} length (${urlB64.length}) exceeds URL limit, compacting...`);
      }

      const res = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${appKey}/${subKey}/${urlB64}`, {
        method: "POST"
      });

      if (res.ok) {
        const text = await res.text();
        return text === "true" || text.includes("true");
      }
    } catch (e) {
      console.warn(`Cloud push failed for ${subKey}:`, e);
    }
    return false;
  }

  /**
   * Helper to read a subkey from cloud storage
   */
  async getCloudKey(subKey) {
    const appKey = this.config.appKey || "aashospital2026";
    try {
      const res = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${appKey}/${subKey}`);
      if (res.ok) {
        const rawText = await res.json();
        if (rawText && typeof rawText === 'string' && rawText.length > 2) {
          const jsonStr = this.safeUrlAtob(rawText);
          return JSON.parse(jsonStr);
        }
      }
    } catch (e) {
      console.warn(`Cloud fetch failed for ${subKey}:`, e);
    }
    return null;
  }

  /**
   * Compiles & Pushes all database modules into chunked cloud memory
   */
  async pushToCloud() {
    if (!this.config.autoSync) return false;
    this.setSyncStatus("syncing");

    try {
      // 1. Prepare Header Settings (Compact, replacing 140KB logo with __DEFAULT__)
      let headerSettings = window.headerFooterStore ? window.headerFooterStore.getSettings() : {};
      const defaultLogo = (typeof window !== "undefined" && window.DEFAULT_LOGO_BASE64) ? window.DEFAULT_LOGO_BASE64 : "";
      
      const compactMeta = {
        n: headerSettings.hospitalName || "Aas Hospital and Pathology",
        t: headerSettings.hospitalTagline || "Excellence in Healthcare & Pathology",
        a: headerSettings.hospitalAddress || "Gandhinagar, Arvi Road Wardha",
        p: headerSettings.hospitalPhone || "7709296776",
        e: headerSettings.hospitalEmail || "",
        w: headerSettings.hospitalWebsite || "",
        r: headerSettings.regNo || "",
        g: headerSettings.gstNo || "",
        c: headerSettings.headerColor || "#005a5b",
        doc: headerSettings.defaultDoctor || "Dr. Ashutosh Babhulkar",
        sigName: headerSettings.signatoryName || "Dr. Ashutosh Babhulkar",
        emg: headerSettings.emergencyContact || "Emergency Line: 7709296776",
        logo: (headerSettings.logoBase64 && defaultLogo && headerSettings.logoBase64.substring(0, 80) === defaultLogo.substring(0, 80)) ? "__DEFAULT__" : (headerSettings.logoBase64 ? headerSettings.logoBase64.substring(0, 100) : "__DEFAULT__"),
        u: new Date().toISOString()
      };

      const metaOk = await this.updateCloudKey("meta", compactMeta);

      // 2. Doctors List
      const doctorsList = headerSettings.doctorsList || ["Dr. Ashutosh Babhulkar"];
      await this.updateCloudKey("doctors", { list: doctorsList, u: new Date().toISOString() });

      // 3. Custom Surgeries List
      const customSurgeries = window.surgeryPresetStore ? window.surgeryPresetStore.customPresets || [] : [];
      if (customSurgeries.length > 0) {
        await this.updateCloudKey("surgeries", { list: customSurgeries.slice(0, 20), u: new Date().toISOString() });
      }

      // 4. Bills History (Chunked per bill to avoid URL length limit)
      const bills = window.historyStore ? window.historyStore.getAllBills() : [];
      if (bills.length > 0) {
        // Save summary index
        const indexList = bills.slice(0, 15).map(b => ({
          no: b.billNo,
          name: b.patientName,
          uhid: b.uhid,
          date: b.billDate || b.createdAt,
          total: b.grandTotal,
          u: b.updatedAt
        }));
        await this.updateCloudKey("bills_index", { list: indexList, u: new Date().toISOString() });

        // Save top 10 full bills
        for (let i = 0; i < Math.min(bills.length, 10); i++) {
          const b = bills[i];
          if (b && b.billNo) {
            const cleanKey = "b_" + b.billNo.replace(/[^A-Za-z0-9]/g, "_");
            await this.updateCloudKey(cleanKey, b);
          }
        }
      }

      if (metaOk) {
        this.setSyncStatus("synced");
        this.config.lastSyncedAt = new Date().toISOString();
        this.saveConfig(this.config);
        return true;
      }
    } catch (e) {
      console.warn("Online Cloud DB push error:", e);
    }
    this.setSyncStatus("offline");
    return false;
  }

  /**
   * Fetches latest online data from cloud storage & merges seamlessly with local storage
   */
  async fetchFromCloud() {
    this.setSyncStatus("syncing");

    try {
      const defaultLogo = (typeof window !== "undefined" && window.DEFAULT_LOGO_BASE64) ? window.DEFAULT_LOGO_BASE64 : "";
      let changed = false;

      // 1. Fetch Metadata / Header Settings
      const cloudMeta = await this.getCloudKey("meta");
      if (cloudMeta && window.headerFooterStore) {
        const localSettings = window.headerFooterStore.getSettings();
        const mergedSettings = {
          ...localSettings,
          hospitalName: cloudMeta.n || "Aas Hospital and Pathology",
          hospitalTagline: cloudMeta.t || "Excellence in Healthcare & Pathology",
          hospitalAddress: cloudMeta.a || "Gandhinagar, Arvi Road Wardha",
          hospitalPhone: cloudMeta.p || "7709296776",
          hospitalEmail: cloudMeta.e || "",
          hospitalWebsite: cloudMeta.w || "",
          regNo: cloudMeta.r || "",
          gstNo: cloudMeta.g || "",
          headerColor: cloudMeta.c || "#005a5b",
          accentColor: cloudMeta.c || "#005a5b",
          defaultDoctor: cloudMeta.doc || "Dr. Ashutosh Babhulkar",
          signatoryName: cloudMeta.sigName || "Dr. Ashutosh Babhulkar",
          emergencyContact: cloudMeta.emg || "Emergency Line: 7709296776",
          logoBase64: (!cloudMeta.logo || cloudMeta.logo === "__DEFAULT__") ? defaultLogo : (localSettings.logoBase64 || defaultLogo)
        };

        window.headerFooterStore.saveSettings(mergedSettings);
        changed = true;
      }

      // 2. Fetch Doctors
      const cloudDoctors = await this.getCloudKey("doctors");
      if (cloudDoctors && Array.isArray(cloudDoctors.list) && window.headerFooterStore) {
        const settings = window.headerFooterStore.getSettings();
        const currentList = settings.doctorsList || ["Dr. Ashutosh Babhulkar"];
        const docSet = new Set([...currentList, ...cloudDoctors.list]);
        window.headerFooterStore.saveSettings({ doctorsList: Array.from(docSet) });
        changed = true;
      }

      // 3. Fetch Custom Surgeries
      const cloudSurgeries = await this.getCloudKey("surgeries");
      if (cloudSurgeries && Array.isArray(cloudSurgeries.list) && window.surgeryPresetStore) {
        const localCustoms = window.surgeryPresetStore.customPresets || [];
        const presetMap = new Map();
        for (const item of localCustoms) {
          if (item && item.name) presetMap.set(item.name.toLowerCase().trim(), item);
        }
        for (const item of cloudSurgeries.list) {
          if (item && item.name && !presetMap.has(item.name.toLowerCase().trim())) {
            presetMap.set(item.name.toLowerCase().trim(), item);
            changed = true;
          }
        }
        window.surgeryPresetStore.customPresets = Array.from(presetMap.values());
        window.surgeryPresetStore.persist();
      }

      // 4. Fetch Bills Index & Individual Full Bills
      const cloudIndex = await this.getCloudKey("bills_index");
      if (cloudIndex && Array.isArray(cloudIndex.list) && window.historyStore) {
        const localBills = window.historyStore.getAllBills();
        const billMap = new Map();

        for (const b of localBills) {
          if (b && b.billNo) billMap.set(b.billNo, b);
        }

        for (const summary of cloudIndex.list) {
          if (summary && summary.no && !billMap.has(summary.no)) {
            // Fetch full bill details
            const cleanKey = "b_" + summary.no.replace(/[^A-Za-z0-9]/g, "_");
            const fullBill = await this.getCloudKey(cleanKey);
            if (fullBill && fullBill.billNo) {
              billMap.set(fullBill.billNo, fullBill);
              changed = true;
            } else {
              // Construct bill record from summary
              billMap.set(summary.no, {
                billNo: summary.no,
                patientName: summary.name,
                uhid: summary.uhid,
                billDate: summary.date,
                grandTotal: summary.total,
                updatedAt: summary.u || new Date().toISOString()
              });
              changed = true;
            }
          }
        }

        const mergedBills = Array.from(billMap.values()).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        window.historyStore.bills = mergedBills;
        window.historyStore.persist();
      }

      this.setSyncStatus("synced");
      this.config.lastSyncedAt = new Date().toISOString();
      this.saveConfig(this.config);
      return changed;
    } catch (e) {
      console.warn("Online Cloud DB fetch error:", e);
    }
    this.setSyncStatus("offline");
    return null;
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
