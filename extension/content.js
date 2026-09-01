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

    // 4. Attending Doctor Name (Targeting Eka Care Dr. prefix & filtering 'Queue')
    let foundDoctor = "";
    const drElements = document.querySelectorAll(".doctor-name, [data-testid='doctor-name'], [class*='doctor'], [class*='text-darwin']");
    for (const el of drElements) {
      const txt = el.textContent.trim();
      if (txt && /Dr\./i.test(txt)) {
        const match = txt.match(/Dr\.\s+[A-Za-z\s.]+/i);
        if (match) {
          foundDoctor = match[0].trim();
          break;
        }
      }
    }

    if (!foundDoctor) {
      const drMatch = (document.body.innerText || "").match(/\b(Dr\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (drMatch) foundDoctor = drMatch[1].trim();
    }

    // Sanitize & default doctor name
    if (!foundDoctor || /queue|visits|dashboard|eka|patient/i.test(foundDoctor) || !/^Dr\./i.test(foundDoctor)) {
      foundDoctor = "Dr. Ashutosh Babhulkar";
    }
    details.doctorName = foundDoctor;

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
    
    // Find all DOM elements containing the word "Diagnosis"
    const allNodes = Array.from(document.querySelectorAll("p, div, span, h1, h2, h3, h4, strong, [class*='text-']"));
    const diagnosisHeadings = allNodes.filter(el => {
      const text = (el.textContent || "").trim();
      return /^diagnosis$/i.test(text) || /^diagnosis$/i.test(text.replace(/[^a-zA-Z]/g, ""));
    });

    for (const heading of diagnosisHeadings) {
      // Traverse up to find container
      let container = heading.parentElement;
      for (let depth = 0; depth < 5; depth++) {
        if (!container || container === document.body) break;

        const items = container.querySelectorAll(".space-y-10 span, .space-y-10 div, span.font-600, .font-600, div > span");
        items.forEach(node => {
          const txt = node.textContent.trim();
          if (txt && !/diagnosis/i.test(txt) && !diagnosisList.includes(txt)) {
            diagnosisList.push(txt);
          }
        });

        if (diagnosisList.length > 0) break;
        container = container.parentElement;
      }

      if (diagnosisList.length > 0) break;
    }

    // HTML fallback if DOM structural query returned empty
    if (diagnosisList.length === 0) {
      const pageHtml = document.body ? document.body.innerHTML : "";
      const diagMatch = pageHtml.match(/Diagnosis[\s\S]*?<div[^>]*class="[^"]*space-y-10[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
      if (diagMatch && diagMatch[1]) {
        const inner = diagMatch[1];
        const spanMatches = inner.match(/<span[^>]*>([\s\S]*?)<\/span>/gi);
        if (spanMatches) {
          spanMatches.forEach(s => {
            const txt = s.replace(/<[^>]+>/g, '').trim();
            if (txt && !/diagnosis/i.test(txt) && !diagnosisList.includes(txt)) {
              diagnosisList.push(txt);
            }
          });
        }
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

    // 7. Procedure Parsing (Only set if details.diagnosis is empty)
    if (!details.diagnosis) {
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
        details.diagnosis = procedureList[0];
      }
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
})();
