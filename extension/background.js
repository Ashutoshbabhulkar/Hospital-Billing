/**
 * Eka Care Patient Extractor - Extension Background Service Worker
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Billing Agent Ext] Extension installed successfully.");
  
  // Context Menu to extract highlighted patient info
  if (typeof chrome !== "undefined" && chrome.contextMenus) {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "generateBillContext",
        title: "Generate Hospital Bill for selection",
        contexts: ["selection"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.warn("Context menu creation note:", chrome.runtime.lastError.message);
        }
      });
    });
  }
});

if (typeof chrome !== "undefined" && chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "generateBillContext" && info.selectionText) {
      const params = new URLSearchParams({
        name: info.selectionText.trim(),
        source: "contextMenu"
      });
      chrome.tabs.create({ url: `http://localhost:3000/?${params.toString()}` });
    }
  });
}

