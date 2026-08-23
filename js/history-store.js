/**
 * Bills History Storage Manager
 */

class HistoryStore {
  constructor() {
    this.STORAGE_KEY = "hospital_bills_history_v1";
    this.bills = this.loadBills();
  }

  loadBills() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load bills history", e);
      return [];
    }
  }

  saveBill(billData) {
    const existingIndex = this.bills.findIndex(b => b.billNo === billData.billNo);
    const billRecord = {
      ...billData,
      updatedAt: new Date().toISOString()
    };

    if (!billRecord.createdAt) {
      billRecord.createdAt = new Date().toISOString();
    }

    if (existingIndex >= 0) {
      this.bills[existingIndex] = billRecord;
    } else {
      this.bills.unshift(billRecord);
    }

    this.persist();
    return billRecord;
  }

  getBill(billNo) {
    return this.bills.find(b => b.billNo === billNo);
  }

  getAllBills() {
    return [...this.bills];
  }

  searchBills(query) {
    if (!query) return this.getAllBills();
    const q = query.toLowerCase();
    return this.bills.filter(b => 
      (b.patientName && b.patientName.toLowerCase().includes(q)) ||
      (b.uhid && b.uhid.toLowerCase().includes(q)) ||
      (b.billNo && b.billNo.toLowerCase().includes(q)) ||
      (b.diagnosis && b.diagnosis.toLowerCase().includes(q)) ||
      (b.doctorName && b.doctorName.toLowerCase().includes(q))
    );
  }

  deleteBill(billNo) {
    this.bills = this.bills.filter(b => b.billNo !== billNo);
    this.persist();
  }

  clearHistory() {
    this.bills = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.bills));
    } catch (e) {
      console.error("Failed to persist bills history", e);
    }
  }

  exportHistoryJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.bills, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Hospital_Bills_History_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

window.historyStore = new HistoryStore();
