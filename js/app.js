/**
 * Hospital Billing Agent - Main Application Controller
 */

// Helper to convert number to Indian Currency Words
function numberToWordsINR(num) {
  if (num === null || num === undefined || isNaN(num)) return "Zero Rupees Only";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return "Zero Rupees Only";

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  const result = inWords(n).trim();
  const paise = Math.round((Math.abs(num) - n) * 100);
  const paiseStr = paise > 0 ? ` and ${inWords(paise).trim()} Paise` : '';
  
  return `Rupees ${result}${paiseStr} Only`;
}

class BillingApp {
  constructor() {
    const today = new Date().toISOString().split("T")[0];
    
    this.billData = {
      billNo: this.deriveBillNo(today, ""),
      billDate: today,
      patientName: "",
      uhid: "",
      age: "",
      gender: "Male",
      mobile: "",
      address: "",
      doctorName: "Dr. Ashutosh Babhulkar",
      department: "General & Surgical Care",
      admissionDate: today + "T10:00",
      dischargeDate: today + "T14:00",
      roomNo: "Suite 302",
      diagnosis: "Eversion of hydrocele sac",
      paymentMode: "Cash / Card / UPI",
      paymentStatus: "Pending",
      discountPercent: 0,
      taxPercent: 0,
      advancePaid: 0,
      paymentEntries: this.getDefaultPayments(),
      chargeItems: this.getDefaultCharges()
    };

    this.activeTab = "billing";
    this.init();
  }

  getDefaultPayments() {
    return [];
  }

  getDefaultCharges() {
    return [
      { id: 1, name: "OT Charges", category: "OT", qty: 1, unitPrice: 8000, discount: 0, amount: 8000 },
      { id: 2, name: "Anesthesia Charges", category: "Anaesthetist", qty: 1, unitPrice: 8000, discount: 0, amount: 8000 },
      { id: 3, name: "Surgeon Charges", category: "Surgeon", qty: 1, unitPrice: 25000, discount: 2000, amount: 23000 },
      { id: 4, name: "Assistant Charges", category: "Assistant", qty: 1, unitPrice: 6000, discount: 0, amount: 6000 },
      { id: 5, name: "Nursing Charges", category: "Nursing", qty: 1, unitPrice: 2000, discount: 0, amount: 2000 },
      { id: 6, name: "Admission Charges", category: "Misc", qty: 1, unitPrice: 6000, discount: 0, amount: 6000 },
      { id: 7, name: "Pharmacy", category: "Pharmacy", qty: 1, unitPrice: 13380, discount: 1380, amount: 12000 }
    ];
  }

  deriveBillNo(dateStr, uhidStr) {
    const cleanDate = dateStr ? dateStr.replace(/-/g, "") : new Date().toISOString().split("T")[0].replace(/-/g, "");
    const cleanUhid = (uhidStr || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleanUhid) {
      return `INV-${cleanDate}-${cleanUhid}`;
    }
    return `INV-${cleanDate}-001`;
  }

  init() {
    this.setupThemeToggle();
    this.setupTabs();
    this.loadSurgeryPresetsDropdown();
    this.renderDoctorsDropdown();
    this.setupEventListeners();
    this.setupHeaderFooterForm();
    this.renderDoctorSettingsList();
    this.setupCustomSurgeryForm();
    this.setupDatabaseExportImport();
    this.setupCloudSync();
    this.checkEkaParams();
    this.renderPaymentEntriesTable();
    this.renderChargeTable();
    this.updateCalculations();
    this.renderPdfPreview();
    this.renderHistoryTable();

    // Apply dynamic app theme colors from Settings on startup
    const initialSettings = window.headerFooterStore.getSettings();
    this.applyThemeFromSettings(initialSettings);

    // Subscribe to Header/Footer settings changes
    window.headerFooterStore.subscribe((settings) => {
      this.applyThemeFromSettings(settings);
      this.renderDoctorsDropdown();
      this.renderDoctorSettingsList();
      this.renderPdfPreview();
      if (window.cloudDBStore) window.cloudDBStore.pushToCloud();
    });
  }

  async setupCloudSync() {
    if (!window.cloudDBStore) return;

    const cloudKeyInput = document.getElementById("cloudAppKeyInput");
    if (cloudKeyInput) {
      cloudKeyInput.value = window.cloudDBStore.config.appKey || "aashospital2026";
      cloudKeyInput.addEventListener("change", (e) => {
        const val = e.target.value.trim() || "aashospital2026";
        window.cloudDBStore.saveConfig({ appKey: val });
        this.syncCloudNow();
      });
    }

    const btnSync = document.getElementById("btnSyncCloudNow");
    if (btnSync) {
      btnSync.addEventListener("click", () => {
        this.syncCloudNow();
      });
    }

    window.cloudDBStore.subscribe(status => {
      this.updateCloudBadge(status);
    });

    // Fetch and merge online cloud memory on startup
    await this.syncCloudNow();

    // Auto-sync when window re-gains focus or visibility (phone/desktop switching)
    window.addEventListener("focus", () => {
      if (window.cloudDBStore && window.cloudDBStore.config.autoSync) {
        window.cloudDBStore.fetchFromCloud().then(changed => {
          if (changed) {
            this.loadSurgeryPresetsDropdown();
            this.renderDoctorsDropdown();
            this.setupHeaderFooterForm();
            this.renderHistoryTable();
            this.renderPdfPreview();
          }
        });
      }
    });
  }

  async syncCloudNow() {
    if (!window.cloudDBStore) return;
    const changed = await window.cloudDBStore.fetchFromCloud();
    
    // Always push latest state back to cloud after fetch merge to ensure cloud key is updated
    await window.cloudDBStore.pushToCloud();

    this.loadSurgeryPresetsDropdown();
    this.renderDoctorsDropdown();
    this.setupHeaderFooterForm();
    this.renderHistoryTable();
    this.renderPdfPreview();

    if (changed) {
      this.showNotification("☁️ Online Cloud Memory Synced!", "success");
    } else {
      this.showNotification("☁️ Memory Synced with Online Database!", "info");
    }
  }

  updateCloudBadge(status) {
    const badge = document.getElementById("cloudSyncBadge");
    if (!badge) return;

    badge.className = "cloud-status-badge";
    if (status === "synced") {
      badge.classList.add("synced");
      badge.textContent = "☁️ Cloud Synced";
    } else if (status === "syncing") {
      badge.classList.add("syncing");
      badge.textContent = "⚡ Syncing Online...";
    } else {
      badge.classList.add("offline");
      badge.textContent = "💾 Local Mode";
    }
  }

