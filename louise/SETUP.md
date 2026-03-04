# Lou's Pet Care — Setup Guide

## Files
| File | Purpose |
|------|---------|
| `index.html` | Client-facing booking form |
| `admin.html` | Lou's approval dashboard |
| `config.js` | All rates, keys, and settings |
| `apps-script.js` | Google Apps Script backend |

---

## Step 1 — Google Calendar API Key (for availability checking)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Google Calendar API**
3. Credentials → Create Credentials → **API Key**
4. Restrict the key to: Calendar API + your domain (Cloudflare Pages URL)
5. Paste into `config.js` → `googleApiKey`

**Calendar ID:**
- Open Google Calendar → Settings → your calendar → "Calendar ID"
- Make the calendar **public** (Settings → Access permissions → Make available to public)
- Paste into `config.js` → `calendarId`

---

## Step 2 — Google Apps Script (backend)

1. Go to [script.google.com](https://script.google.com) → **New project**
2. Delete default content, paste entire `apps-script.js`
3. Update `LOU_EMAIL` and `LOU_PHONE` at the top of the file
4. Update `CALENDAR_ID` to match your Google Calendar ID
5. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click Deploy → Copy the **Web App URL**
7. Paste URL into `config.js` → `appsScriptUrl`

> The Apps Script automatically creates a Google Sheet called "Lou's Pet Care Bookings" to store all requests.

---

## Step 3 — SMS Notifications (optional, Twilio)

1. Create a [Twilio](https://twilio.com) account (free trial works)
2. Get Account SID, Auth Token, and a Twilio phone number
3. In Apps Script → Project Settings → **Script Properties**, add:
   - `TWILIO_ACCOUNT_SID` = your SID
   - `TWILIO_AUTH_TOKEN` = your token
   - `TWILIO_FROM` = your Twilio number (e.g. +15551234567)

---

## Step 4 — Update Rates

Edit `config.js` — the `boarding`, `daycare`, `dogWalking`, and `dropIn` objects.

```js
boarding: {
  dog: { base: 55, additionalPet: 40 },  // per night
  cat: { base: 35, additionalPet: 25 }
}
```

---

## Step 5 — Deploy to Cloudflare Pages

Push `index.html`, `admin.html`, and `config.js` to your GitHub repo. Cloudflare Pages picks it up automatically.

**Do NOT commit real API keys to GitHub** if your repo is public. Use Cloudflare Pages environment variables or keep `config.js` in `.gitignore` and manage it manually.

---

## How the Booking Flow Works

```
Client fills form → sees quote → accepts → submits
        ↓
Apps Script saves to Google Sheet
        ↓
Lou gets email with Approve / Deny links + SMS
        ↓
Lou approves (via email link or admin dashboard)
        ↓
Event added to Google Calendar
Client receives confirmation email
```

---

## Admin Dashboard

Visit `/admin.html` on your site. Password is set in `config.js` → `adminPassword`.

Lou can approve/deny bookings from here too, and see the embedded Google Calendar.

---

## Adding Venmo Later

The booking data (amount, client name, email) is all available in the Google Sheet and admin dashboard. A Venmo payment request button can be added to the approval confirmation email or admin card with a deep link like:

```
https://venmo.com/?txn=charge&amount=55&note=Pet+Care+Booking
```
