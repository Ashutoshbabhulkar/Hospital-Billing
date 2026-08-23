/**
 * Surgery & Medical Procedure Presets with Pre-configured Charges
 * Configured from Official Hospital Rate Chart
 */

const SURGERY_PRESETS = [
  // ==================== GENERAL SURGERY (OPEN & MINOR) ====================
  {
    id: "open-cholecystectomy",
    name: "Open Cholecystectomy",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 5,
    charges: [
      { name: "Surgeon Fee", amount: 12000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3600, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (5 Days)", amount: 12500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 9000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 8000, category: "Pharmacy" }
    ]
  },
  {
    id: "open-appendectomy",
    name: "Open Appendectomy",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 5,
    charges: [
      { name: "Surgeon Fee", amount: 10000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (5 Days)", amount: 12500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 7000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 5000, category: "Pharmacy" }
    ]
  },
  {
    id: "open-inguinal-hernia",
    name: "Inguinal Hernia Repair (Open, mesh)",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 10000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables & Mesh", amount: 6000, category: "Pharmacy" }
    ]
  },
  {
    id: "umbilical-hernia-repair",
    name: "Umbilical Hernia Repair",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 12000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3600, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 6000, category: "Pharmacy" }
    ]
  },
  {
    id: "incisional-ventral-hernia",
    name: "Incisional / Ventral Hernia Repair",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 12000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3600, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 6000, category: "Pharmacy" }
    ]
  },
  {
    id: "hydrocele-surgery",
    name: "Eversion of Hydrocele Sac / Hydrocele Surgery (Jaboulay / Lord's)",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 7000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 2100, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "orchidopexy",
    name: "Orchidopexy (for undescended testis)",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 8000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 2400, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "hemorrhoidectomy",
    name: "Hemorrhoidectomy (Conventional)",
    department: "Proctology & General Surgery",
    category: "General Surgery",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 8000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 2400, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "fistulectomy",
    name: "Fistulectomy / Fistulotomy",
    department: "Proctology & General Surgery",
    category: "General Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 10000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "pilonidal-sinus",
    name: "Pilonidal Sinus Excision",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 8000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 2400, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "perianal-abscess",
    name: "Perianal Abscess Drainage",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 5000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 1500, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "fibroadenoma-excision",
    name: "Fibroadenoma Excision",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 8000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 2400, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 2000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 3000, category: "Pharmacy" }
    ]
  },
  {
    id: "breast-abscess-drainage",
    name: "Breast Abscess Incision & Drainage",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 3000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 900, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 1000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 2000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 3000, category: "Pharmacy" }
    ]
  },
  {
    id: "breast-lump-biopsy",
    name: "Breast Lump Biopsy",
    department: "General Surgery",
    category: "Minor Procedure",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 1000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 300, category: "Assistant" },
      { name: "OT Charges", amount: 1000, category: "OT" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 2000, category: "Pharmacy" }
    ]
  },
  {
    id: "lipoma-excision",
    name: "Lipoma Excision",
    department: "General Surgery",
    category: "Minor Procedure",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 2500, category: "Surgeon" },
      { name: "Assistant Fee", amount: 750, category: "Assistant" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 2000, category: "Pharmacy" }
    ]
  },
  {
    id: "sebaceous-cyst-excision",
    name: "Sebaceous Cyst Excision",
    department: "General Surgery",
    category: "Minor Procedure",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 2500, category: "Surgeon" },
      { name: "Assistant Fee", amount: 750, category: "Assistant" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 2000, category: "Pharmacy" }
    ]
  },
  {
    id: "infected-wound-debridement",
    name: "Infected Wound Debridement",
    department: "General Surgery",
    category: "Minor Procedure",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 1000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 300, category: "Assistant" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 2000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 2000, category: "Pharmacy" }
    ]
  },
  {
    id: "neck-lump-excision",
    name: "Neck Lump Excision",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 2500, category: "Surgeon" },
      { name: "Assistant Fee", amount: 750, category: "Assistant" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 2000, category: "Pharmacy" }
    ]
  },
  {
    id: "diabetic-foot-debridement",
    name: "Diabetic Foot Debridement",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 3000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 900, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 2000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 3000, category: "Pharmacy" }
    ]
  },
  {
    id: "toe-finger-amputation",
    name: "Toe / Finger Amputation",
    department: "General Surgery",
    category: "General Surgery",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 4000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 1200, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 2000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 3000, category: "Pharmacy" }
    ]
  },
  {
    id: "varicose-vein-ligation",
    name: "Varicose Vein Ligation (Open)",
    department: "Vascular & General Surgery",
    category: "General Surgery",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 5000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 1500, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 3000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "circumcision-adult",
    name: "Circumcision (Adult)",
    department: "Urology & General Surgery",
    category: "General Surgery",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 5000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 1500, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 2000, category: "OT" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 2000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "foreign-body-removal",
    name: "Foreign Body Removal (Subcutaneous)",
    department: "General Surgery",
    category: "Minor Procedure",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 2000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 600, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 500, category: "Anaesthetist" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 1000, category: "Pharmacy" }
    ]
  },

  // ==================== LAPAROSCOPIC SURGERY ====================
  {
    id: "lap-cholecystectomy",
    name: "Laparoscopic Cholecystectomy",
    department: "Laparoscopic Surgery",
    category: "Laparoscopic Surgery",
    defaultStayDays: 5,
    charges: [
      { name: "Surgeon Fee", amount: 20000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 6000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 7000, category: "Anaesthetist" },
      { name: "OT & Laparoscopy Charges", amount: 7000, category: "OT" },
      { name: "Hospital Stay Charge (5 Days)", amount: 12500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 6000, category: "Pharmacy" },
      { name: "OT Consumables & Instruments", amount: 10000, category: "Pharmacy" }
    ]
  },
  {
    id: "lap-appendectomy",
    name: "Laparoscopic Appendectomy",
    department: "Laparoscopic Surgery",
    category: "Laparoscopic Surgery",
    defaultStayDays: 5,
    charges: [
      { name: "Surgeon Fee", amount: 15000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 4500, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 7000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (5 Days)", amount: 12500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 6000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 10000, category: "Pharmacy" }
    ]
  },
  {
    id: "diagnostic-laparoscopy",
    name: "Diagnostic Laparoscopy",
    department: "Laparoscopic Surgery",
    category: "Laparoscopic Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 10000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 7000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 6000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 10000, category: "Pharmacy" }
    ]
  },
  {
    id: "lap-inguinal-hernia",
    name: "Laparoscopic Inguinal Hernia Repair (TAPP / TEP)",
    department: "Laparoscopic Surgery",
    category: "Laparoscopic Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 20000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 6000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 7000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 7000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 6000, category: "Pharmacy" },
      { name: "OT Consumables & Mesh", amount: 10000, category: "Pharmacy" }
    ]
  },
  {
    id: "lap-umbilical-hernia",
    name: "Laparoscopic Umbilical / Ventral Hernia Repair",
    department: "Laparoscopic Surgery",
    category: "Laparoscopic Surgery",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 20000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 6000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 7000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 7000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 6000, category: "Pharmacy" },
      { name: "OT Consumables & Mesh", amount: 10000, category: "Pharmacy" }
    ]
  },

  // ==================== UROLOGY ====================
  {
    id: "turp",
    name: "TURP (Transurethral Resection of Prostate)",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 15000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 6000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 5000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 7000, category: "Pharmacy" }
    ]
  },
  {
    id: "ursl-less-1cm",
    name: "URSL < 1CM",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 13000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 5200, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 5000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 7000, category: "Pharmacy" }
    ]
  },
  {
    id: "ursl-greater-1cm",
    name: "URSL > 1CM",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 15000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 6000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 5000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 7000, category: "Pharmacy" }
    ]
  },
  {
    id: "pcnl-less-2cms",
    name: "PCNL < 2CMS",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 18000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 7200, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 5000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 7000, category: "Pharmacy" }
    ]
  },
  {
    id: "pcnl-2-4cms",
    name: "PCNL 2-4CMS",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 3,
    charges: [
      { name: "Surgeon Fee", amount: 25000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 10000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (3 Days)", amount: 7500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 5000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 7000, category: "Pharmacy" }
    ]
  },
  {
    id: "dj-stenting-ul",
    name: "DJ STENTING UL",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 8000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3200, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 3000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 3000, category: "Pharmacy" }
    ]
  },
  {
    id: "dj-stenting-bl",
    name: "DJ STENTING BL",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 10000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 4000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 3000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 3000, category: "Pharmacy" }
    ]
  },
  {
    id: "dj-stent-removal",
    name: "DJ STENT REMOVAL",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 3000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 1200, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 3000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 3000, category: "Pharmacy" }
    ]
  },
  {
    id: "cystoscopy",
    name: "Cystoscopy",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 1,
    charges: [
      { name: "Surgeon Fee", amount: 5000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 2000, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (1 Day)", amount: 2500, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 1000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  },
  {
    id: "viu",
    name: "VIU (Visual Internal Urethrotomy)",
    department: "Urology",
    category: "Urology",
    defaultStayDays: 2,
    charges: [
      { name: "Surgeon Fee", amount: 9000, category: "Surgeon" },
      { name: "Assistant Fee", amount: 3600, category: "Assistant" },
      { name: "Anesthesia Fee", amount: 5000, category: "Anaesthetist" },
      { name: "OT Charges", amount: 5000, category: "OT" },
      { name: "Hospital Stay Charge (2 Days)", amount: 5000, category: "Room" },
      { name: "Nursing Charges", amount: 2000, category: "Nursing" },
      { name: "Medicine Ward", amount: 2000, category: "Pharmacy" },
      { name: "OT Consumables", amount: 4000, category: "Pharmacy" }
    ]
  }
];

if (typeof window !== "undefined") {
  window.SURGERY_PRESETS = SURGERY_PRESETS;
}

