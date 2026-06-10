RSVP → Google Sheet setup (one time, ~2 minutes)

1. Open your sheet:
   https://docs.google.com/spreadsheets/d/1hFkuDfn5MRkS8CtEd3tO5osdRb6xIzeiYyj38Nt9W2c/

2. Extensions → Apps Script

3. Delete any default code and paste all of rsvp-to-sheet.gs

4. Save the project (name it "Wedding RSVP" or similar)

5. Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Deploy → Authorize when prompted

6. Copy the Web app URL (ends with /exec)

7. In script.js set:
   rsvpSheetEndpoint: "YOUR_WEB_APP_URL_HERE"

8. Push the site to GitHub Pages again.

When you change rsvp-to-sheet.gs later:
- Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy
- The Web app URL stays the same.

Duplicate protection (in the script):
- Blocks double-clicks within 2 minutes for the same email
- Blocks identical submissions for the same email
- Updates the existing row if the same email submits again later with changes

Optional: In Apps Script, run testAppend once to verify a row appears in the sheet.
