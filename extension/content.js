/**
 * Eka Care Patient Data Extractor Content Script
 * Scrapes patient EMR details from Eka Care web portal pages.
 */

(function () {
  console.log("[Billing Agent] Content script loaded on Eka Care page.");

  // Configuration for target billing web app URL (GitHub Pages default)
  let billingAppUrl = "https://ashutoshbabhulkar.github.io/Hospital-Billing/";
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["customAppUrl"], (res) => {
      if (res && res.customAppUrl) billingAppUrl = res.customAppUrl;
    });
  }

  // Utility to extract text safely from selectors
  function getText(selectors, parent = document) {
    for (const selector of selectors) {
      const el = parent.querySelector(selector);
      if (el && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }
    return "";
  }

  // Utility to search text patterns in document
  function findTextByRegex(regex) {
    const bodyText = document.body.innerText || "";
    const match = bodyText.match(regex);
    return match ? match[1].trim() : "";
  }

  // Scrape patient details from Eka Care DOM
  function extractEkaPatientDetails() {
    const details = {
      patientName: "",
      uhid: "",
      age: "",
      gender: "",
      mobile: "",
      doctorName: "",
      admissionDate: "",
      dischargeDate: "",
      diagnosis: "",
      roomNo: "",
      address: ""
    };

    // 1. Patient Name
    details.patientName = getText([
      ".patient-name",
      "[data-testid='patient-name']",
      "h1.name",
      ".profile-name",
      ".patient-details-name",
      ".header-patient-name",
      ".patient-info .name"
    ]);

    if (!details.patientName && document.title) {
      const titleMatch = document.title.match(/^EKA\s*-\s*(.*?)(?:\s+Visits|\s+Visits.*|\s*$)/i);
      if (titleMatch && titleMatch[1]) {
        details.patientName = titleMatch[1].trim();
      }
    }

    // 2. Combo parsing for Age, Gender, UHID (e.g., "44y | M | #AAS736")
    const comboElements = document.querySelectorAll("p, span, div");
    for (const el of comboElements) {
      const text = el.textContent.trim();
      // Match pattern like "44y | M  | #AAS736" or "44Y / M / AAS736"
      const comboMatch = text.match(/^([0-9]{1,3})\s*y(?:rs)?\s*[\/|]\s*([A-Za-z]+)\s*[\/|]\s*#?([A-Za-z0-9\/-]+)$/i);
      if (comboMatch) {
        details.age = comboMatch[1].trim();
        const g = comboMatch[2].trim().toUpperCase();
        if (g === "M" || g === "MALE") details.gender = "Male";
        else if (g === "F" || g === "FEMALE") details.gender = "Female";
        else details.gender = comboMatch[2].trim();
        
        details.uhid = comboMatch[3].trim().replace(/^#/, "");
        break;
      }
    }

    // Fallback UHID if combo did not capture it
    if (!details.uhid) {
      details.uhid = getText([
        ".uhid-number",
        "[data-testid='uhid']",
        ".patient-id",
        ".emr-id",
        ".ipd-no"
      ]);

      if (!details.uhid) {
        const bodyText = document.body.innerText || "";
        const uhidMatch = bodyText.match(/(?:UHID|IPD No|Patient ID|CR No|#)\s*[:|-]?\s*([A-Z0-9\/-]{4,20})/i);
        if (uhidMatch) {
          details.uhid = uhidMatch[1].trim().replace(/^#/, "");
        }
      }
    }

    // Fallback Age & Gender if combo missed them
    if (!details.age || !details.gender) {
      const ageGenderText = getText([
        ".age-gender",
        ".patient-age",
        ".profile-subtext",
        ".patient-meta"
      ]);
      
      if (ageGenderText) {
        const ageMatch = ageGenderText.match(/([0-9]{1,3})\s*(?:YRS?|Y|Years?)/i);
        if (ageMatch && !details.age) details.age = ageMatch[1];

        if (!details.gender) {
          if (/male|M/i.test(ageGenderText) && !/female/i.test(ageGenderText)) {
            details.gender = "Male";
          } else if (/female|F/i.test(ageGenderText)) {
            details.gender = "Female";
          }
        }
      }

      if (!details.age) {
        const ageMatch = (document.body.innerText || "").match(/\b([0-9]{1,3})\s*y(?:rs)?\b/i);
        if (ageMatch) details.age = ageMatch[1];
      }
      if (!details.gender) {
        const genderMatch = (document.body.innerText || "").match(/\b(Male|Female|Other)\b/i);
        if (genderMatch) details.gender = genderMatch[1];
      }
    }

    // 3. Mobile Number
    details.mobile = getText([
      ".mobile-number",
      "[data-testid='mobile']",
      ".phone-no"
    ]);
    if (!details.mobile) {
      const mobMatch = (document.body.innerText || "").match(/(?:\+91|Phone|Mob|Mobile)?\s*[:|-]?\s*([6-9][0-9]{9})/);
      if (mobMatch) details.mobile = mobMatch[1];
    }

    // 4. Attending Doctor Name (Targeting Eka Care class & Dr. prefix)
    const drElement = document.querySelector(".text-darwin-neutral-400, [class*='text-darwin-neutral'], .doctor-name, [data-testid='doctor-name']");
    if (drElement) {
      const drText = drElement.textContent.trim();
      const match = drText.match(/Dr\.\s+[A-Za-z\s.]+/i);
      if (match) {
        details.doctorName = match[0].trim();
      } else if (drText) {
        details.doctorName = drText;
      }
    }
    if (!details.doctorName) {
      const drMatch = (document.body.innerText || "").match(/\b(Dr\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (drMatch) details.doctorName = drMatch[1].trim();
    }

    // 5. Admission Date
    details.admissionDate = getText([
      ".admission-date",
      ".date-of-admission",
      ".appointment-date"
    ]);
    if (!details.admissionDate) {
      const dateMatch = (document.body.innerText || "").match(/(?:Admission Date|Admitted On)\s*[:|-]?\s*([0-9]{2,4}[-\/][0-9]{1,2}[-\/][0-9]{2,4})/i);
      if (dateMatch) details.admissionDate = dateMatch[1];
      else details.admissionDate = new Date().toISOString().split("T")[0];
    }

    // 6. Diagnosis Parsing (Eka Care Diagnosis section & Tailwind structure)
    const diagnosisList = [];
    const diagnosisHeadings = Array.from(document.querySelectorAll("p, div, span, h1, h2, h3, h4"))
      .filter(el => el.children.length === 0 && /^Diagnosis$/i.test(el.textContent.trim()));

    for (const heading of diagnosisHeadings) {
      const container = heading.closest(".space-y-8, .bg-white, section, div");
      if (container) {
        const spanElements = container.querySelectorAll(".space-y-10 span.font-600, .space-y-10 div span, span.font-600");
        spanElements.forEach(span => {
          const txt = span.textContent.trim();
          if (txt && !/Diagnosis/i.test(txt) && !diagnosisList.includes(txt)) {
            diagnosisList.push(txt);
          }
        });
        if (diagnosisList.length > 0) break;
      }
    }

    if (diagnosisList.length > 0) {
      details.diagnosis = diagnosisList.join(", ");
    } else {
      details.diagnosis = getText([
        ".diagnosis-name",
        ".chief-complaints",
        ".procedure-name"
      ]);
    }

    // 7. Procedure Parsing (Eka Care procedure table cells)
    const procedureCells = document.querySelectorAll("td.border.border-neutral-8, td.py-16, td[class*='procedure']");
    const procedureList = [];
    procedureCells.forEach(cell => {
      if (cell.closest("thead")) return;
      const txt = cell.textContent.trim();
      if (txt && !/^(?:S\.?No|Particulars|Procedure Name|Action|Status|Date|Diagnosis|Qty|Cost|Total|Sr\.?\s*No\.?)$/i.test(txt) && !procedureList.includes(txt)) {
        procedureList.push(txt);
      }
    });

    if (procedureList.length > 0) {
      const procText = procedureList[0];
      details.diagnosis = procText;
    }


    // Fallback patient name if missing
    if (!details.patientName) {
      const hElements = document.querySelectorAll("h1, h2, h3, strong");
      for (const el of hElements) {
        const txt = el.textContent.trim();
        if (/^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(txt) && txt.length < 40 && !/Eka Care|Dashboard|Doctor|Hospital|Diagnosis/i.test(txt)) {
          details.patientName = txt;
          break;
        }
      }
    }

    return details;
  }


  // Create floating button on Eka Care page for instant bill generation
  function injectFloatingBillingButton() {
    if (document.getElementById("eka-billing-agent-fab")) return;

    const fab = document.createElement("div");
    fab.id = "eka-billing-agent-fab";
    fab.innerHTML = `
      <button id="eka-billing-fab-btn" title="Generate Hospital Surgery Bill">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>Generate Hospital Bill</span>
      </button>
    `;

    // Style the floating button
    const style = document.createElement("style");
    style.textContent = `
      #eka-billing-agent-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      }
      #eka-billing-fab-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        border: none;
        padding: 12px 20px;
        border-radius: 50px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4), 0 8px 10px -6px rgba(37, 99, 235, 0.2);
        transition: all 0.2s ease-in-out;
      }
      #eka-billing-fab-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px -4px rgba(37, 99, 235, 0.5);
        background: linear-gradient(135deg, #1d4ed8, #1e40af);
      }
      #eka-billing-fab-btn:active {
        transform: translateY(0);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(fab);

    document.getElementById("eka-billing-fab-btn").addEventListener("click", () => {
      openBillingAgentWithExtractedData();
    });
  }

  // Open billing agent web app with extracted parameters
  function openBillingAgentWithExtractedData() {
    const data = extractEkaPatientDetails();
    
    // Save to chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ lastExtractedPatient: data });
    }

    const params = new URLSearchParams();
    if (data.patientName) params.append("name", data.patientName);
    if (data.uhid) params.append("uhid", data.uhid);
    if (data.age) params.append("age", data.age);
    if (data.gender) params.append("gender", data.gender);
    if (data.mobile) params.append("mobile", data.mobile);
    if (data.doctorName) params.append("doctor", data.doctorName);
    if (data.admissionDate) params.append("admission", data.admissionDate);
    if (data.diagnosis) params.append("diagnosis", data.diagnosis);
    params.append("source", "ekacare");

    // Open target billing app window
    const targetUrl = `${billingAppUrl}?${params.toString()}`;
    window.open(targetUrl, "_blank");
  }

  // Listen to messages from extension popup
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "extractPatientData") {
        const details = extractEkaPatientDetails();
        sendResponse({ status: "success", data: details });
      } else if (request.action === "openBillingApp") {
        openBillingAgentWithExtractedData();
        sendResponse({ status: "opened" });
      }
      return true;
    });
  }

  // Listen for custom postMessage requests from local billing app
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "REQUEST_EKA_PATIENT_DATA") {
      const data = extractEkaPatientDetails();
      window.postMessage({ type: "RESPONSE_EKA_PATIENT_DATA", data }, "*");
    }
  });

  // Inject floating button after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectFloatingBillingButton);
  } else {
    injectFloatingBillingButton();
  }
})();
