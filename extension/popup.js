document.addEventListener("DOMContentLoaded", () => {
  const statusText = document.getElementById("status-text");
  let billingAppUrl = "https://ashutoshbabhulkar.github.io/Hospital-Billing/";
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["customAppUrl"], (res) => {
      if (res && res.customAppUrl) billingAppUrl = res.customAppUrl;
    });
  }

  function scanTab() {
    statusText.textContent = "Scanning active tab...";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        statusText.textContent = "No active tab found";
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { action: "extractPatientData" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          statusText.textContent = "Open an Eka Care patient page to extract";
          // Try loading last extracted from local storage fallback
          chrome.storage.local.get(["lastExtractedPatient"], (result) => {
            if (result.lastExtractedPatient) {
              populateForm(result.lastExtractedPatient);
              statusText.textContent = "Loaded last saved patient details";
            }
          });
          return;
        }

        if (response && response.data) {
          populateForm(response.data);
          statusText.textContent = "Patient details captured from Eka Care!";
        }
      });
    });
  }

  function populateForm(data) {
    if (data.patientName) document.getElementById("patientName").value = data.patientName;
    if (data.uhid) document.getElementById("uhid").value = data.uhid;
    if (data.mobile) document.getElementById("mobile").value = data.mobile;
    if (data.age) document.getElementById("age").value = data.age;
    if (data.gender) document.getElementById("gender").value = data.gender;
    if (data.doctorName) document.getElementById("doctorName").value = data.doctorName;
    if (data.diagnosis) document.getElementById("diagnosis").value = data.diagnosis;
  }

  document.getElementById("btn-rescan").addEventListener("click", scanTab);

  document.getElementById("btn-create-bill").addEventListener("click", () => {
    const data = {
      name: document.getElementById("patientName").value,
      uhid: document.getElementById("uhid").value,
      mobile: document.getElementById("mobile").value,
      age: document.getElementById("age").value,
      gender: document.getElementById("gender").value,
      doctor: document.getElementById("doctorName").value,
      diagnosis: document.getElementById("diagnosis").value,
      source: "ekacare"
    };

    const params = new URLSearchParams();
    for (const key in data) {
      if (data[key]) params.append(key, data[key]);
    }

    const targetUrl = `${billingAppUrl}?${params.toString()}`;
    chrome.tabs.create({ url: targetUrl });
  });

  scanTab();
});
