/**
 * Hospital Header & Footer Storage & Settings Store
 */

const DEFAULT_HOSPITAL_SETTINGS = {
  hospitalName: "ST. JUDE MEDICARE & SURGICAL HOSPITAL",
  hospitalTagline: "Excellence in Surgical Care & Advanced Healthcare",
  hospitalAddress: "Plot 42, Health City Avenue, Outer Ring Road, New Delhi - 110075",
  hospitalPhone: "+91 11 4988 7700 / +91 98100 12345",
  hospitalEmail: "billing@stjudemedicare.com",
  hospitalWebsite: "", // Left blank by default
  regNo: "REG-DEL-HOSP-2024-8891",
  gstNo: "07AAAAA0000A1Z5",
  headerColor: "#1e3a8a", // Navy Blue
  accentColor: "#2563eb",
  logoBase64: "", // Will hold Base64 logo data
  showWatermark: true,
  watermarkText: "PAID / OFFICIAL",
  
  // Doctor settings
  defaultDoctor: "Dr. Ashutosh Babhulkar",
  doctorsList: ["Dr. Ashutosh Babhulkar"],

  // Footer settings
  footerTerms: "1. All payment receipts are subject to bank realization.\n2. Goods & Services once billed cannot be returned.\n3. This is a computer-generated final bill and signed by authorized hospital personnel.",
  signatoryName: "Dr. Ashutosh Babhulkar",
  signatoryTitle: "Medical Superintendent / Authorized Officer",
  signatureBase64: "", // Will hold Base64 signature image
  showSignature: true,
  showStamp: true,
  emergencyContact: "24x7 Emergency Line: +91 11 4988 7799"
};


class HeaderFooterStore {
  constructor() {
    this.STORAGE_KEY = "hospital_billing_header_footer_v1";
    this.settings = this.loadSettings();
    this.listeners = [];
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hospitalWebsite === "www.stjudemedicare.com") {
          parsed.hospitalWebsite = "";
        }
        return { ...DEFAULT_HOSPITAL_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load header/footer settings", e);
    }
    return { ...DEFAULT_HOSPITAL_SETTINGS };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error("Failed to save settings", e);
      return false;
    }
  }

  resetToDefault() {
    this.settings = { ...DEFAULT_HOSPITAL_SETTINGS };
    localStorage.removeItem(this.STORAGE_KEY);
    this.notifyListeners();
  }

  getSettings() {
    return { ...this.settings };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.getSettings());
    }
  }
}

window.headerFooterStore = new HeaderFooterStore();
