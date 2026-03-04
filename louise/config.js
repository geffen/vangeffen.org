// ============================================================
// Lou's Pet Care — Configuration
// Edit this file to update rates, contact info, and API keys
// ============================================================

const CONFIG = {
  // --- Business Info ---
  businessName: "Lou's Pet Care",
  ownerName: "Lou",
  ownerEmail: "lou@example.com",       // Lou's notification email
  ownerPhone: "+15550000000",           // Lou's phone for SMS (Twilio)

  // --- Google Calendar ---
  calendarId: "YOUR_CALENDAR_ID@group.calendar.google.com",
  googleApiKey: "YOUR_GOOGLE_API_KEY",

  // --- Apps Script Endpoint ---
  // After deploying your Apps Script, paste the Web App URL here
  appsScriptUrl: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",

  // --- Admin Page Password (simple protection) ---
  adminPassword: "changeme123",

  // --- Pricing ---
  // Flat rates per night/day for boarding & daycare
  boarding: {
    dog: {
      base: 55,         // per night, 1 dog
      additionalPet: 40 // per night, each additional dog
    },
    cat: {
      base: 35,
      additionalPet: 25
    }
  },
  daycare: {
    dog: {
      base: 35,
      additionalPet: 25
    },
    cat: {
      base: 25,
      additionalPet: 18
    }
  },
  // Per 30-min session rates
  dogWalking: {
    base: 20,           // 1 dog
    additionalPet: 10
  },
  dropIn: {
    base: 18,
    additionalPet: 8
  }
};
