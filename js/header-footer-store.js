/**
 * Hospital Header & Footer Storage & Settings Store
 */

const DEFAULT_HOSPITAL_SETTINGS = {
  hospitalName: "Aas Hospital and Pathology",
  hospitalTagline: "Excellence in Healthcare & Pathology",
  hospitalAddress: "Gandhinagar, Arvi Road Wardha",
  hospitalPhone: "7709296776",
  hospitalEmail: "",
  hospitalWebsite: "",
  regNo: "",
  gstNo: "",
  headerColor: "#005a5b", // RGB: 0, 90, 91
  accentColor: "#005a5b",
  logoBase64: (typeof window !== "undefined" && window.DEFAULT_LOGO_BASE64) ? window.DEFAULT_LOGO_BASE64 : "",
  showWatermark: true,
  watermarkText: "PAID / OFFICIAL",
  
  // Right Header Doctors Panel (matching reference image)
  showRightHeaderBlock: true,
  doc1Name: "डॉ. आशुतोष विजय बाभुळकर",
  doc1Degree: "MBBS, MS ( GENERAL SURGERY), FMAS, FIAGES",
  doc1Spec: "GENERAL, ENDOSCOPIC AND LAPAROSCOPIC SURGEON",
  doc2Name: "डॉ. स्नेहल करंजेकर (बाभुळकर)",
  doc2Degree: "MBBS, MD ( PATHOLOGY)",
  doc2Spec: "CONSULTANT SURGICAL AND CYTOPATHOLOGIST",

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
  emergencyContact: "Emergency Line: 7709296776"
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
      const defaultLogo = (typeof window !== "undefined" && window.DEFAULT_LOGO_BASE64) ? window.DEFAULT_LOGO_BASE64 : "";
      
      if (saved) {
        const parsed = JSON.parse(saved);
        // Auto-migrate legacy ST. JUDE or outdated address/logo/doctor data to new defaults
        if (!parsed.hospitalName || parsed.hospitalName.includes("ST. JUDE") || (parsed.hospitalAddress && parsed.hospitalAddress.includes("New Delhi")) || !parsed.doc1Name || !parsed.doc2Name || parsed.doc2Name.includes("स्नेहहल")) {
          parsed.hospitalName = DEFAULT_HOSPITAL_SETTINGS.hospitalName;
          parsed.hospitalTagline = DEFAULT_HOSPITAL_SETTINGS.hospitalTagline;
          parsed.hospitalAddress = DEFAULT_HOSPITAL_SETTINGS.hospitalAddress;
          parsed.hospitalPhone = DEFAULT_HOSPITAL_SETTINGS.hospitalPhone;
          parsed.gstNo = "";
          parsed.regNo = "";
          parsed.hospitalWebsite = "";
          parsed.headerColor = DEFAULT_HOSPITAL_SETTINGS.headerColor;
          parsed.accentColor = DEFAULT_HOSPITAL_SETTINGS.accentColor;
          parsed.emergencyContact = DEFAULT_HOSPITAL_SETTINGS.emergencyContact;
          parsed.logoBase64 = defaultLogo;
          parsed.showRightHeaderBlock = true;
          parsed.doc1Name = DEFAULT_HOSPITAL_SETTINGS.doc1Name;
          parsed.doc1Degree = DEFAULT_HOSPITAL_SETTINGS.doc1Degree;
          parsed.doc1Spec = DEFAULT_HOSPITAL_SETTINGS.doc1Spec;
          parsed.doc2Name = DEFAULT_HOSPITAL_SETTINGS.doc2Name;
          parsed.doc2Degree = DEFAULT_HOSPITAL_SETTINGS.doc2Degree;
          parsed.doc2Spec = DEFAULT_HOSPITAL_SETTINGS.doc2Spec;
        }

        if (!parsed.logoBase64 && defaultLogo) {
          parsed.logoBase64 = defaultLogo;
        }

        if (parsed.showRightHeaderBlock === undefined) {
          parsed.showRightHeaderBlock = true;
        }

        // Merge defaults FIRST, then parsed, ensuring new default fields are always present
        const merged = { ...DEFAULT_HOSPITAL_SETTINGS, logoBase64: defaultLogo, ...parsed };
        if (!merged.doc1Name) merged.doc1Name = DEFAULT_HOSPITAL_SETTINGS.doc1Name;
        if (!merged.doc1Degree) merged.doc1Degree = DEFAULT_HOSPITAL_SETTINGS.doc1Degree;
        if (!merged.doc1Spec) merged.doc1Spec = DEFAULT_HOSPITAL_SETTINGS.doc1Spec;
        if (!merged.doc2Name) merged.doc2Name = DEFAULT_HOSPITAL_SETTINGS.doc2Name;
        if (!merged.doc2Degree) merged.doc2Degree = DEFAULT_HOSPITAL_SETTINGS.doc2Degree;
        if (!merged.doc2Spec) merged.doc2Spec = DEFAULT_HOSPITAL_SETTINGS.doc2Spec;
        return merged;
      }
    } catch (e) {
      console.error("Failed to load header/footer settings", e);
    }
    const defaultLogo = (typeof window !== "undefined" && window.DEFAULT_LOGO_BASE64) ? window.DEFAULT_LOGO_BASE64 : "";
    return { ...DEFAULT_HOSPITAL_SETTINGS, logoBase64: defaultLogo };
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
    const defaultLogo = (typeof window !== "undefined" && window.DEFAULT_LOGO_BASE64) ? window.DEFAULT_LOGO_BASE64 : "";
    this.settings = { ...DEFAULT_HOSPITAL_SETTINGS, logoBase64: defaultLogo };
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