  setupCustomSurgeryForm() {
    const form = document.getElementById("formAddSurgeryPreset");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const category = document.getElementById("newPresetCategory").value || "⭐ Custom Surgeries";
      const name = document.getElementById("newPresetName").value.trim();
      if (!name) return;

      const surgeonFee = parseFloat(document.getElementById("newPresetSurgeon").value) || 0;
      const assistantFee = parseFloat(document.getElementById("newPresetAssistant").value) || 0;
      const anesthesiaFee = parseFloat(document.getElementById("newPresetAnesthesia").value) || 0;
      const otCharges = parseFloat(document.getElementById("newPresetOt").value) || 0;
      const stayCharges = parseFloat(document.getElementById("newPresetStay").value) || 0;
      const miscCharges = parseFloat(document.getElementById("newPresetMisc").value) || 0;

      const charges = [];
      if (surgeonFee > 0) charges.push({ name: "Surgeon Fee", amount: surgeonFee, category: "Surgeon" });
      if (assistantFee > 0) charges.push({ name: "Assistant Fee", amount: assistantFee, category: "Assistant" });
      if (anesthesiaFee > 0) charges.push({ name: "Anesthesia Fee", amount: anesthesiaFee, category: "Anaesthetist" });
      if (otCharges > 0) charges.push({ name: "OT Charges", amount: otCharges, category: "OT" });
      if (stayCharges > 0) charges.push({ name: "Hospital Stay Charge", amount: stayCharges, category: "Room" });
      if (miscCharges > 0) charges.push({ name: "Nursing & Consumables", amount: miscCharges, category: "Pharmacy" });

      if (charges.length === 0) {
        charges.push({ name: "Procedure Package Fee", amount: 10000, category: "Misc" });
      }

      const newPreset = {
        id: "custom_" + Date.now(),
        name: name,
        category: category,
        department: category.includes("Urology") ? "Urology" : "General Surgery",
        charges: charges
      };

      if (window.surgeryPresetStore) {
        window.surgeryPresetStore.saveCustomPreset(newPreset);
      }
      this.loadSurgeryPresetsDropdown();
      form.reset();
      this.showNotification(`Added "${name}" package to surgery dropdown list!`, "success");
    });
  }

  setupDatabaseExportImport() {
    const exportBtn = document.getElementById("btnExportFullDatabase");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        this.exportFullDatabase();
      });
    }

    const importInput = document.getElementById("importDatabaseFile");
    if (importInput) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          this.importFullDatabase(file);
          importInput.value = "";
        }
      });
    }
  }

  exportFullDatabase() {
    const database = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      headerSettings: window.headerFooterStore ? window.headerFooterStore.getSettings() : {},
      historyBills: window.historyStore ? window.historyStore.getAllBills() : [],
      customSurgeries: window.surgeryPresetStore ? window.surgeryPresetStore.customPresets : []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    const dateStr = new Date().toISOString().split("T")[0];
    dlAnchor.setAttribute("download", `Hospital_Billing_Database_Backup_${dateStr}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
    this.showNotification("Full Database Backup JSON exported!", "success");
  }

  importFullDatabase(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.headerSettings && window.headerFooterStore) {
          window.headerFooterStore.saveSettings(imported.headerSettings);
        }
        if (Array.isArray(imported.historyBills) && window.historyStore) {
          localStorage.setItem("hospital_billing_history_v1", JSON.stringify(imported.historyBills));
        }
        if (Array.isArray(imported.customSurgeries) && window.surgeryPresetStore) {
          window.surgeryPresetStore.customPresets = imported.customSurgeries;
          window.surgeryPresetStore.persist();
        }
        this.loadSurgeryPresetsDropdown();
        this.renderDoctorsDropdown();
        this.setupHeaderFooterForm();
        this.renderHistoryTable();
        this.renderPdfPreview();
        this.showNotification("Database successfully imported and restored!", "success");
      } catch (err) {
        alert("Failed to parse database backup JSON file.");
      }
    };
    reader.readAsText(file);
  }

  setupThemeToggle() {
    const toggleBtn = document.getElementById("btnThemeToggle");
    const savedTheme = localStorage.getItem("hospital_app_theme") || "light";
    this.setTheme(savedTheme);

    toggleBtn?.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      this.setTheme(newTheme);
      this.showNotification(`Switched to ${newTheme === "light" ? "Light" : "Dark"} Mode`, "info");
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("hospital_app_theme", theme);
    
    const textEl = document.getElementById("themeToggleText");
    if (textEl) {
      textEl.textContent = theme === "light" ? "Light Mode" : "Dark Mode";
    }

    const settings = window.headerFooterStore ? window.headerFooterStore.getSettings() : null;
    this.applyThemeFromSettings(settings);
  }

  applyThemeFromSettings(settings) {
    if (!settings) return;
    const headerColor = settings.headerColor || "#005a5b";
    const accentColor = settings.accentColor || "#005a5b";
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";

    const root = document.documentElement;
    root.style.setProperty("--header-theme-color", headerColor);
    root.style.setProperty("--accent-blue", accentColor);
    root.style.setProperty("--accent-blue-hover", accentColor);

    // Update body background radial gradient to match header theme color and mode
    if (currentTheme === "light") {
      const bgRgba = this.hexToRgba(headerColor, 0.08);
      document.body.style.background = `radial-gradient(circle at top center, ${bgRgba} 0%, #f1f5f9 80%)`;
      document.body.style.backgroundColor = "#f1f5f9";
    } else {
      const bgRgba = this.hexToRgba(headerColor, 0.35);
      document.body.style.background = `radial-gradient(circle at top center, ${bgRgba} 0%, #090d16 75%)`;
      document.body.style.backgroundColor = "#090d16";
    }
  }

  hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string') return `rgba(0, 90, 91, ${alpha})`;
    const cleanHex = hex.replace('#', '').trim();
    let r = 0, g = 90, b = 91;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
      g = parseInt(cleanHex[1] + cleanHex[1], 16) || 90;
      b = parseInt(cleanHex[2] + cleanHex[2], 16) || 91;
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16) || 0;
      g = parseInt(cleanHex.substring(2, 4), 16) || 90;
      b = parseInt(cleanHex.substring(4, 6), 16) || 91;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Setup Navigation Tabs
  setupTabs() {
    const navItems = document.querySelectorAll(".nav-link");
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = item.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll(".nav-link").forEach(el => {
      el.classList.toggle("active", el.getAttribute("data-tab") === tabName);
    });
    document.querySelectorAll(".tab-content").forEach(el => {
      el.classList.toggle("active", el.id === `tab-${tabName}`);
    });

    if (tabName === "history") {
      this.renderHistoryTable();
    } else if (tabName === "preview") {
      this.renderPdfPreview();
    }
  }

  renderDoctorsDropdown() {
    const settings = window.headerFooterStore.getSettings();
    const doctors = settings.doctorsList || ["Dr. Ashutosh Babhulkar"];
    const select = document.getElementById("doctorSelect");
    if (!select) return;

    select.innerHTML = doctors.map(d => `<option value="${d}">${d}</option>`).join('');
    select.innerHTML += `<option value="CUSTOM">-- Custom Doctor Name --</option>`;

    if (!this.billData.doctorName) {
      this.billData.doctorName = settings.defaultDoctor || "Dr. Ashutosh Babhulkar";
    }

    if (doctors.includes(this.billData.doctorName)) {
      select.value = this.billData.doctorName;
    } else {
      select.value = "CUSTOM";
    }

    const nameInput = document.getElementById("doctorName");
    if (nameInput) nameInput.value = this.billData.doctorName;
  }

  renderDoctorSettingsList() {
    const container = document.getElementById("doctorsListContainer");
    if (!container) return;

    const settings = window.headerFooterStore.getSettings();
    const doctors = settings.doctorsList || ["Dr. Ashutosh Babhulkar"];

    container.innerHTML = doctors.map((doc, i) => `
      <div style="display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 8px 14px; border-radius: 6px; border: 1px solid #334155;">
        <span style="font-size: 13px; font-weight: 600; color: #fff;">${doc}</span>
        ${doctors.length > 1 ? `<button class="btn btn-sm btn-secondary btn-delete-doctor" data-index="${i}">Delete</button>` : `<span style="font-size: 11px; color: #94a3b8;">Default</span>`}
      </div>
    `).join('');

    container.querySelectorAll(".btn-delete-doctor").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        const newDocs = doctors.filter((_, i) => i !== idx);
        window.headerFooterStore.saveSettings({ doctorsList: newDocs });
        this.renderDoctorSettingsList();
        this.renderDoctorsDropdown();
      });
    });
  }

  // Check URL / Eka Care Parameters
  checkEkaParams() {
    const ekaData = window.ekaIntegrator.parseUrlParams();
    if (ekaData) {
      if (ekaData.patientName) this.billData.patientName = ekaData.patientName;
      if (ekaData.uhid) this.billData.uhid = ekaData.uhid;
      if (ekaData.age) this.billData.age = ekaData.age;
      if (ekaData.gender) this.billData.gender = ekaData.gender;
      if (ekaData.mobile) this.billData.mobile = ekaData.mobile;
      if (ekaData.doctorName) this.billData.doctorName = ekaData.doctorName;
      else this.billData.doctorName = "Dr. Ashutosh Babhulkar";

      if (ekaData.admissionDate) this.billData.admissionDate = ekaData.admissionDate + "T10:00";
      if (ekaData.diagnosis) this.billData.diagnosis = ekaData.diagnosis;

      // Auto update billNo from date and UHID
      this.billData.billNo = this.deriveBillNo(this.billData.billDate, this.billData.uhid);

      this.populateFormFromData();
      this.renderDoctorsDropdown();
      this.showNotification("Captured patient details from Eka Care!", "success");
    }
  }

  populateFormFromData() {
    document.getElementById("patientName").value = this.billData.patientName;
    document.getElementById("uhid").value = this.billData.uhid;
    document.getElementById("age").value = this.billData.age;
    document.getElementById("gender").value = this.billData.gender;
    document.getElementById("mobile").value = this.billData.mobile;
    document.getElementById("address").value = this.billData.address;
    document.getElementById("doctorName").value = this.billData.doctorName;
    document.getElementById("department").value = this.billData.department;
    document.getElementById("admissionDate").value = this.billData.admissionDate;
    document.getElementById("dischargeDate").value = this.billData.dischargeDate;
    document.getElementById("roomNo").value = this.billData.roomNo;
    document.getElementById("diagnosis").value = this.billData.diagnosis;
    document.getElementById("billNo").value = this.billData.billNo;
    document.getElementById("billDate").value = this.billData.billDate;
    document.getElementById("paymentMode").value = this.billData.paymentMode;
    document.getElementById("paymentStatus").value = this.billData.paymentStatus;
    document.getElementById("discountPercent").value = this.billData.discountPercent;
    document.getElementById("taxPercent").value = this.billData.taxPercent;
    
    const advanceEl = document.getElementById("advancePaid");
    if (advanceEl) advanceEl.value = this.billData.advancePaid;
  }

  loadSurgeryPresetsDropdown() {
    const select = document.getElementById("surgeryPresetSelect");
    if (!select) return;
    select.innerHTML = `<option value="">-- Select Surgery / Procedure Rate Package --</option>`;
    
    const allPresets = window.surgeryPresetStore ? window.surgeryPresetStore.getAllPresets() : window.SURGERY_PRESETS;

    const categories = {};
    allPresets.forEach(preset => {
      const cat = preset.category || "General Surgery";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(preset);
    });

    for (const [catName, presets] of Object.entries(categories)) {
      const optgroup = document.createElement("optgroup");
      optgroup.label = catName;
      presets.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        const totalPkgCost = (p.charges || []).reduce((s, c) => s + (c.amount || 0), 0);
        opt.textContent = `${p.name} (Total: ₹${totalPkgCost.toLocaleString('en-IN')})`;
        optgroup.appendChild(opt);
      });
      select.appendChild(optgroup);
    }
  }

  applySurgeryPreset(presetId) {
    const allPresets = window.surgeryPresetStore ? window.surgeryPresetStore.getAllPresets() : window.SURGERY_PRESETS;
    const preset = allPresets.find(p => p.id === presetId);
    if (!preset) return;

    this.billData.diagnosis = preset.name;
    this.billData.department = preset.department || preset.category || "General Surgery";
    document.getElementById("diagnosis").value = preset.name;
    document.getElementById("department").value = this.billData.department;

    this.billData.chargeItems = preset.charges.map((c, index) => ({
      id: Date.now() + index,
      name: c.name,
      category: c.category || "Misc",
      qty: 1,
      unitPrice: c.amount,
      discount: 0,
      amount: c.amount
    }));

    this.renderChargeTable();
    this.updateCalculations();
    this.renderPdfPreview();
    this.showNotification(`Loaded package preset: ${preset.name}`, "info");
  }

  addPaymentEntry(mode = "Cash", amount = 10000, reference = "", stage = "At Discharge", date = "") {
    if (!this.billData.paymentEntries) this.billData.paymentEntries = [];
    const today = new Date().toISOString().split("T")[0];
    const newEntry = {
      id: Date.now() + Math.random(),
      date: date || today,
      stage: stage || "At Discharge",
      mode: mode || "Cash",
      amount: parseFloat(amount) || 0,
      reference: reference || ""
    };
    this.billData.paymentEntries.push(newEntry);
    this.renderPaymentEntriesTable();
    this.updateCalculations();
    this.renderPdfPreview();
  }

  removePaymentEntry(id) {
    this.billData.paymentEntries = (this.billData.paymentEntries || []).filter(p => p.id !== id);
    this.renderPaymentEntriesTable();
    this.updateCalculations();
    this.renderPdfPreview();
  }

  clearAllPayments() {
    if (confirm("Clear all patient payment entries for this bill?")) {
      this.billData.paymentEntries = [];
      this.billData.advancePaid = 0;
      this.renderPaymentEntriesTable();
      this.updateCalculations();
      this.renderPdfPreview();
      this.showNotification("Cleared all payment entries", "info");
    }
  }

  autoFillBalancePayment() {
    this.updateCalculations();
    const due = this.billData.balanceDue || 0;
    if (due <= 0) {
      this.showNotification("Bill balance is already fully paid!", "info");
      return;
    }
    this.addPaymentEntry("Cash", due, "Discharge Settlement", "At Discharge");
    this.showNotification(`Added ₹${due.toLocaleString('en-IN')} payment at discharge!`, "success");
  }

  printIndividualReceipt(entryId) {
    const entry = (this.billData.paymentEntries || []).find(p => p.id === entryId);
    if (!entry) return;

    const settings = window.headerFooterStore ? window.headerFooterStore.getSettings() : {};
    const data = this.billData;

    const receiptNo = `REC-${(entry.date || '').replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const amountWords = numberToWordsINR(entry.amount);

    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) {
      alert("Please allow popups to print individual payment receipt.");
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${receiptNo}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; max-width: 700px; margin: 0 auto; }
          .receipt-box { border: 2px solid ${settings.headerColor || '#005a5b'}; border-radius: 10px; padding: 25px; background: #fff; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${settings.headerColor || '#005a5b'}; padding-bottom: 15px; margin-bottom: 15px; }
          .h-name { font-size: 20px; font-weight: 800; color: ${settings.headerColor || '#005a5b'}; text-transform: uppercase; margin: 0; }
          .h-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
          .receipt-title { text-align: center; background: #f1f5f9; padding: 6px; font-weight: 800; border-radius: 4px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin-bottom: 20px; }
          .amount-highlight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center; }
          .amount-val { font-size: 22px; font-weight: 800; color: #16a34a; }
          .words { font-size: 12px; font-weight: 600; color: #475569; margin-top: 6px; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; }
          .sig-box { text-align: center; }
          .sig-line { border-top: 1px solid #0f172a; width: 160px; margin-top: 30px; font-weight: 700; font-size: 12px; color: #0f172a; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div>
              <h1 class="h-name">${settings.hospitalName || 'HOSPITAL'}</h1>
              <div class="h-sub">${settings.hospitalAddress || ''} ${settings.hospitalPhone ? '| Ph: ' + settings.hospitalPhone : ''}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; font-size: 13px;">RECEIPT NO: ${receiptNo}</div>
              <div style="font-size: 12px; color: #64748b;">Date: ${entry.date || new Date().toISOString().split('T')[0]}</div>
            </div>
          </div>

          <div class="receipt-title">
            OFFICIAL PAYMENT & ACKNOWLEDGEMENT RECEIPT
          </div>

          <div class="grid">
            <div><strong>Patient Name:</strong> ${data.patientName || 'N/A'}</div>
            <div><strong>UHID / IPD No:</strong> ${data.uhid || 'N/A'}</div>
            <div><strong>Attending Doctor:</strong> ${data.doctorName || 'Dr. Ashutosh Babhulkar'}</div>
            <div><strong>Bill Invoice No:</strong> ${data.billNo || 'N/A'}</div>
            <div><strong>Payment Stage:</strong> <span style="color: #2563eb; font-weight: 700;">${entry.stage || 'Payment'}</span></div>
            <div><strong>Payment Mode:</strong> ${entry.mode || 'Cash'}</div>
          </div>

          ${entry.reference ? `<div style="font-size: 12px; background: #f8fafc; padding: 8px; border-radius: 4px; margin-bottom: 15px;"><strong>Transaction Ref / Notes:</strong> ${entry.reference}</div>` : ''}

          <div class="amount-highlight">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; color: #166534; font-weight: 700;">AMOUNT RECEIVED</div>
              <div class="words">${amountWords}</div>
            </div>
            <div class="amount-val">₹${(parseFloat(entry.amount) || 0).toLocaleString('en-IN')}</div>
          </div>

          <div class="footer">
            <div>
              Thank you! This is an official computer-generated receipt.<br/>
              Generated by Hospital Billing Agent.
            </div>
            <div class="sig-box">
              <div class="sig-line">${settings.signatoryName || 'Authorized Signatory'}</div>
              <div>${settings.signatoryTitle || 'Accounts / Cashier'}</div>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px;" class="no-print">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; font-weight: 700; background: #005a5b; color: #fff; border: none; border-radius: 6px; cursor: pointer;">🖨️ Print Receipt</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  }

  renderPaymentEntriesTable() {
    const tbody = document.getElementById("paymentEntriesTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!this.billData.paymentEntries || this.billData.paymentEntries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 14px;">No payments recorded yet. Click "+ Add Advance" or "+ Add at Discharge" to enter payments.</td></tr>`;
      return;
    }

    const stages = [
      "Advance Payment",
      "At Discharge",
      "Interim Deposit",
      "Insurance / TPA Claim",
      "Refund / Credit"
    ];

    const modes = [
      "Cash", 
      "UPI / GPay / PhonePe", 
      "Credit / Debit Card", 
      "Bank NEFT / RTGS", 
      "Insurance TPA / Cashless", 
      "Cheque",
      "Demand Draft"
    ];

    const today = new Date().toISOString().split("T")[0];

    this.billData.paymentEntries.forEach((entry) => {
      if (!entry.stage) entry.stage = "At Discharge";
      if (!entry.date) entry.date = today;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="width: 140px;">
          <input type="date" class="form-control form-control-sm pay-date" data-id="${entry.id}" value="${entry.date}">
        </td>
        <td style="width: 160px;">
          <select class="form-control form-control-sm pay-stage" data-id="${entry.id}">
            ${stages.map(s => `<option value="${s}" ${entry.stage === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td style="width: 160px;">
          <select class="form-control form-control-sm pay-mode" data-id="${entry.id}">
            ${modes.map(m => `<option value="${m}" ${entry.mode === m ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </td>
        <td style="width: 120px;">
          <input type="number" min="0" step="500" class="form-control form-control-sm pay-amount" data-id="${entry.id}" value="${entry.amount}" style="font-weight: 700; color: #34d399 !important; background: #0b1329;">
        </td>
        <td>
          <input type="text" class="form-control form-control-sm pay-ref" data-id="${entry.id}" value="${entry.reference || ''}" placeholder="Txn ID, Receipt # or notes">
        </td>
        <td style="text-align: center; width: 75px;">
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn-icon btn-print-receipt" data-id="${entry.id}" title="Print Receipt for this Payment" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <button class="btn-icon btn-icon-danger btn-remove-pay" data-id="${entry.id}" title="Remove Payment Entry">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".pay-date").forEach(input => {
      input.addEventListener("change", (e) => {
        const id = parseFloat(e.target.getAttribute("data-id"));
        const item = this.billData.paymentEntries.find(p => p.id === id);
        if (item) {
          item.date = e.target.value;
          this.renderPdfPreview();
        }
      });
    });

    tbody.querySelectorAll(".pay-stage").forEach(select => {
      select.addEventListener("change", (e) => {
        const id = parseFloat(e.target.getAttribute("data-id"));
        const item = this.billData.paymentEntries.find(p => p.id === id);
        if (item) {
          item.stage = e.target.value;
          this.updateCalculations();
          this.renderPdfPreview();
        }
      });
    });

    tbody.querySelectorAll(".pay-mode").forEach(select => {
      select.addEventListener("change", (e) => {
        const id = parseFloat(e.target.getAttribute("data-id"));
        const item = this.billData.paymentEntries.find(p => p.id === id);
        if (item) {
          item.mode = e.target.value;
          this.renderPdfPreview();
        }
      });
    });

    tbody.querySelectorAll(".pay-amount").forEach(input => {
      input.addEventListener("input", (e) => {
        const id = parseFloat(e.target.getAttribute("data-id"));
        const item = this.billData.paymentEntries.find(p => p.id === id);
        if (item) {
          item.amount = Math.max(0, parseFloat(e.target.value) || 0);
          this.updateCalculations();
          this.renderPdfPreview();
        }
      });
    });

    tbody.querySelectorAll(".pay-ref").forEach(input => {
      input.addEventListener("input", (e) => {
        const id = parseFloat(e.target.getAttribute("data-id"));
        const item = this.billData.paymentEntries.find(p => p.id === id);
        if (item) {
          item.reference = e.target.value;
          this.renderPdfPreview();
        }
      });
    });

    tbody.querySelectorAll(".btn-print-receipt").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseFloat(btn.getAttribute("data-id"));
        this.printIndividualReceipt(id);
      });
    });

    tbody.querySelectorAll(".btn-remove-pay").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseFloat(btn.getAttribute("data-id"));
        this.removePaymentEntry(id);
      });
    });
  }

  setupEventListeners() {
    // Form Inputs Change Listeners
    const formFields = [
      "patientName", "age", "gender", "mobile", "address", 
      "department", "admissionDate", "dischargeDate", 
      "roomNo", "diagnosis", "billNo", "paymentMode", "paymentStatus"
    ];

    formFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          this.billData[id] = el.value;
          this.renderPdfPreview();
        });
      }
    });

    // UHID Input -> derive bill number automatically
    const uhidEl = document.getElementById("uhid");
    if (uhidEl) {
      uhidEl.addEventListener("input", (e) => {
        this.billData.uhid = e.target.value;
        this.billData.billNo = this.deriveBillNo(this.billData.billDate, this.billData.uhid);
        document.getElementById("billNo").value = this.billData.billNo;
        this.renderPdfPreview();
      });
    }

    // Bill Date Input -> derive bill number automatically
    const billDateEl = document.getElementById("billDate");
    if (billDateEl) {
      billDateEl.addEventListener("change", (e) => {
        this.billData.billDate = e.target.value;
        this.billData.billNo = this.deriveBillNo(this.billData.billDate, this.billData.uhid);
        document.getElementById("billNo").value = this.billData.billNo;
        this.renderPdfPreview();
      });
    }

    // Doctor Select Dropdown
    const docSelect = document.getElementById("doctorSelect");
    if (docSelect) {
      docSelect.addEventListener("change", (e) => {
        if (e.target.value !== "CUSTOM") {
          this.billData.doctorName = e.target.value;
          document.getElementById("doctorName").value = e.target.value;
        }
        this.renderPdfPreview();
      });
    }

    // Custom Doctor Name Input
    const docNameInput = document.getElementById("doctorName");
    if (docNameInput) {
      docNameInput.addEventListener("input", (e) => {
        this.billData.doctorName = e.target.value;
        this.renderPdfPreview();
      });
    }

    // Advance Paid Input
    const advanceEl = document.getElementById("advancePaid");
    if (advanceEl) {
      advanceEl.addEventListener("input", (e) => {
        this.billData.advancePaid = Math.max(0, parseFloat(e.target.value) || 0);
        this.updateCalculations();
        this.renderPdfPreview();
      });
    }

    // Preset Select
    document.getElementById("surgeryPresetSelect").addEventListener("change", (e) => {
      if (e.target.value) {
        this.applySurgeryPreset(e.target.value);
      }
    });

    // Discounts & Tax
    document.getElementById("discountPercent").addEventListener("input", (e) => {
      this.billData.discountPercent = parseFloat(e.target.value) || 0;
      this.updateCalculations();
      this.renderPdfPreview();
    });

    document.getElementById("taxPercent").addEventListener("input", (e) => {
      this.billData.taxPercent = parseFloat(e.target.value) || 0;
      this.updateCalculations();
      this.renderPdfPreview();
    });

    // Payment Action Buttons
    document.getElementById("btnAddAdvancePay")?.addEventListener("click", () => {
      this.addPaymentEntry("Cash", 10000, "Advance Deposit", "Advance Payment");
    });

    document.getElementById("btnAddDischargePay")?.addEventListener("click", () => {
      const due = this.billData.balanceDue || 10000;
      this.addPaymentEntry("Cash", due, "Discharge Settlement", "At Discharge");
    });

    document.getElementById("btnAutoFillBalance")?.addEventListener("click", () => {
      this.autoFillBalancePayment();
    });

    document.getElementById("btnAddPaymentEntry")?.addEventListener("click", () => {
      this.addPaymentEntry();
    });

    document.getElementById("btnClearAllPayments")?.addEventListener("click", () => {
      this.clearAllPayments();
    });

    // Save Payment Details Buttons
    document.querySelectorAll(".btn-save-payments").forEach(btn => {
      btn.addEventListener("click", () => {
        this.savePaymentDetails();
      });
    });

    // Add Charge Line Item Button
    document.getElementById("btnAddChargeItem").addEventListener("click", () => {
      this.addChargeItem();
    });

    // Add Doctor Button in Settings
    document.getElementById("btnAddDoctor")?.addEventListener("click", () => {
      const input = document.getElementById("newDoctorInput");
      const name = input ? input.value.trim() : "";
      if (!name) return;

      const settings = window.headerFooterStore.getSettings();
      const doctors = settings.doctorsList || ["Dr. Ashutosh Babhulkar"];
      if (!doctors.includes(name)) {
        doctors.push(name);
        window.headerFooterStore.saveSettings({ doctorsList: doctors });
        if (input) input.value = "";
        this.renderDoctorSettingsList();
        this.renderDoctorsDropdown();
        this.showNotification(`Added ${name} to doctors dropdown list!`, "success");
      }
    });

    // Save Bill Button
    document.getElementById("btnSaveBill").addEventListener("click", () => {
      this.saveCurrentBill();
    });

    // Download PDF Button
    document.querySelectorAll(".btn-download-pdf").forEach(btn => {
      btn.addEventListener("click", () => {
        this.downloadBillPdf();
      });
    });

    // Print Bill Button
    document.querySelectorAll(".btn-print-bill").forEach(btn => {
      btn.addEventListener("click", () => {
        this.printBill();
      });
    });

    // Reset Form Button
    document.getElementById("btnResetForm").addEventListener("click", () => {
      this.resetForm();
    });

    // Search History
    document.getElementById("historySearchInput")?.addEventListener("input", (e) => {
      this.renderHistoryTable(e.target.value);
    });

    // Export History
    document.getElementById("btnExportHistory")?.addEventListener("click", () => {
      window.historyStore.exportHistoryJSON();
    });
  }

  addChargeItem(name = "New Service Charge", cost = 1000, discount = 0) {
    const newItem = {
      id: Date.now() + Math.random(),
      name: name,
      category: "Misc",
      qty: 1,
      unitPrice: cost,
      discount: discount,
      amount: Math.max(0, cost - discount)
    };
    this.billData.chargeItems.push(newItem);
    this.renderChargeTable();
    this.updateCalculations();
    this.renderPdfPreview();
  }

  removeChargeItem(id) {
    this.billData.chargeItems = this.billData.chargeItems.filter(item => item.id !== id);
    this.renderChargeTable();
    this.updateCalculations();
    this.renderPdfPreview();
  }

  renderChargeTable() {
    const tbody = document.getElementById("chargeItemsTableBody");
    tbody.innerHTML = "";

    if (this.billData.chargeItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No charge items added yet. Click "+ Add Charge Item" to add new rows.</td></tr>`;
      return;
    }

    this.billData.chargeItems.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="width: 50px; text-align: center; font-weight: 600; color: #94a3b8;">${index + 1}.</td>
        <td>
          <input type="text" class="form-control form-control-sm item-name" data-id="${item.id}" value="${item.name}">
        </td>
        <td style="width: 130px;">
          <input type="number" min="0" step="100" class="form-control form-control-sm item-cost" data-id="${item.id}" value="${item.unitPrice}" style="color: #38bdf8 !important; font-weight: 700; text-align: right; background: #0b1329; font-size: 13.5px;">
        </td>
        <td style="width: 140px;">
          <input type="number" min="0" step="50" class="form-control form-control-sm item-discount" data-id="${item.id}" value="${item.discount || 0}" style="color: #34d399 !important; font-weight: 700; text-align: right; background: #0b1329; font-size: 13.5px;">
        </td>
        <td style="width: 110px; font-weight: 700; text-align: right; color: #f8fafc;" class="item-total-text">
          ₹${(item.amount || 0).toLocaleString('en-IN')}
        </td>
        <td style="width: 45px; text-align: center;">
          <button class="btn-icon btn-icon-danger btn-remove-item" data-id="${item.id}" title="Remove Row">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach row event listeners
    tbody.querySelectorAll(".item-name").forEach(input => {
      input.addEventListener("input", (e) => {
        const id = parseFloat(e.target.getAttribute("data-id"));
        const item = this.billData.chargeItems.find(i => i.id === id);
        if (item) {
          item.name = e.target.value;
          this.renderPdfPreview();
        }
      });
    });

    tbody.querySelectorAll(".item-cost").forEach(input => {
      input.addEventListener("input", (e) => {
        const id = parseFloat(e.target.getAttribute("data-id"));
        const item = this.billData.chargeItems.find(i => i.id === id);
        if (item) {
          item.unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
          item.amount = Math.max(0, item.unitPrice - (item.discount || 0));
          this.updateCalculations();
          const row = e.target.closest("tr");
          if (row) {
            row.querySelector(".item-total-text").textContent = `₹${item.amount.toLocaleString('en-IN')}`;
          }
          this.renderPdfPreview();
        }
      });
    });

    tbody.querySelectorAll(".item-discount").forEach(input => {
      input.addEventListener("input", (e) => {
        const id = parseFloat(e.target.getAttribute("data-id"));
        const item = this.billData.chargeItems.find(i => i.id === id);
        if (item) {
          item.discount = Math.max(0, parseFloat(e.target.value) || 0);
          item.amount = Math.max(0, (item.unitPrice || 0) - item.discount);
          this.updateCalculations();
          const row = e.target.closest("tr");
          if (row) {
            row.querySelector(".item-total-text").textContent = `₹${item.amount.toLocaleString('en-IN')}`;
          }
          this.renderPdfPreview();
        }
      });
    });

    tbody.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseFloat(btn.getAttribute("data-id"));
        this.removeChargeItem(id);
      });
    });
  }

  updateCalculations() {
    const subtotal = this.billData.chargeItems.reduce((sum, item) => sum + (item.unitPrice || 0), 0);
    const totalItemDiscount = this.billData.chargeItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    
    const overallDiscount = ((subtotal - totalItemDiscount) * (this.billData.discountPercent || 0)) / 100;
    const totalDiscount = totalItemDiscount + overallDiscount;
    
    const taxableAmt = subtotal - totalDiscount;
    const taxAmt = (taxableAmt * (this.billData.taxPercent || 0)) / 100;
    const grandTotal = Math.round(taxableAmt + taxAmt);
    
    const advancePayments = (this.billData.paymentEntries || [])
      .filter(p => p.stage === "Advance Payment")
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const otherPayments = (this.billData.paymentEntries || [])
      .filter(p => p.stage !== "Advance Payment")
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    let advancePaid = advancePayments;
    if ((!this.billData.paymentEntries || this.billData.paymentEntries.length === 0) && (this.billData.advancePaid || 0) > 0) {
      advancePaid = parseFloat(this.billData.advancePaid) || 0;
    }

    const paidAtDischarge = otherPayments;
    const totalPaidSoFar = advancePaid + paidAtDischarge;
    const balanceDue = Math.max(0, grandTotal - totalPaidSoFar);

    this.billData.subtotal = subtotal;
    this.billData.totalDiscount = totalDiscount;
    this.billData.grandTotal = grandTotal;
    this.billData.advancePaid = advancePaid;
    this.billData.paidAtDischarge = paidAtDischarge;
    this.billData.totalPaymentsCollected = totalPaidSoFar;
    this.billData.balanceDue = balanceDue;
    this.billData.amountInWords = numberToWordsINR(grandTotal);

    // Auto update status dynamically based on total paid vs grand total
    if (totalPaidSoFar >= grandTotal && grandTotal > 0) {
      this.billData.paymentStatus = (totalPaidSoFar > grandTotal) ? "Overpaid" : "Paid";
    } else if (totalPaidSoFar > 0) {
      this.billData.paymentStatus = "Partially Paid";
    } else {
      this.billData.paymentStatus = "Pending";
    }

    const statusEl = document.getElementById("paymentStatus");
    if (statusEl) statusEl.value = this.billData.paymentStatus;

    const advanceEl = document.getElementById("advancePaid");
    if (advanceEl) advanceEl.value = advancePaid;

    // Update Summary UI Elements
    const elSubtotal = document.getElementById("summarySubtotal");
    if (elSubtotal) elSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

    const elDiscount = document.getElementById("summaryDiscount");
    if (elDiscount) elDiscount.textContent = `- ₹${totalDiscount.toLocaleString('en-IN')}`;

    const elGrandTotal = document.getElementById("summaryGrandTotal");
    if (elGrandTotal) elGrandTotal.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

    const elAdvance = document.getElementById("summaryAdvancePaid");
    if (elAdvance) elAdvance.textContent = `₹${advancePaid.toLocaleString('en-IN')}`;

    const elDischarge = document.getElementById("summaryPaidAtDischarge");
    if (elDischarge) elDischarge.textContent = `₹${paidAtDischarge.toLocaleString('en-IN')}`;

    const elWords = document.getElementById("summaryAmountInWords");
    if (elWords) elWords.textContent = this.billData.amountInWords;

    // Update Payment Section Financial Stats Bar
    const statGt = document.getElementById("payStatGrandTotal");
    if (statGt) statGt.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

    const statAdv = document.getElementById("payStatAdvance");
    if (statAdv) statAdv.textContent = `₹${advancePaid.toLocaleString('en-IN')}`;

    const statDis = document.getElementById("payStatDischarge");
    if (statDis) statDis.textContent = `₹${paidAtDischarge.toLocaleString('en-IN')}`;

    const statCol = document.getElementById("payStatCollected");
    if (statCol) statCol.textContent = `₹${totalPaidSoFar.toLocaleString('en-IN')}`;

    const statBal = document.getElementById("payStatBalance");
    if (statBal) statBal.textContent = `₹${balanceDue.toLocaleString('en-IN')}`;
  }

  setupHeaderFooterForm() {
    const settings = window.headerFooterStore.getSettings();

    const fields = [
      "hospitalName", "hospitalTagline", "hospitalAddress", "hospitalPhone", 
      "hospitalEmail", "hospitalWebsite", "regNo", "gstNo", "headerColor", 
      "accentColor", "watermarkText", "footerTerms", "signatoryName", 
      "signatoryTitle", "emergencyContact", "headerRightBlock",
      "doc1Name", "doc1Degree", "doc1Spec", "doc2Name", "doc2Degree", "doc2Spec"
    ];

    fields.forEach(id => {
      const el = document.getElementById(`set-${id}`);
      if (el) {
        el.value = settings[id] || "";
        el.addEventListener("input", () => {
          window.headerFooterStore.saveSettings({ [id]: el.value });
        });
      }
    });

    const rightHeaderCb = document.getElementById("set-showRightHeaderBlock");
    if (rightHeaderCb) {
      rightHeaderCb.checked = settings.showRightHeaderBlock !== false;
      rightHeaderCb.addEventListener("change", () => {
        window.headerFooterStore.saveSettings({ showRightHeaderBlock: rightHeaderCb.checked });
      });
    }

    const watermarkCb = document.getElementById("set-showWatermark");
    if (watermarkCb) {
      watermarkCb.checked = settings.showWatermark;
      watermarkCb.addEventListener("change", () => {
        window.headerFooterStore.saveSettings({ showWatermark: watermarkCb.checked });
      });
    }

    const stampCb = document.getElementById("set-showStamp");
    if (stampCb) {
      stampCb.checked = settings.showStamp;
      stampCb.addEventListener("change", () => {
        window.headerFooterStore.saveSettings({ showStamp: stampCb.checked });
      });
    }

    const logoInput = document.getElementById("set-logoFile");
    if (logoInput) {
      logoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            window.headerFooterStore.saveSettings({ logoBase64: event.target.result });
            this.showNotification("Hospital Logo updated!", "success");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const sigInput = document.getElementById("set-sigFile");
    if (sigInput) {
      sigInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            window.headerFooterStore.saveSettings({ signatureBase64: event.target.result });
            this.showNotification("Authorized Signature image updated!", "success");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    document.getElementById("btnResetSettings")?.addEventListener("click", () => {
      if (confirm("Reset hospital header & footer settings to default?")) {
        window.headerFooterStore.resetToDefault();
        this.setupHeaderFooterForm();
        this.renderDoctorSettingsList();
        this.renderDoctorsDropdown();
        this.showNotification("Settings reset to default.", "info");
      }
    });
  }

  renderPdfPreview() {
    const previewContainer = document.getElementById("pdfPreviewContainer");
    if (!previewContainer) return;

    const settings = window.headerFooterStore.getSettings();
    const data = this.billData;
    const brandColor = settings.headerColor || '#005a5b';

    const formatDate = (isoStr) => {
      if (!isoStr) return "-";
      try {
        const d = new Date(isoStr);
        return d.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return isoStr;
      }
    };

    const logoHtml = settings.logoBase64 ? 
      `<img src="${settings.logoBase64}" class="pdf-logo-img" alt="Logo" />` : 
      `<div class="pdf-logo-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${brandColor}" stroke-width="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>`;

    const signatureHtml = settings.signatureBase64 ? 
      `<img src="${settings.signatureBase64}" class="pdf-sig-img" alt="Signature" />` : 
      `<div class="pdf-sig-placeholder" contenteditable="true" data-setting-key="signatoryName">${settings.signatoryName || 'Dr. Ashutosh Babhulkar'}</div>`;

    const stampHtml = settings.showStamp ? 
      `<div class="pdf-hospital-stamp">
        <div class="stamp-inner">
          <span contenteditable="true" data-setting-key="hospitalName">${settings.hospitalName}</span>
          <span class="stamp-verified">VERIFIED BILL</span>
        </div>
      </div>` : '';

    const watermarkHtml = settings.showWatermark ? 
      `<div class="pdf-watermark" contenteditable="true" data-setting-key="watermarkText">${settings.watermarkText || 'PAID'}</div>` : '';

    const doc1Name = settings.doc1Name || "डॉ. आशुतोष विजय बाभुळकर";
    const doc1Degree = settings.doc1Degree || "MBBS, MS ( GENERAL SURGERY), FMAS, FIAGES";
    const doc1Spec = settings.doc1Spec || "GENERAL, ENDOSCOPIC AND LAPAROSCOPIC SURGEON";

    const doc2Name = settings.doc2Name || "डॉ. स्नेहल करंजेकर (बाभुळकर)";
    const doc2Degree = settings.doc2Degree || "MBBS, MD ( PATHOLOGY)";
    const doc2Spec = settings.doc2Spec || "CONSULTANT SURGICAL AND CYTOPATHOLOGIST";

    const rightHeaderHtml = (settings.showRightHeaderBlock !== false) ? `
      <div class="pdf-header-right-wrapper">
        <div class="pdf-header-right" style="border-left-color: ${brandColor};">
          <div class="doctor-profile-card">
            <div class="doctor-profile-name" contenteditable="true" data-setting-key="doc1Name" style="color: ${brandColor};">${doc1Name}</div>
            <div class="doctor-profile-degree" contenteditable="true" data-setting-key="doc1Degree" style="color: ${brandColor};">${doc1Degree}</div>
            <div class="doctor-profile-spec" contenteditable="true" data-setting-key="doc1Spec" style="color: ${brandColor};">${doc1Spec}</div>
          </div>
          <div class="doctor-profile-card">
            <div class="doctor-profile-name" contenteditable="true" data-setting-key="doc2Name" style="color: ${brandColor};">${doc2Name}</div>
            <div class="doctor-profile-degree" contenteditable="true" data-setting-key="doc2Degree" style="color: ${brandColor};">${doc2Degree}</div>
            <div class="doctor-profile-spec" contenteditable="true" data-setting-key="doc2Spec" style="color: ${brandColor};">${doc2Spec}</div>
          </div>
        </div>
      </div>
    ` : '';

    // Dynamically build contact line without website
    const contactParts = [];
    if (settings.hospitalPhone && settings.hospitalPhone.trim()) contactParts.push(`Ph: <span contenteditable="true" data-setting-key="hospitalPhone">${settings.hospitalPhone.trim()}</span>`);
    if (settings.hospitalEmail && settings.hospitalEmail.trim()) contactParts.push(`Email: <span contenteditable="true" data-setting-key="hospitalEmail">${settings.hospitalEmail.trim()}</span>`);
    const contactHtml = contactParts.length > 0 ? `<p class="hospital-contact">${contactParts.join(' | ')}</p>` : '';

    const regParts = [];
    if (settings.regNo && settings.regNo.trim()) regParts.push(`Reg No: <strong contenteditable="true" data-setting-key="regNo">${settings.regNo.trim()}</strong>`);
    if (settings.gstNo && settings.gstNo.trim()) regParts.push(`GSTIN: <strong contenteditable="true" data-setting-key="gstNo">${settings.gstNo.trim()}</strong>`);
    const regHtml = regParts.length > 0 ? `<div class="hospital-reg-row">${regParts.join(' | ')}</div>` : '';

    // Charge items rows HTML (Directly Editable on PDF)
    const chargeRowsHtml = data.chargeItems.map((item, idx) => `
      <tr>
        <td style="text-align: center; font-weight: 600;">${idx + 1}.</td>
        <td>
          <div class="item-title" contenteditable="true" data-charge-id="${item.id}" data-charge-key="name">${item.name}</div>
        </td>
        <td contenteditable="true" data-charge-id="${item.id}" data-charge-key="cost" style="text-align: right;">₹${(item.unitPrice || 0).toLocaleString('en-IN')}</td>
        <td contenteditable="true" data-charge-id="${item.id}" data-charge-key="discount" style="text-align: right; color: #059669;">${item.discount > 0 ? `₹${item.discount.toLocaleString('en-IN')}` : '-'}</td>
        <td style="text-align: right; font-weight: 700;">₹${(item.amount || 0).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
      <div class="pdf-paper" id="pdf-bill-document">
        ${watermarkHtml}
        
        <!-- HEADER SECTION -->
        <div class="pdf-header" style="border-top-color: ${settings.headerColor || '#005a5b'}; border-bottom-color: ${settings.headerColor || '#005a5b'};">
          <div class="pdf-header-top">
            <div class="pdf-logo-wrapper">
              ${logoHtml}
            </div>
            <div class="pdf-hospital-details">
              <h1 class="hospital-name" contenteditable="true" data-setting-key="hospitalName" style="color: ${settings.headerColor || '#005a5b'};">${settings.hospitalName}</h1>
              ${settings.hospitalTagline ? `<p class="hospital-tagline" contenteditable="true" data-setting-key="hospitalTagline">${settings.hospitalTagline}</p>` : ''}
              ${settings.hospitalAddress ? `<p class="hospital-address" contenteditable="true" data-setting-key="hospitalAddress">${settings.hospitalAddress}</p>` : ''}
              ${contactHtml}
              ${regHtml}
            </div>
            ${rightHeaderHtml}
          </div>
        </div>

        <!-- BILL TITLE BANNER -->
        <div class="pdf-bill-banner">
          <h2>FINAL SURGICAL & HOSPITALIZATION INVOICE</h2>
        </div>

        <!-- PATIENT & ADMISSION META GRID -->
        <div class="pdf-meta-grid">
          <div class="meta-box">
            <div class="meta-header">PATIENT DETAILS</div>
            <table class="meta-table">
              <tr><td>Patient Name:</td><td><strong contenteditable="true" data-field-key="patientName">${data.patientName || 'N/A'}</strong></td></tr>
              <tr><td>UHID / IPD No:</td><td><strong contenteditable="true" data-field-key="uhid">${data.uhid || 'N/A'}</strong></td></tr>
              <tr><td>Age / Gender:</td><td><span contenteditable="true" data-field-key="age">${data.age || '-'}</span> Yrs / <span contenteditable="true" data-field-key="gender">${data.gender || '-'}</span></td></tr>
              <tr><td>Contact / Mobile:</td><td><span contenteditable="true" data-field-key="mobile">${data.mobile || '-'}</span></td></tr>
              <tr><td>Address:</td><td><span contenteditable="true" data-field-key="address">${data.address || 'N/A'}</span></td></tr>
            </table>
          </div>

          <div class="meta-box">
            <div class="meta-header">BILLING & ADMISSION DETAILS</div>
            <table class="meta-table">
              <tr><td>Invoice / Bill No:</td><td><strong contenteditable="true" data-field-key="billNo">${data.billNo}</strong></td></tr>
              <tr><td>Invoice Date:</td><td><span contenteditable="true" data-field-key="billDate">${data.billDate}</span></td></tr>
              <tr><td>Attending Doctor:</td><td><strong contenteditable="true" data-field-key="doctorName">${data.doctorName || 'Dr. Ashutosh Babhulkar'}</strong></td></tr>
              <tr><td>Department:</td><td><span contenteditable="true" data-field-key="department">${data.department}</span></td></tr>
              <tr><td>Admission Date:</td><td><span contenteditable="true" data-field-key="admissionDate">${formatDate(data.admissionDate)}</span></td></tr>
              <tr><td>Discharge Date:</td><td><span contenteditable="true" data-field-key="dischargeDate">${formatDate(data.dischargeDate)}</span></td></tr>
              <tr><td>Ward / Room No:</td><td><span contenteditable="true" data-field-key="roomNo">${data.roomNo}</span></td></tr>
            </table>
          </div>
        </div>

        <!-- DIAGNOSIS BANNER -->
        <div class="pdf-diagnosis-box">
          <span class="diag-label">Diagnosis / Procedure:</span>
          <span class="diag-value" contenteditable="true" data-field-key="diagnosis">${data.diagnosis || 'Eversion of hydrocele sac'}</span>
        </div>

        <!-- ITEMIZATION CHARGES TABLE -->
        <div class="pdf-table-wrapper">
          <table class="pdf-charges-table">
            <thead>
              <tr style="background-color: ${settings.headerColor || '#1e3a8a'}; color: #ffffff;">
                <th style="width: 50px; text-align: center;">Sr. No.</th>
                <th>Description of Service/Medicine</th>
                <th style="width: 120px; text-align: right;">Cost (₹)</th>
                <th style="width: 140px; text-align: right;">Discount/Return (₹)</th>
                <th style="width: 120px; text-align: right;">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${chargeRowsHtml || `<tr><td colspan="5" style="text-align:center;">No charges itemized.</td></tr>`}
            </tbody>
          </table>
        </div>

        <!-- TOTALS & AMOUNT IN WORDS -->
        <div class="pdf-totals-section">
          <div class="pdf-words-box">
            <div>
              <div class="words-title">TOTAL AMOUNT IN WORDS:</div>
              <div class="words-text" contenteditable="true" data-field-key="amountInWords">${data.amountInWords}</div>
            </div>

            <!-- PAYMENT BREAKDOWN SPLIT TABLE IN PDF -->
            <div class="pdf-payment-split-container">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <div class="pdf-payment-split-title" style="margin: 0; font-weight: 700;">Patient Payments & Settlement Ledger:</div>
                <div class="no-print" style="display: flex; gap: 4px;">
                  <button type="button" class="btn btn-sm btn-primary btn-pdf-add-advance" style="font-size: 10px; padding: 2px 6px;">+ Advance</button>
                  <button type="button" class="btn btn-sm btn-emerald btn-pdf-add-discharge" style="font-size: 10px; padding: 2px 6px;">+ Discharge</button>
                </div>
              </div>
              ${(data.paymentEntries && data.paymentEntries.length > 0) ? `
              <table class="pdf-payment-split-table" style="width: 100%; border-collapse: collapse; font-size: 10px;">
                <thead>
                  <tr style="border-bottom: 1.5px solid #cbd5e1; background: #f8fafc;">
                    <th style="padding: 3px 4px; text-align: left;">Date</th>
                    <th style="padding: 3px 4px; text-align: left;">Stage / Type</th>
                    <th style="padding: 3px 4px; text-align: left;">Mode</th>
                    <th style="padding: 3px 4px; text-align: left;">Txn Ref</th>
                    <th style="padding: 3px 4px; text-align: right;">Amount (₹)</th>
                    <th class="no-print" style="width: 20px; text-align: center;"></th>
                  </tr>
                </thead>
                <tbody>
                  ${data.paymentEntries.map(p => `
                    <tr style="border-bottom: 1px dotted #e2e8f0;">
                      <td contenteditable="true" data-pay-id="${p.id}" data-pay-key="date" style="padding: 3px 4px; color: #475569;">${p.date || '-'}</td>
                      <td contenteditable="true" data-pay-id="${p.id}" data-pay-key="stage" style="padding: 3px 4px;"><span class="badge-stage ${p.stage === 'Advance Payment' ? 'badge-stage-advance' : (p.stage === 'Insurance / TPA Claim' ? 'badge-stage-insurance' : 'badge-stage-discharge')}">${p.stage || 'At Discharge'}</span></td>
                      <td contenteditable="true" data-pay-id="${p.id}" data-pay-key="mode" style="padding: 3px 4px;"><strong>${p.mode}</strong></td>
                      <td contenteditable="true" data-pay-id="${p.id}" data-pay-key="reference" style="padding: 3px 4px; color: #64748b;">${p.reference || '-'}</td>
                      <td contenteditable="true" data-pay-id="${p.id}" data-pay-key="amount" style="padding: 3px 4px; text-align: right; font-weight: 700; color: #0f172a;">₹${(parseFloat(p.amount) || 0).toLocaleString('en-IN')}</td>
                      <td class="no-print" style="width: 20px; text-align: center;">
                        <button class="btn-icon btn-icon-danger btn-pdf-del-pay" data-pay-id="${p.id}" style="width: 18px; height: 18px; line-height: 1; padding: 0; font-size: 12px;" title="Remove Payment Entry">×</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ` : `
              <div style="font-size: 10.5px; color: #b45309; padding: 4px 8px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <span>⚠️ No payments recorded. Balance Due: <strong>₹${(data.balanceDue || 0).toLocaleString('en-IN')}</strong></span>
              </div>
              `}
            </div>

            <div class="payment-meta" style="margin-top: 8px;">
              <div>Status: <strong class="${(data.balanceDue || 0) > 0 ? ((data.advancePaid || 0) > 0 ? 'badge-status-partial' : 'badge-status-pending') : 'badge-status-paid'}" contenteditable="true" data-field-key="paymentStatus">${data.paymentStatus}</strong></div>
            </div>
          </div>

          <div class="pdf-calculation-box">
            <table class="totals-table">
              <tr>
                <td>Total Cost (Gross):</td>
                <td style="text-align: right;">₹${(data.subtotal || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Total Discount/Return:</td>
                <td style="text-align: right; color: #059669;">- ₹${(data.totalDiscount || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr class="grand-total-row" style="background-color: rgba(30, 58, 138, 0.08);">
                <td><strong>NET PAYABLE TOTAL:</strong></td>
                <td style="text-align: right; color: ${settings.headerColor || '#1e3a8a'};"><strong>₹${(data.grandTotal || 0).toLocaleString('en-IN')}</strong></td>
              </tr>
              <tr>
                <td>Advance Paid:</td>
                <td contenteditable="true" data-field-key="advancePaid" style="text-align: right; color: #16a34a; font-weight: 600;">₹${(data.advancePaid || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Paid at Discharge:</td>
                <td style="text-align: right; color: #d97706; font-weight: 600;">₹${(data.paidAtDischarge || 0).toLocaleString('en-IN')}</td>
              </tr>
              ${(data.balanceDue || 0) > 0 ? `
              <tr style="background-color: #fef2f2; font-weight: 700; border-top: 1px solid #fecaca;">
                <td style="color: #dc2626;">BALANCE DUE:</td>
                <td style="text-align: right; color: #dc2626;">₹${(data.balanceDue || 0).toLocaleString('en-IN')} (PENDING)</td>
              </tr>
              ` : `
              <tr style="background-color: #f0fdf4; font-weight: 700; border-top: 1px solid #bbf7d0;">
                <td style="color: #16a34a;">NET STATUS:</td>
                <td style="text-align: right; color: #16a34a;">PAID IN FULL ✓</td>
              </tr>
              `}
            </table>
          </div>
        </div>

        <!-- FOOTER & SIGNATURE SECTION -->
        <div class="pdf-footer">
          <div class="pdf-terms-box">
            ${settings.footerTerms ? `<div class="terms-title">Terms & Declarations:</div>
            <p class="terms-text" contenteditable="true" data-setting-key="footerTerms">${(settings.footerTerms || '').replace(/\n/g, '<br>')}</p>` : ''}
            ${settings.emergencyContact ? `<p class="emergency-note"><strong contenteditable="true" data-setting-key="emergencyContact">${settings.emergencyContact}</strong></p>` : ''}
          </div>

          <div class="pdf-signature-block">
            ${stampHtml}
            <div class="signature-box">
              ${signatureHtml}
              <div class="sig-name" contenteditable="true" data-setting-key="signatoryName">${settings.signatoryName || 'Dr. Ashutosh Babhulkar'}</div>
              <div class="sig-title" contenteditable="true" data-setting-key="signatoryTitle">${settings.signatoryTitle || 'Authorized Signatory'}</div>
            </div>
          </div>
        </div>
        
        <div class="pdf-page-footer">
          <span>This is an official hospital bill generated by Hospital Billing Agent.</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    `;

    previewContainer.innerHTML = html;
    this.attachPdfInlineEditListeners(previewContainer);
  }

  attachPdfInlineEditListeners(container) {
    if (!container) return;

    // Attach Add/Delete Payment Buttons inside PDF
    container.querySelector(".btn-pdf-add-advance")?.addEventListener("click", () => {
      this.addPaymentEntry("Cash", 10000, "Advance Deposit", "Advance Payment");
    });

    container.querySelector(".btn-pdf-add-discharge")?.addEventListener("click", () => {
      const due = this.billData.balanceDue || 10000;
      this.addPaymentEntry("Cash", due, "Discharge Settlement", "At Discharge");
    });

    container.querySelectorAll(".btn-pdf-del-pay").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseFloat(btn.getAttribute("data-pay-id"));
        this.removePaymentEntry(id);
      });
    });

    // Delegated blur / keydown handlers for inline contenteditable fields
    container.querySelectorAll("[contenteditable='true']").forEach(el => {
      el.addEventListener("blur", () => {
        this.handlePdfInlineEdit(el);
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          el.blur();
        }
      });
    });
  }

  handlePdfInlineEdit(el) {
    const rawText = el.innerText.trim();

    // 1. Settings Keys (Hospital Name, Phone, Terms, etc.)
    const settingKey = el.getAttribute("data-setting-key");
    if (settingKey) {
      window.headerFooterStore.saveSettings({ [settingKey]: rawText });
      return;
    }

    // 2. Bill Data Keys (Patient Name, UHID, Doctor, Diagnosis, Advance Paid)
    const fieldKey = el.getAttribute("data-field-key");
    if (fieldKey) {
      if (fieldKey === "advancePaid") {
        const num = parseFloat(rawText.replace(/[^0-9.]/g, "")) || 0;
        this.billData.advancePaid = num;
        const advanceEl = document.getElementById("advancePaid");
        if (advanceEl) advanceEl.value = num;
        this.updateCalculations();
      } else {
        this.billData[fieldKey] = rawText;
        const inputEl = document.getElementById(fieldKey);
        if (inputEl) inputEl.value = rawText;
      }
      return;
    }

    // 3. Itemized Charge Keys (Name, Cost, Discount)
    const chargeId = el.getAttribute("data-charge-id");
    const chargeKey = el.getAttribute("data-charge-key");
    if (chargeId && chargeKey) {
      const id = parseFloat(chargeId);
      const item = this.billData.chargeItems.find(i => i.id === id);
      if (item) {
        if (chargeKey === "name") {
          item.name = rawText;
        } else if (chargeKey === "cost") {
          const num = parseFloat(rawText.replace(/[^0-9.]/g, "")) || 0;
          item.unitPrice = num;
          item.amount = Math.max(0, item.unitPrice - (item.discount || 0));
          this.updateCalculations();
          this.renderChargeTable();
          this.renderPdfPreview();
        } else if (chargeKey === "discount") {
          const num = parseFloat(rawText.replace(/[^0-9.]/g, "")) || 0;
          item.discount = num;
          item.amount = Math.max(0, (item.unitPrice || 0) - item.discount);
          this.updateCalculations();
          this.renderChargeTable();
          this.renderPdfPreview();
        }
      }
      return;
    }

    // 4. Payment Entry Keys (Mode, Stage, Date, Ref, Amount)
    const payId = el.getAttribute("data-pay-id");
    const payKey = el.getAttribute("data-pay-key");
    if (payId && payKey) {
      const id = parseFloat(payId);
      const entry = (this.billData.paymentEntries || []).find(p => p.id === id);
      if (entry) {
        if (payKey === "mode") {
          entry.mode = rawText;
        } else if (payKey === "stage") {
          entry.stage = rawText;
          this.updateCalculations();
          this.renderPaymentEntriesTable();
          this.renderPdfPreview();
        } else if (payKey === "date") {
          entry.date = rawText;
        } else if (payKey === "reference") {
          entry.reference = rawText;
        } else if (payKey === "amount") {
          const num = parseFloat(rawText.replace(/[^0-9.]/g, "")) || 0;
          entry.amount = num;
          this.updateCalculations();
          this.renderPaymentEntriesTable();
          this.renderPdfPreview();
        }
      }
      return;
    }
  }

  savePaymentDetails() {
    this.updateCalculations();
    this.renderPdfPreview();
    if (this.billData.patientName) {
      window.historyStore.saveBill(this.billData);
      this.renderHistoryTable();
      this.showNotification("Payment details & split transactions saved successfully!", "success");
      if (window.cloudDBStore) window.cloudDBStore.pushToCloud();
    } else {
      this.showNotification("Payment details applied to bill calculations!", "info");
    }
  }

  saveCurrentBill() {
    if (!this.billData.patientName) {
      alert("Please enter Patient Name before saving.");
      return;
    }

    const savedRecord = window.historyStore.saveBill(this.billData);
    this.showNotification(`Bill ${savedRecord.billNo} saved successfully!`, "success");
    this.renderHistoryTable();
    if (window.cloudDBStore) window.cloudDBStore.pushToCloud();
  }

  downloadBillPdf() {
    const docElement = document.getElementById("pdf-bill-document");
    if (!docElement) {
      this.renderPdfPreview();
    }
    const targetEl = document.getElementById("pdf-bill-document");
    const filename = `Hospital_Bill_${(this.billData.patientName || 'Patient').replace(/\s+/g, '_')}_${this.billData.billNo}.pdf`;
    
    window.pdfGenerator.downloadPDF(targetEl, { filename });
  }

  printBill() {
    const docElement = document.getElementById("pdf-bill-document");
    window.pdfGenerator.printNative(docElement);
  }

  resetForm() {
    if (confirm("Clear form and reset to default bill values?")) {
      const today = new Date().toISOString().split("T")[0];
      
      this.billData = {
        billNo: this.deriveBillNo(today, ""),
        billDate: today,
        patientName: "",
        uhid: "",
        age: "",
        gender: "Male",
        mobile: "",
        address: "",
        doctorName: "Dr. Ashutosh Babhulkar",
        department: "General & Surgical Care",
        admissionDate: today + "T10:00",
        dischargeDate: today + "T14:00",
        roomNo: "Suite 302",
        diagnosis: "Eversion of hydrocele sac",
        paymentMode: "Cash / Card / UPI",
        paymentStatus: "Paid",
        discountPercent: 0,
        taxPercent: 0,
        advancePaid: 50000,
        paymentEntries: this.getDefaultPayments(),
        chargeItems: this.getDefaultCharges()
      };

      this.populateFormFromData();
      this.renderDoctorsDropdown();
      this.renderPaymentEntriesTable();
      this.renderChargeTable();
      this.updateCalculations();
      this.renderPdfPreview();
      this.showNotification("Form reset.", "info");
    }
  }

  renderHistoryTable(searchQuery = "") {
    const tbody = document.getElementById("historyTableBody");
    if (!tbody) return;

    const bills = window.historyStore.searchBills(searchQuery);
    tbody.innerHTML = "";

    if (bills.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No past bills found.</td></tr>`;
      return;
    }

    bills.forEach(bill => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${bill.billNo}</strong></td>
        <td>${bill.patientName || '-'}</td>
        <td>${bill.uhid || '-'}</td>
        <td>${bill.diagnosis || '-'}</td>
        <td>₹${(bill.grandTotal || 0).toLocaleString('en-IN')}</td>
        <td>${bill.billDate}</td>
        <td>
          <div class="btn-group-sm">
            <button class="btn btn-sm btn-secondary btn-load-bill" data-billno="${bill.billNo}">Load</button>
            <button class="btn btn-sm btn-danger btn-delete-bill" data-billno="${bill.billNo}">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-load-bill").forEach(btn => {
      btn.addEventListener("click", () => {
        const billNo = btn.getAttribute("data-billno");
        const b = window.historyStore.getBill(billNo);
        if (b) {
          this.billData = { ...b };
          this.populateFormFromData();
          this.renderDoctorsDropdown();
          this.renderPaymentEntriesTable();
          this.renderChargeTable();
          this.updateCalculations();
          this.switchTab("billing");
          this.showNotification(`Loaded Bill ${billNo}`, "info");
        }
      });
    });

    tbody.querySelectorAll(".btn-delete-bill").forEach(btn => {
      btn.addEventListener("click", () => {
        const billNo = btn.getAttribute("data-billno");
        if (confirm(`Delete bill ${billNo}?`)) {
          window.historyStore.deleteBill(billNo);
          this.renderHistoryTable(searchQuery);
          this.showNotification(`Deleted bill ${billNo}`, "info");
        }
      });
    });
  }

  showNotification(msg, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new BillingApp();
});

