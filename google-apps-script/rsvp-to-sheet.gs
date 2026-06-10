/**
 * Wedding RSVP → Google Sheet
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1hFkuDfn5MRkS8CtEd3tO5osdRb6xIzeiYyj38Nt9W2c/
 *
 * Deploy / update:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Paste this file, save
 * 3. Deploy → Manage deployments → Edit → New version → Deploy
 *    - Execute as: Me
 *    - Who has access: Anyone
 */

const SPREADSHEET_ID = "1hFkuDfn5MRkS8CtEd3tO5osdRb6xIzeiYyj38Nt9W2c";
const DEDUP_WINDOW_MS = 2 * 60 * 1000;

function getRsvpSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheets()[0];
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0 && sheet.getRange(1, 1).getValue() === "Timestamp") return;
  sheet.clear();
  sheet.getRange(1, 1, 1, 7).setValues([[
    "Timestamp", "Name", "Email", "Phone", "Attending", "Guests", "Message",
  ]]);
  sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
}

function normalizeName_(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function payloadKey_(data) {
  return [
    normalizeName_(data.name),
    String(data.attending || ""),
    String(data.guests || ""),
    String(data.phone || "").trim(),
    String(data.message || "").trim(),
  ].join("|");
}

function rowToData_(row) {
  const ts = row[0];
  const timestamp = ts instanceof Date ? ts.getTime() : new Date(ts).getTime();
  return {
    timestamp: isNaN(timestamp) ? 0 : timestamp,
    name: row[1],
    phone: row[3],
    attending: row[4],
    guests: String(row[5]),
    message: row[6],
  };
}

function rowValues_(data) {
  return [
    new Date(),
    data.name || "",
    "",
    data.phone || "",
    data.attending || "",
    data.guests || "",
    data.message || "",
  ];
}

function rowName_(row) {
  return normalizeName_(row[1]);
}

function saveRsvp_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getRsvpSheet_();
    ensureHeaders_(sheet);
    const rows = sheet.getDataRange().getValues();
    const name = normalizeName_(data.name);
    if (!name) return { success: false, error: "Name is required." };

    const key = payloadKey_(data);
    const now = Date.now();

    for (let i = 1; i < rows.length; i++) {
      if (rowName_(rows[i]) !== name) continue;
      const existing = rowToData_(rows[i]);
      const age = now - existing.timestamp;
      if (payloadKey_(existing) === key || age < DEDUP_WINDOW_MS) {
        return { success: true, duplicate: true };
      }
      sheet.getRange(i + 1, 1, 1, 7).setValues([rowValues_(data)]);
      return { success: true, updated: true };
    }

    sheet.appendRow(rowValues_(data));
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const data = JSON.parse(raw);
    return jsonResponse_(saveRsvp_(data));
  } catch (err) {
    return jsonResponse_({ success: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, sheet: SPREADSHEET_ID });
}

function testAppend() {
  const sample = {
    name: "Test Guest",
    phone: "",
    attending: "yes",
    guests: "",
    message: "Apps Script test row",
  };
  Logger.log(saveRsvp_(sample));
}
