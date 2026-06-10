/**
 * Wedding RSVP → Google Sheet
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1hFkuDfn5MRkS8CtEd3tO5osdRb6xIzeiYyj38Nt9W2c/
 *
 * Deploy / update:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Paste this file, save
 * 3. Deploy → Manage deployments → Edit → New version → Deploy
 *    (or New deployment for first time)
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

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase();
}

function payloadKey_(data) {
  return [
    normalizeEmail_(data.email),
    String(data.name || "").trim().toLowerCase(),
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
    email: row[2],
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
    data.email || "",
    data.phone || "",
    data.attending || "",
    data.guests || "",
    data.message || "",
  ];
}

function saveRsvp_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getRsvpSheet_();
    ensureHeaders_(sheet);
    const rows = sheet.getDataRange().getValues();
    const email = normalizeEmail_(data.email);
    const key = payloadKey_(data);
    const now = Date.now();

    for (let i = 1; i < rows.length; i++) {
      if (normalizeEmail_(rows[i][2]) !== email) continue;
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
    if (!normalizeEmail_(data.email)) {
      return jsonResponse_({ success: false, error: "Email is required." });
    }
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
    email: "test@example.com",
    phone: "555-0100",
    attending: "yes",
    guests: "2",
    message: "Apps Script test row",
  };
  Logger.log(saveRsvp_(sample));
}
