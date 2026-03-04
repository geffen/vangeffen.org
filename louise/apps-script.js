// ============================================================
// Lou's Pet Care — Google Apps Script
// Deploy as: Web App → Execute as Me → Anyone can access
// ============================================================
//
// SETUP STEPS:
// 1. Go to script.google.com → New Project
// 2. Paste this entire file
// 3. Set LOU_EMAIL and LOU_PHONE below
// 4. Click Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the Web App URL into config.js → appsScriptUrl
//
// SMS via Twilio (optional):
// Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM in Script Properties
// (Project Settings → Script Properties)
// ============================================================

const LOU_EMAIL = "lou@example.com";       // ← Change this
const LOU_PHONE = "+15550000000";           // ← Change this (E.164 format)
const CALENDAR_ID = "primary";             // ← Or your specific calendar ID
const SHEET_NAME  = "Bookings";

const SERVICE_LABELS = {
  boarding:   "Overnight Boarding",
  daycare:    "Day Care",
  dogWalking: "Dog Walking",
  dropIn:     "Drop-In Visit"
};

// ── Entry Points ──────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === "updateBooking") {
      return handleUpdateBooking(data);
    }

    // Default: new booking submission
    return handleNewBooking(data);
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doGet(e) {
  if (e.parameter.action === "getBookings") {
    return handleGetBookings();
  }
  if (e.parameter.action === "approve") {
    return handleApproveLink(e.parameter.id);
  }
  if (e.parameter.action === "deny") {
    return handleDenyLink(e.parameter.id);
  }
  return jsonResponse({ status: "ok" });
}

// ── New Booking ───────────────────────────────────────────────────────────

function handleNewBooking(data) {
  const sheet = getOrCreateSheet();
  const id = Utilities.getUuid();
  const now = new Date().toISOString();

  // Save to sheet
  sheet.appendRow([
    id,
    now,
    "pending",
    data.service || "",
    data.checkin || "",
    data.checkout || "",
    data.petType || "",
    data.petCount || 1,
    data.petNames || "",
    data.petNotes || "",
    data.ownerName || "",
    data.ownerEmail || "",
    data.ownerPhone || "",
    data.quotedAmount || "",
    data.quoteBreakdown || ""
  ]);

  // Send notification to Lou
  sendLouNotification(id, data);

  return jsonResponse({ status: "received", id });
}

// ── Get Bookings ──────────────────────────────────────────────────────────

function handleGetBookings() {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const bookings = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  }).reverse(); // newest first

  return jsonResponse({ bookings });
}

// ── Update Booking ────────────────────────────────────────────────────────

function handleUpdateBooking(data) {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const idCol = 0;    // column A = id
  const statusCol = 2; // column C = status

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === data.id) {
      sheet.getRange(i + 1, statusCol + 1).setValue(data.status);

      const booking = {};
      rows[0].forEach((h, j) => booking[h] = rows[i][j]);
      booking.status = data.status;

      if (data.status === "approved") {
        addToCalendar(booking);
        sendClientApprovalEmail(booking);
      } else if (data.status === "denied") {
        sendClientDenialEmail(booking);
      }

      return jsonResponse({ status: "updated" });
    }
  }

  return jsonResponse({ error: "Booking not found" });
}

// ── Approve/Deny via email link ───────────────────────────────────────────

function handleApproveLink(id) {
  handleUpdateBooking({ id, status: "approved" });
  return HtmlService.createHtmlOutput(
    "<h2>✅ Booking Approved!</h2><p>The client has been notified and the event added to your calendar.</p>"
  );
}

function handleDenyLink(id) {
  handleUpdateBooking({ id, status: "denied" });
  return HtmlService.createHtmlOutput(
    "<h2>❌ Booking Denied</h2><p>The client has been notified.</p>"
  );
}

// ── Email: Lou Notification ───────────────────────────────────────────────

