/**
 * Eka Care & URL Parameter Integrator Module
 */

class EkaIntegrator {
  constructor() {
    this.extractedData = null;
  }

  // Parse URL search parameters
  parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("name") && !urlParams.has("uhid") && !urlParams.has("source")) {
      return null;
    }

    const data = {
      patientName: urlParams.get("name") || "",
      uhid: urlParams.get("uhid") || "",
      age: urlParams.get("age") || "",
      gender: urlParams.get("gender") || "Male",
      mobile: urlParams.get("mobile") || "",
      doctorName: urlParams.get("doctor") || "",
      admissionDate: urlParams.get("admission") || new Date().toISOString().split("T")[0],
      dischargeDate: urlParams.get("discharge") || new Date().toISOString().split("T")[0],
      diagnosis: urlParams.get("diagnosis") || "",
      roomNo: urlParams.get("room") || "",
      source: urlParams.get("source") || "URL"
    };

    this.extractedData = data;
    return data;
  }

  // Listen for messages from extension content script / parent window
  listenForExtensionMessages(callback) {
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "RESPONSE_EKA_PATIENT_DATA") {
        this.extractedData = event.data.data;
        if (callback) callback(event.data.data);
      }
    });

    // Check Chrome extension storage if available
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["lastExtractedPatient"], (result) => {
        if (result.lastExtractedPatient && callback) {
          callback(result.lastExtractedPatient);
        }
      });
    }
  }

  // Trigger postMessage request to active window / extension
  requestDataFromPage() {
    window.postMessage({ type: "REQUEST_EKA_PATIENT_DATA" }, "*");
  }
}

window.ekaIntegrator = new EkaIntegrator();
