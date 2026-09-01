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

      const activeTab = tabs[0];
      
      // Try sending message to content script
      chrome.tabs.sendMessage(activeTab.id, { action: "extractPatientData" }, (response) => {
        if (!chrome.runtime.lastError && response && response.data) {
          populateForm(response.data);
          statusText.textContent = "✓ Patient details captured successfully!";
          return;
        }

        // Programmatic fallback script injection if content.js wasn't pre-loaded
        if (chrome.scripting && activeTab.id) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ["content.js"]
          }, () => {
            if (chrome.runtime.lastError) {
              console.warn("Script injection note:", chrome.runtime.lastError.message);
            }
            // Retry extraction after injection
            setTimeout(() => {
              chrome.tabs.sendMessage(activeTab.id, { action: "extractPatientData" }, (retryRes) => {
                if (retryRes && retryRes.data) {
                  populateForm(retryRes.data);
                  statusText.textContent = "✓ Patient details captured successfully!";
                } else {
                  // Fallback to last extracted patient record in chrome storage
                  chrome.storage.local.get(["lastExtractedPatient"], (result) => {
                    if (result && result.lastExtractedPatient) {
                      populateForm(result.lastExtractedPatient);
                      statusText.textContent = "Loaded last saved patient details";
                    } else {
                      statusText.textContent = "Ready to generate bill. Enter details or click 'Create Bill'.";
                    }
                  });
                }
              });
            }, 150);
          });
        } else {
          statusText.textContent = "Ready to generate bill.";
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

    let doc = (data.doctorName || "").trim();
    if (!doc || /queue|visits|dashboard|eka|patient/i.test(doc) || !/^Dr\./i.test(doc)) {
      doc = "Dr. Ashutosh Babhulkar";
    }
    document.getElementById("doctorName").value = doc;

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