function sendLouNotification(id, d) {
  const scriptUrl = ScriptApp.getService().getUrl();
  const approveUrl = `${scriptUrl}?action=approve&id=${id}`;
  const denyUrl    = `${scriptUrl}?action=deny&id=${id}`;

  const subject = `🐾 New Booking Request — ${d.ownerName} (${d.quotedAmount})`;
  const body = `
    <div style="font-family:sans-serif;max-width:600px;">
      <h2 style="color:#3d2b1f;">New Booking Request</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Service</td><td style="padding:6px 12px;">${SERVICE_LABELS[d.service] || d.service}</td></tr>
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Dates</td><td style="padding:6px 12px;">${d.checkin} → ${d.checkout}</td></tr>
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Client</td><td style="padding:6px 12px;">${d.ownerName}</td></tr>
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Phone</td><td style="padding:6px 12px;">${d.ownerPhone}</td></tr>
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Email</td><td style="padding:6px 12px;">${d.ownerEmail}</td></tr>
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Pets</td><td style="padding:6px 12px;">${d.petCount} ${d.petType}(s) — ${d.petNames}</td></tr>
        ${d.petNotes ? `<tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Notes</td><td style="padding:6px 12px;">${d.petNotes}</td></tr>` : ''}
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Quote</td><td style="padding:6px 12px;color:#c8a44a;font-weight:700;">${d.quotedAmount}</td></tr>
      </table>
      <br/>
      <div style="display:flex;gap:12px;margin-top:8px;">
        <a href="${approveUrl}" style="background:#27ae60;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-right:12px;">✅ Approve</a>
        <a href="${denyUrl}"    style="background:#c0392b;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">❌ Deny</a>
      </div>
      <p style="color:#8a7060;font-size:0.85rem;margin-top:16px;">Or manage all bookings in your <a href="${scriptUrl.replace('/exec','')}">admin dashboard</a>.</p>
    </div>
  `;

  MailApp.sendEmail({ to: LOU_EMAIL, subject, htmlBody: body });

  // SMS (Twilio) — optional
  try {
    const props = PropertiesService.getScriptProperties();
    const sid   = props.getProperty("TWILIO_ACCOUNT_SID");
    const token = props.getProperty("TWILIO_AUTH_TOKEN");
    const from  = props.getProperty("TWILIO_FROM");
    if (sid && token && from) {
      const smsBody = `🐾 New booking: ${d.ownerName}, ${d.service}, ${d.checkin}→${d.checkout}, ${d.quotedAmount}. Reply or check email.`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      UrlFetchApp.fetch(url, {
        method: "post",
        headers: { Authorization: "Basic " + Utilities.base64Encode(`${sid}:${token}`) },
        payload: { To: LOU_PHONE, From: from, Body: smsBody }
      });
    }
  } catch (smsErr) {
    Logger.log("SMS failed: " + smsErr.message);
  }
}

// ── Email: Client Approval ────────────────────────────────────────────────

function sendClientApprovalEmail(b) {
  const subject = `✅ Your booking with Lou's Pet Care is confirmed!`;
  const body = `
    <div style="font-family:sans-serif;max-width:600px;">
      <h2 style="color:#3d2b1f;">Booking Confirmed 🎉</h2>
      <p>Hi ${b.ownerName.split(' ')[0]}, Lou has confirmed your booking!</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Service</td><td style="padding:6px 12px;">${SERVICE_LABELS[b.service] || b.service}</td></tr>
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Dates</td><td style="padding:6px 12px;">${b.checkin} → ${b.checkout}</td></tr>
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Pets</td><td style="padding:6px 12px;">${b.petNames}</td></tr>
        <tr><td style="padding:6px 12px;background:#faf6f0;font-weight:600;">Total</td><td style="padding:6px 12px;color:#c8a44a;font-weight:700;">${b.quotedAmount}</td></tr>
      </table>
      <p>Lou will reach out soon with any additional details. Looking forward to caring for ${b.petNames}!</p>
      <p style="color:#8a7060;font-size:0.85rem;">Questions? Reply to this email or text ${LOU_PHONE}.</p>
    </div>
  `;
  MailApp.sendEmail({ to: b.ownerEmail, subject, htmlBody: body });
}

// ── Email: Client Denial ──────────────────────────────────────────────────

function sendClientDenialEmail(b) {
  const subject = "Update on your Lou's Pet Care request";
  const body = `
    <div style="font-family:sans-serif;max-width:600px;">
      <h2 style="color:#3d2b1f;">Booking Update</h2>
      <p>Hi ${b.ownerName.split(' ')[0]}, unfortunately Lou isn't available for your requested dates (${b.checkin} → ${b.checkout}).</p>
      <p>Please reach out to explore other dates — Lou would love to help!</p>
      <p style="color:#8a7060;font-size:0.85rem;">Contact: ${LOU_EMAIL} | ${LOU_PHONE}</p>
    </div>
  `;
  MailApp.sendEmail({ to: b.ownerEmail, subject, htmlBody: body });
}

// ── Google Calendar ───────────────────────────────────────────────────────

function addToCalendar(b) {
  try {
    const cal = CalendarApp.getCalendarById(CALENDAR_ID) || CalendarApp.getDefaultCalendar();
    const start = new Date(b.checkin + "T12:00:00");
    const end   = new Date(b.checkout + "T12:00:00");
    const title = `🐾 ${SERVICE_LABELS[b.service] || b.service} — ${b.ownerName} (${b.petNames})`;
    const desc  = `Client: ${b.ownerName}\nPhone: ${b.ownerPhone}\nEmail: ${b.ownerEmail}\nPets: ${b.petCount} ${b.petType}(s) — ${b.petNames}\nQuote: ${b.quotedAmount}\n\n${b.petNotes || ''}`;

    cal.createEvent(title, start, end, { description: desc });
  } catch (err) {
    Logger.log("Calendar error: " + err.message);
  }
}

// ── Sheet Helpers ─────────────────────────────────────────────────────────

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("Lou's Pet Care Bookings");
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "id","submittedAt","status","service","checkin","checkout",
      "petType","petCount","petNames","petNotes",
      "ownerName","ownerEmail","ownerPhone","quotedAmount","quoteBreakdown"
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
