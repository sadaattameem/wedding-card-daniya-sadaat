/**
 * Wedding RSVP → Google Sheet
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1hFkuDfn5MRkS8CtEd3tO5osdRb6xIzeiYyj38Nt9W2c/
 *
 * Deploy once:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Paste this file, save
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web app URL into script.js → WEDDING.rsvpSheetEndpoint
 */

const SPREADSHEET_ID = "1hFkuDfn5MRkS8CtEd3tO5osdRb6xIzeiYyj38Nt9W2c";

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

function appendRsvpRow_(data) {
  const sheet = getRsvpSheet_();
  ensureHeaders_(sheet);
  sheet.appendRow([
    new Date(),
    data.name || "",
    data.email || "",
    data.phone || "",
    data.attending || "",
    data.guests || "",
    data.message || "",
  ]);
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
    appendRsvpRow_(data);
    return jsonResponse_({ success: true });
  } catch (err) {
    return jsonResponse_({ success: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, sheet: SPREADSHEET_ID });
}

function testAppend() {
  appendRsvpRow_({
    name: "Test Guest",
    email: "test@example.com",
    phone: "555-0100",
    attending: "yes",
    guests: "2",
    message: "Apps Script test row",
  });
}
