// ======================================================================
//  סנכרון הלו"ז מ-Google Drive
// ----------------------------------------------------------------------
//  הפונקציה רצה בצד השרת של Netlify (לא בדפדפן), מושכת את ה-Google Sheet
//  שלך ומחזירה אותו לאפליקציה. כי זה קורה בשרת — אין בעיית CORS.
//
//  >>>>>>  כל מה שצריך לעשות: להדביק כאן את הקישור לגיליון  <<<<<<
//
//  איך משיגים את הקישור:
//   • פותחים את הגיליון ב-Google Sheets.
//   • מעתיקים את כל הכתובת מהדפדפן (זה שמתחיל ב-https://docs.google.com/...).
//   • מדביקים אותה בין הגרשיים בשורה למטה (SHEET_LINK), במקום הטקסט שיש שם.
//
//  אפשר להדביק את הקישור המלא — הקוד יחלץ ממנו את המזהה לבד.
//  (אם מעדיפים: אפשר במקום זה להגדיר ב-Netlify משתנה סביבה בשם SHEET_ID.)
//
//  אל תשכחי: בגיליון → Share → "Anyone with the link" → Viewer.
// ======================================================================

const SHEET_LINK = "https://docs.google.com/spreadsheets/d/13cS0eirqfqx0rfu715QtQf2hBycno9oIRcu33pTFR_Y/edit?gid=909782364#gid=909782364";

// ---- מכאן והלאה אין צורך לגעת ----
function extractId(input) {
  const s = String(input || "").trim();
  const m = s.match(/\/d\/([a-zA-Z0-9-_]+)/);        // קישור מלא
  if (m) return m[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(s)) return s;      // הדביקו רק את המזהה
  return "";
}

const SHEET_ID = process.env.SHEET_ID || extractId(SHEET_LINK);

export async function handler() {
  if (!SHEET_ID) {
    return { statusCode: 500, body: "עדיין לא הוגדר קישור לגיליון (SHEET_LINK)." };
  }
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      return { statusCode: 502, body: `Google returned ${res.status}. בדקי שהקישור נכון ושהשיתוף הוא "Anyone with the link".` };
    }
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Cache-Control": "public, max-age=60",
      },
      isBase64Encoded: true,
      body: base64,
    };
  } catch (e) {
    return { statusCode: 500, body: "Failed to fetch the sheet: " + (e && e.message ? e.message : String(e)) };
  }
}
