import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Camera, Sparkles, Utensils, UtensilsCrossed, CalendarCheck, Ticket, Bus,
  ShoppingBag, Star, MapPin, Clock, Check, X, Plus, Settings, ChevronLeft,
  ChevronRight, Cloud, Sun, CloudRain, CloudSnow, CloudFog, CloudLightning,
  CloudDrizzle, Wallet, Backpack, Info, Trash2, Pencil, ExternalLink, Home,
  CalendarDays, Plane, ShieldAlert, Wifi, Landmark, ChevronDown, StickyNote,
  Volume2, Languages, Send, MessageCircle, FileSpreadsheet, RefreshCw, Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* ====================  EDIT THESE TO CUSTOMIZE  ==================== */
/* ------------------------------------------------------------------ */

const TRIP_START = "2026-09-05";
const TRIP_END = "2026-10-07";

// ✏️ To change the names shown in the header, edit the two lines below.
const DEFAULT_NAME_1 = "מורן";
const DEFAULT_NAME_2 = "אור";

/* ------------------------------------------------------------------ */
/* Weather locations (unique physical coordinates, used for forecasts) */
/* ------------------------------------------------------------------ */

const WEATHER_CITIES = [
  { id: "tokyo", label: "טוקיו", lat: 35.6762, lon: 139.6503 },
  { id: "osaka", label: "אוסקה", lat: 34.6937, lon: 135.5023 },
  { id: "kyoto", label: "קיוטו", lat: 35.0116, lon: 135.7681 },
  { id: "seoul", label: "סיאול", lat: 37.5665, lon: 126.978 },
  { id: "kobe", label: "קובה", lat: 34.6901, lon: 135.1955 },
  { id: "kanazawa", label: "קנזאווה", lat: 36.5613, lon: 136.6562 },
  { id: "shirakawago", label: "שירקאווה גו", lat: 36.2578, lon: 136.9066 },
  { id: "takayama", label: "טקיאמה", lat: 36.1461, lon: 137.2521 },
  { id: "kawaguchiko", label: "קוואגוצ'יקו / פוג'י", lat: 35.5, lon: 138.7667 },
  { id: "hakone", label: "האקונה", lat: 35.2323, lon: 139.1069 },
];
const weatherCityById = (id) => WEATHER_CITIES.find((c) => c.id === id);

/* ------------------------------------------------------------------ */
/* Places (every destination selectable per day — several share a       */
/* weather location, e.g. DisneySea uses Tokyo's forecast)              */
/* ------------------------------------------------------------------ */

const PLACES = [
  { id: "tokyo", label: "טוקיו", emoji: "🗼", weatherCity: "tokyo", grad: ["#1F3A5F", "#3A6591"] },
  { id: "disneysea", label: "דיסני סי", emoji: "🏰", weatherCity: "tokyo", grad: ["#5B3E8A", "#9B6FD9"] },
  { id: "osaka", label: "אוסקה", emoji: "🏯", weatherCity: "osaka", grad: ["#7A3B2E", "#D9673F"] },
  { id: "universal", label: "יוניברסל סטודיוס", emoji: "🎢", weatherCity: "osaka", grad: ["#4B2E7A", "#9B5FD9"] },
  { id: "kyoto", label: "קיוטו", emoji: "⛩️", weatherCity: "kyoto", grad: ["#7A1F1F", "#D9542D"] },
  { id: "seoul", label: "סיאול", emoji: "🏮", weatherCity: "seoul", grad: ["#7A4A1F", "#E0AC4F"] },
  { id: "dmz", label: "DMZ", emoji: "🕊️", weatherCity: "seoul", grad: ["#3E5B4F", "#6FA98E"] },
  { id: "kobe", label: "קובה", emoji: "🌉", weatherCity: "kobe", grad: ["#1F4A5B", "#3E86A0"] },
  { id: "kanazawa", label: "קנזאווה", emoji: "🍵", weatherCity: "kanazawa", grad: ["#5B4B1F", "#C9A24B"] },
  { id: "shirakawago", label: "שירקאווה גו", emoji: "🏘️", weatherCity: "shirakawago", grad: ["#3E4A3E", "#6C9B6C"] },
  { id: "takayama", label: "טקיאמה", emoji: "🍶", weatherCity: "takayama", grad: ["#5B3E2E", "#A0714F"] },
  { id: "kawaguchiko", label: "קוואגוצ'יקו", emoji: "🗻", weatherCity: "kawaguchiko", grad: ["#2E4A5B", "#4F86A6"] },
  { id: "fujiq", label: "פוג'י-קיו היילנד", emoji: "🎡", weatherCity: "kawaguchiko", grad: ["#5B2E4A", "#A65F8A"] },
  { id: "hakone", label: "האקונה", emoji: "♨️", weatherCity: "hakone", grad: ["#1F5B4A", "#4FA688"] },
  { id: "tbd", label: "יום פתוח / טרם הוחלט", emoji: "🧭", weatherCity: null, grad: ["#6B6355", "#948C79"] },
];
const placeById = (id) => PLACES.find((p) => p.id === id);
const normalizePlace = (text) => {
  if (!text) return null;
  const t = String(text).trim();
  const hit = PLACES.find((p) => p.id === t || p.label === t || p.label.replace(/["'׳]/g, "") === t.replace(/["'׳]/g, ""));
  return hit ? hit.id : null;
};

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: "attraction", label: "אטרקציה", color: "#35577D", Icon: Camera },
  { id: "amusement", label: "פארק שעשועים", color: "#8B5FBF", Icon: Sparkles },
  { id: "streetfood", label: "אוכל רחוב", color: "#E08E45", Icon: Utensils },
  { id: "restaurant", label: "מסעדה", color: "#C8442D", Icon: UtensilsCrossed },
  { id: "reserved", label: "מקום מוזמן מראש", color: "#5B8266", Icon: CalendarCheck },
  { id: "tickets", label: "כרטיסים נרכשו", color: "#C9A24B", Icon: Ticket },
  { id: "transport", label: "תחבורה", color: "#6B7280", Icon: Bus },
  { id: "shopping", label: "קניות", color: "#C9678A", Icon: ShoppingBag },
  { id: "other", label: "אחר", color: "#8A8578", Icon: Star },
];
const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
const normalizeCategory = (text) => {
  if (!text) return "other";
  const t = String(text).trim();
  const hit = CATEGORIES.find((c) => c.id === t || c.label === t);
  return hit ? hit.id : "other";
};

const INK = "#2B2926";
const PAPER = "#F7F1E4";
const PAPER_SOFT = "#FBF7ED";
const INDIGO = "#1F3A5F";
const INDIGO_MID = "#35577D";
const VERMILLION = "#C8442D";
const GOLD = "#C9A24B";

const DEFAULT_PACKING = [
  "דרכון + צילום גיבוי", "כרטיסי טיסה / אישורי הזמנה", "ביטוח נסיעות",
  "כרטיס JR Pass / IC Card (Suica/Icoca)", "מתאם חשמל יפני (Type A)", "פאוור בנק",
  "מטענים וכבלים", "מזומן (יין) לעסקאות קטנות", "נעליים נוחות להליכה",
  "מטרייה קומפקטית", "תרופות אישיות",
];

const DICTIONARY_JP = [
  { category: "ברכות ושיחת חולין", items: [
    { he: "שלום (בשעות היום)", native: "こんにちは", translit: "Konnichiwa" },
    { he: "בוקר טוב", native: "おはようございます", translit: "Ohayou gozaimasu" },
    { he: "ערב טוב", native: "こんばんは", translit: "Konbanwa" },
    { he: "להתראות", native: "さようなら", translit: "Sayounara" },
    { he: "תודה רבה", native: "ありがとうございます", translit: "Arigatou gozaimasu" },
    { he: "בבקשה / על לא דבר", native: "どういたしまして", translit: "Dou itashimashite" },
    { he: "סליחה / התנצלות", native: "すみません", translit: "Sumimasen" },
    { he: "כן", native: "はい", translit: "Hai" },
    { he: "לא", native: "いいえ", translit: "Iie" },
    { he: "נעים להכיר", native: "はじめまして", translit: "Hajimemashite" },
  ]},
  { category: "מספרים 1–10", items: [
    { he: "אחת", native: "一 (いち)", translit: "Ichi" }, { he: "שתיים", native: "二 (に)", translit: "Ni" },
    { he: "שלוש", native: "三 (さん)", translit: "San" }, { he: "ארבע", native: "四 (よん)", translit: "Yon" },
    { he: "חמש", native: "五 (ご)", translit: "Go" }, { he: "שש", native: "六 (ろく)", translit: "Roku" },
    { he: "שבע", native: "七 (なな)", translit: "Nana" }, { he: "שמונה", native: "八 (はち)", translit: "Hachi" },
    { he: "תשע", native: "九 (きゅう)", translit: "Kyuu" }, { he: "עשר", native: "十 (じゅう)", translit: "Juu" },
  ]},
  { category: "כיוונים ותחבורה", items: [
    { he: "ימינה", native: "右 (みぎ)", translit: "Migi" }, { he: "שמאלה", native: "左 (ひだり)", translit: "Hidari" },
    { he: "ישר", native: "まっすぐ", translit: "Massugu" },
    { he: "היכן התחנה?", native: "駅はどこですか？", translit: "Eki wa doko desu ka?" },
    { he: "כמה זה עולה?", native: "いくらですか？", translit: "Ikura desu ka?" },
    { he: "כרטיס", native: "切符", translit: "Kippu" },
  ]},
  { category: "אוכל", items: [
    { he: "טעים!", native: "おいしい！", translit: "Oishii!" },
    { he: "חשבון בבקשה", native: "お会計お願いします", translit: "Okaikei onegaishimasu" },
    { he: "לא חריף בבקשה", native: "辛くないでください", translit: "Karakunai de kudasai" },
    { he: "צמחוני/ת", native: "ベジタリアン", translit: "Bejitarian" },
    { he: "מים בבקשה", native: "お水をください", translit: "Omizu wo kudasai" },
    { he: "אחד מזה בבקשה", native: "一つください", translit: "Hitotsu kudasai" },
  ]},
  { category: "חירום ובקשת עזרה", items: [
    { he: "עזרה!", native: "助けて！", translit: "Tasukete!" },
    { he: "אני צריכ/ה רופא", native: "医者が必要です", translit: "Isha ga hitsuyou desu" },
    { he: "היכן השירותים?", native: "トイレはどこですか？", translit: "Toire wa doko desu ka?" },
    { he: "אני לא מבינ/ה", native: "わかりません", translit: "Wakarimasen" },
    { he: "את/ה מדבר/ת אנגלית?", native: "英語を話せますか？", translit: "Eigo wo hanasemasu ka?" },
  ]},
];

const DICTIONARY_KR = [
  { category: "ברכות ושיחת חולין", items: [
    { he: "שלום", native: "안녕하세요", translit: "Annyeonghaseyo" },
    { he: "תודה רבה", native: "감사합니다", translit: "Gamsahamnida" },
    { he: "סליחה / התנצלות", native: "죄송합니다", translit: "Joesonghamnida" },
    { he: "כן", native: "네", translit: "Ne" }, { he: "לא", native: "아니요", translit: "Aniyo" },
    { he: "להתראות (את/ה יוצא/ת)", native: "안녕히 계세요", translit: "Annyeonghi gyeseyo" },
    { he: "נעים להכיר", native: "만나서 반갑습니다", translit: "Mannaseo bangapseumnida" },
  ]},
  { category: "מספרים 1–10", items: [
    { he: "אחת", native: "일", translit: "Il" }, { he: "שתיים", native: "이", translit: "I" },
    { he: "שלוש", native: "삼", translit: "Sam" }, { he: "ארבע", native: "사", translit: "Sa" },
    { he: "חמש", native: "오", translit: "O" }, { he: "שש", native: "육", translit: "Yuk" },
    { he: "שבע", native: "칠", translit: "Chil" }, { he: "שמונה", native: "팔", translit: "Pal" },
    { he: "תשע", native: "구", translit: "Gu" }, { he: "עשר", native: "십", translit: "Sip" },
  ]},
  { category: "כיוונים ותחבורה", items: [
    { he: "ימינה", native: "오른쪽", translit: "Oreunjjok" }, { he: "שמאלה", native: "왼쪽", translit: "Oenjjok" },
    { he: "ישר", native: "직진", translit: "Jikjin" },
    { he: "היכן התחנה?", native: "역이 어디예요?", translit: "Yeogi eodiyeyo?" },
    { he: "כמה זה עולה?", native: "얼마예요？", translit: "Eolmayeyo?" },
  ]},
  { category: "אוכל", items: [
    { he: "טעים!", native: "맛있어요!", translit: "Masisseoyo!" },
    { he: "חשבון בבקשה", native: "계산서 주세요", translit: "Gyesanseo juseyo" },
    { he: "מים בבקשה", native: "물 주세요", translit: "Mul juseyo" },
    { he: "לא חריף בבקשה", native: "안 맵게 해주세요", translit: "An maepge haejuseyo" },
  ]},
  { category: "חירום ובקשת עזרה", items: [
    { he: "עזרה!", native: "도와주세요!", translit: "Dowajuseyo!" },
    { he: "אני צריכ/ה רופא", native: "의사가 필요해요", translit: "Uisaga pilyohaeyo" },
    { he: "היכן השירותים?", native: "화장실이 어디예요？", translit: "Hwajangsiri eodiyeyo?" },
    { he: "אני לא מבינ/ה", native: "이해가 안 돼요", translit: "Ihaega an dwaeyo" },
    { he: "את/ה מדבר/ת אנגלית?", native: "영어 하세요?", translit: "Yeongeo haseyo?" },
  ]},
];

function speak(text, lang) {
  try {
    if (!("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
    return true;
  } catch (e) { return false; }
}

const WEEKDAYS_HE = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

function toKey(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function keyToDate(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(k, n) { const d = keyToDate(k); d.setDate(d.getDate() + n); return toKey(d); }
function dayDiff(aKey, bKey) { return Math.round((keyToDate(bKey) - keyToDate(aKey)) / 86400000); }
function formatHeDate(k) { return keyToDate(k).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }); }
function formatHeShort(k) { return keyToDate(k).toLocaleDateString("he-IL", { day: "numeric", month: "short" }); }
function formatHeWeekdayShort(k) { return keyToDate(k).toLocaleDateString("he-IL", { weekday: "short" }); }
function todayKey() { return toKey(new Date()); }
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function slug(s) { return String(s || "").trim().replace(/\s+/g, "-").replace(/[^\w\-א-ת]/g, ""); }
function tripDays() {
  const days = []; let cur = TRIP_START;
  while (dayDiff(cur, TRIP_END) >= 0) { days.push(cur); cur = addDays(cur, 1); }
  return days;
}

function weatherVisual(code) {
  if (code === 0) return { Icon: Sun, label: "בהיר", color: "#D9A441" };
  if ([1, 2].includes(code)) return { Icon: Cloud, label: "מעונן חלקית", color: "#8CA0B3" };
  if (code === 3) return { Icon: Cloud, label: "מעונן", color: "#7B8B99" };
  if ([45, 48].includes(code)) return { Icon: CloudFog, label: "ערפילי", color: "#9AA5AC" };
  if ([51, 53, 55, 56, 57].includes(code)) return { Icon: CloudDrizzle, label: "טפטוף", color: "#5F8FB0" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { Icon: CloudRain, label: "גשם", color: "#3E6E93" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { Icon: CloudSnow, label: "שלג", color: "#8FB6D9" };
  if ([95, 96, 99].includes(code)) return { Icon: CloudLightning, label: "סופת רעמים", color: "#5B4B8A" };
  return { Icon: Cloud, label: "מעונן", color: "#8CA0B3" };
}

const CLIMATE_NOTE = {
  tokyo: "ספטמבר חם ולח (כ-26–30°), עדיין בעונת הטייפונים • אוקטובר נעים יותר (כ-18–23°)",
  osaka: "ספטמבר חם ולח (כ-26–31°) • אוקטובר נעים ומתייבש (כ-18–24°)",
  kyoto: "ספטמבר חם וקצת פחות לח מהחוף (כ-25–30°) • אוקטובר נעים, תחילת צבעי סתיו (כ-17–23°)",
  seoul: "ספטמבר עדיין קיצי-נעים (כ-22–27°) • אוקטובר סתווי ונעים (כ-13–20°)",
  kobe: "דומה לאוסקה — חם ולח בספטמבר (כ-26–31°) • אוקטובר נעים ומתייבש (כ-18–24°)",
  kanazawa: "צד הים היפני — לח יותר, ספטמבר חם (כ-24–29°) • אוקטובר נעים עם סיכוי לגשם (כ-15–21°)",
  shirakawago: "אזור הררי — קריר מהערים, ספטמבר נעים (כ-20–26°) • אוקטובר קריר (כ-10–18°), כדאי שכבות",
  takayama: "אזור הררי בגובה — ספטמבר נעים (כ-19–25°) • אוקטובר קריר (כ-9–17°), ערבים קרים",
  kawaguchiko: "לרגלי הר פוג'י — קריר מטוקיו, ספטמבר (כ-18–24°) • אוקטובר קריר ורענן (כ-9–16°)",
  hakone: "אזור הררי עם מעיינות חמים — דומה לקוואגוצ'יקו, כדאי מעיל קל באוקטובר",
};

/* ------------------------------------------------------------------ */
/* Storage hook (personal data — merges with the synced Excel layer)   */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "japan-trip-data-v2";
const DEFAULT_DATA = {
  names: [DEFAULT_NAME_1, DEFAULT_NAME_2],
  dayCities: {},        // manual overrides — take priority over the Excel-derived place
  dayNotes: {},
  itinerary: {},         // locally added items, keyed by date
  visitedOverrides: {},  // visited state for Excel-sourced items, keyed by stable item id
  packing: DEFAULT_PACKING.map((label) => ({ id: uid(), label, checked: false })),
  extraExpenses: [],
};

function useTripData() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (!cancelled && res && res.value) setData((prev) => ({ ...prev, ...JSON.parse(res.value) }));
      } catch (e) { /* first run, no saved data yet */ }
      finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => { try { await window.storage.set(STORAGE_KEY, JSON.stringify(data), false); } catch (e) {} })();
  }, [data, loaded]);

  return [data, setData, loaded];
}

/* ------------------------------------------------------------------ */
/* Excel sync hook — reads /data/itinerary.xlsx if present             */
/* ------------------------------------------------------------------ */

function useExcelItinerary() {
  const [state, setState] = useState({ status: "loading", byDate: {}, cityByDate: {}, updatedAt: null });

  const load = React.useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const res = await fetch("/data/itinerary.xlsx", { cache: "no-store" });
      if (!res.ok) throw new Error("not found");
      const buf = await res.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets["לוז"] || wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

      const byDate = {};
      const cityByDate = {};
      rows.forEach((row) => {
        const date = String(row["תאריך (YYYY-MM-DD)"] || row["תאריך"] || "").trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
        if (String(row["הערות"] || "").includes("דוגמה בלבד")) return;

        const placeId = normalizePlace(row["עיר / מקום"] || row["עיר"]);
        if (placeId && !cityByDate[date]) cityByDate[date] = placeId;

        const name = String(row["שם המקום / הפעילות"] || "").trim();
        if (!name) return;
        const time = String(row["שעה (HH:MM)"] || row["שעה"] || "").trim();
        const item = {
          id: `xlsx-${date}-${slug(name)}-${slug(time) || "noTime"}`,
          date, time, name,
          category: normalizeCategory(row["קטגוריה"]),
          place: String(row["כתובת / חיפוש למפות"] || "").trim(),
          openTime: String(row["שעת פתיחה"] || "").trim(),
          closeTime: String(row["שעת סגירה"] || "").trim(),
          price: String(row["מחיר (¥)"] || row["מחיר"] || "").trim(),
          notes: String(row["הערות"] || "").trim(),
          source: "excel",
        };
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(item);
      });

      setState({ status: "ready", byDate, cityByDate, updatedAt: new Date() });
    } catch (e) {
      setState({ status: "none", byDate: {}, cityByDate: {}, updatedAt: null });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return [state, load];
}

/* ------------------------------------------------------------------ */
/* Weather hook                                                        */
/* ------------------------------------------------------------------ */

function useWeather() {
  const [weather, setWeather] = useState({});
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          WEATHER_CITIES.map(async (c) => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`;
            const r = await fetch(url);
            if (!r.ok) throw new Error("bad response");
            const j = await r.json();
            const byDate = {};
            j.daily.time.forEach((t, i) => {
              byDate[t] = { code: j.daily.weathercode[i], max: Math.round(j.daily.temperature_2m_max[i]), min: Math.round(j.daily.temperature_2m_min[i]) };
            });
            return [c.id, byDate];
          })
        );
        if (!cancelled) {
          const obj = {}; results.forEach(([id, byDate]) => (obj[id] = byDate));
          setWeather(obj); setStatus("ready");
        }
      } catch (e) { if (!cancelled) setStatus("error"); }
    })();
    return () => { cancelled = true; };
  }, []);

  return [weather, status];
}

/* ------------------------------------------------------------------ */
/* Data merge helpers                                                   */
/* ------------------------------------------------------------------ */

function useMergedTrip(data, excel) {
  return useMemo(() => {
    const itemsByDate = {};
    const allDates = new Set([...Object.keys(excel.byDate), ...Object.keys(data.itinerary)]);
    allDates.forEach((date) => {
      const excelItems = (excel.byDate[date] || []).map((i) => ({ ...i, visited: !!data.visitedOverrides[i.id] }));
      const localItems = (data.itinerary[date] || []).map((i) => ({ ...i, source: "local" }));
      itemsByDate[date] = [...excelItems, ...localItems].sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    });

    const cityForDate = (date) => data.dayCities[date] || excel.cityByDate[date] || null;

    return { itemsByDate, cityForDate };
  }, [data, excel]);
}

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                      */
/* ------------------------------------------------------------------ */

function ToriiFrame({ children }) {
  return (
    <div className="relative flex flex-col items-center justify-center py-3">
      <svg viewBox="0 0 240 90" className="absolute -top-2 w-56 h-auto opacity-90" style={{ color: VERMILLION }}>
        <rect x="6" y="18" width="228" height="9" rx="2" fill="currentColor" />
        <rect x="0" y="32" width="240" height="6" rx="2" fill="currentColor" opacity="0.85" />
        <rect x="30" y="20" width="10" height="62" rx="2" fill="currentColor" />
        <rect x="200" y="20" width="10" height="62" rx="2" fill="currentColor" />
        <rect x="95" y="40" width="10" height="42" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="135" y="40" width="10" height="42" rx="2" fill="currentColor" opacity="0.5" />
      </svg>
      <div className="mt-9">{children}</div>
    </div>
  );
}

function HankoStamp({ show }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-300"
      style={{ opacity: show ? 1 : 0, transform: show ? "scale(1) rotate(-8deg)" : "scale(1.6) rotate(-8deg)" }}>
      <div className="w-14 h-14 rounded-md border-4 flex items-center justify-center text-[10px] font-bold leading-tight text-center"
        style={{ borderColor: VERMILLION, color: VERMILLION, fontFamily: "'Heebo', sans-serif", boxShadow: "0 0 0 2px rgba(200,68,45,0.15)" }}>
        ביקרנו<br />旅
      </div>
    </div>
  );
}

function CategoryChip({ cat, small }) {
  const { Icon, label, color } = cat;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${small ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}
      style={{ backgroundColor: `${color}1A`, color }}>
      <Icon size={small ? 11 : 13} />{label}
    </span>
  );
}

function SectionTitle({ eyebrow, title, Icon, action }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        {eyebrow && <div className="text-[11px] tracking-widest font-semibold uppercase mb-1" style={{ color: GOLD, fontFamily: "'Heebo', sans-serif" }}>{eyebrow}</div>}
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} style={{ color: INDIGO }} />}
          <h2 className="text-lg font-bold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>{title}</h2>
        </div>
      </div>
      {action}
    </div>
  );
}

function PlaceChip({ placeId, size = "normal" }) {
  const place = placeById(placeId);
  if (!place) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${size === "small" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"}`}
      style={{ background: `linear-gradient(135deg, ${place.grad[0]}, ${place.grad[1]})`, color: "#fff" }}>
      <span>{place.emoji}</span>{place.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Weather badges                                                      */
/* ------------------------------------------------------------------ */

function DayWeatherBadge({ weather, status, placeId, dateKey }) {
  const place = placeById(placeId);
  if (!place) return <div className="text-xs px-3 py-2 rounded-xl" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>הגדירו מקום ליום זה כדי לראות תחזית</div>;
  if (!place.weatherCity) return <div className="text-xs px-3 py-2 rounded-xl" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>יום פתוח — עדיין אין תחזית ליעד</div>;
  if (status === "loading") return <div className="text-xs px-3 py-2 rounded-xl animate-pulse" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>טוענת תחזית…</div>;

  const entry = weather[place.weatherCity] && weather[place.weatherCity][dateKey];
  if (!entry) {
    return (
      <div className="text-xs px-3 py-2 rounded-xl leading-relaxed" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
        התחזית המדויקת תתעדכן כשנתקרב לתאריך (עד 16 יום מראש).<br />ממוצע אקלימי: {CLIMATE_NOTE[place.weatherCity]}
      </div>
    );
  }
  const { Icon, label, color } = weatherVisual(entry.code);
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ backgroundColor: "#EFE7D4" }}>
      <Icon size={26} style={{ color }} />
      <div className="text-sm">
        <div className="font-semibold" style={{ color: INK }}>{label} · {place.emoji} {place.label}</div>
        <div style={{ color: "#8A7F63" }}>גבוה {entry.max}° / נמוך {entry.min}°</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Item form                                                            */
/* ------------------------------------------------------------------ */

function ItemForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { time: "", name: "", category: "attraction", place: "", openTime: "", closeTime: "", notes: "", price: "", visited: false });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: PAPER_SOFT, border: "1px solid #E5DAC0" }}>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>שעה</label>
          <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>מחיר (אופציונלי, ¥)</label>
          <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" className="w-full rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        </div>
      </div>
      <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>שם המקום / הפעילות</label>
      <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="לדוגמה: מקדש סנסו־ג'י" className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-2" style={{ borderColor: "#E5DAC0" }} />
      <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>מיקום מדויק — הדביקו קישור ישיר מ-Google Maps/Naver Map (הכי מדויק), או כתבו כתובת/שם מקום. השאירו ריק כדי שנחפש לפי שם הפעילות שכתבתם למעלה</label>
      <input value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="https://maps.app.goo.gl/... או Sensoji Temple, Tokyo" className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-2" style={{ borderColor: "#E5DAC0" }} />
      <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>קטגוריה</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => set("category", c.id)} className="rounded-full px-2.5 py-1 text-[11px] font-medium border transition"
            style={{ backgroundColor: form.category === c.id ? c.color : "transparent", color: form.category === c.id ? "#fff" : c.color, borderColor: c.color }}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>שעת פתיחה</label>
          <input type="time" value={form.openTime} onChange={(e) => set("openTime", e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>שעת סגירה</label>
          <input type="time" value={form.closeTime} onChange={(e) => set("closeTime", e.target.value)} className="w-full rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        </div>
      </div>
      <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>הערות</label>
      <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="פרטים נוספים, מס' הזמנה וכו׳" className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-3 resize-none" style={{ borderColor: "#E5DAC0" }} />
      <div className="flex gap-2">
        <button onClick={() => form.name.trim() && onSave({ ...form, id: form.id || uid() })} className="flex-1 rounded-xl py-2 text-sm font-semibold text-white flex items-center justify-center gap-1" style={{ backgroundColor: INDIGO }}>
          <Check size={15} /> שמירה — ישתלב אוטומטית בטיימליין לפי השעה
        </button>
        <button onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-medium" style={{ backgroundColor: "#E5DAC0", color: INK }}>ביטול</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline (day sheet)                                                 */
/* ------------------------------------------------------------------ */

function buildMapsLink(placeText, isKorea) {
  if (!placeText) return null;
  const trimmed = String(placeText).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return { url: trimmed, label: isKorea ? "פתיחת המיקום" : "פתיחת המיקום" };
  }
  if (isKorea) {
    return { url: `https://map.naver.com/p/search/${encodeURIComponent(trimmed)}`, label: "פתיחה ב-Naver Map" };
  }
  return { url: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trimmed)}`, label: "ניווט ב-Google Maps" };
}

function TimelineItem({ item, isFirst, isLast, isKorea, onToggleVisited, onEdit, onDelete }) {
  const cat = catById(item.category);
  const { Icon } = cat;
  const maps = buildMapsLink(item.place || item.name, isKorea);
  const isExcel = item.source === "excel";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center w-8 shrink-0">
        <div className="flex-1 w-[2px]" style={{ backgroundColor: isFirst ? "transparent" : "#E5DAC0" }} />
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: cat.color }}>
          <Icon size={14} color="#fff" />
        </div>
        <div className="flex-1 w-[2px]" style={{ backgroundColor: isLast ? "transparent" : "#E5DAC0" }} />
      </div>

      <div className="flex-1 pb-3 pt-0.5">
        <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: "#E5DAC0", backgroundColor: "#fff" }}>
          <HankoStamp show={item.visited} />
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {item.time && <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: INDIGO }}><Clock size={12} />{item.time}</span>}
                  <CategoryChip cat={cat} small />
                  {isExcel && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
                      <FileSpreadsheet size={9} /> מהאקסל
                    </span>
                  )}
                </div>
                <div className="font-bold text-[15px]" style={{ color: INK, fontFamily: "'Heebo', sans-serif" }}>
                  {maps ? (
                    <a href={maps.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline decoration-dotted underline-offset-2" style={{ color: INK }}>
                      <MapPin size={13} style={{ color: INDIGO_MID }} className="shrink-0" />
                      {item.name}
                    </a>
                  ) : item.name}
                </div>
                {(item.openTime || item.closeTime) && <div className="text-xs mt-0.5" style={{ color: "#8A7F63" }}>שעות פתיחה: {item.openTime || "?"} – {item.closeTime || "?"}</div>}
                {item.price && <div className="text-xs mt-0.5 font-medium" style={{ color: GOLD }}>~¥{item.price}</div>}
                {item.notes && <div className="text-xs mt-1 leading-relaxed" style={{ color: "#6B6355" }}>{item.notes}</div>}
              </div>
              <button onClick={() => onToggleVisited(item)} className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition"
                style={{ borderColor: item.visited ? VERMILLION : "#D9CBA5", backgroundColor: item.visited ? VERMILLION : "transparent" }}>
                <Check size={16} color={item.visited ? "#fff" : "#D9CBA5"} />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2.5 pt-2 border-t" style={{ borderColor: "#F0E9D6" }}>
              {maps && (
                <a href={maps.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: INDIGO_MID }}>
                  <MapPin size={13} /> {maps.label} <ExternalLink size={11} />
                </a>
              )}
              {!isExcel ? (
                <>
                  <button onClick={() => onEdit(item)} className="inline-flex items-center gap-1 text-xs font-medium mr-auto" style={{ color: "#8A7F63" }}><Pencil size={12} /> עריכה</button>
                  <button onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: VERMILLION }}><Trash2 size={12} /> מחיקה</button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] mr-auto" style={{ color: "#B0A483" }}><Lock size={10} /> נערך בקובץ האקסל</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DaySheet({ dateKey, data, setData, merged, weather, weatherStatus, onClose }) {
  const [adding, setAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const items = merged.itemsByDate[dateKey] || [];
  const placeId = merged.cityForDate(dateKey);
  const note = data.dayNotes[dateKey] || "";

  const setPlaceForDay = (p) => setData((d) => ({ ...d, dayCities: { ...d.dayCities, [dateKey]: p } }));
  const setNoteForDay = (v) => setData((d) => ({ ...d, dayNotes: { ...d.dayNotes, [dateKey]: v } }));

  const saveItem = (item) => {
    setData((d) => {
      const list = d.itinerary[dateKey] ? [...d.itinerary[dateKey]] : [];
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx >= 0) list[idx] = item; else list.push(item);
      return { ...d, itinerary: { ...d.itinerary, [dateKey]: list } };
    });
    setAdding(false); setEditingItem(null);
  };
  const deleteItem = (id) => setData((d) => ({ ...d, itinerary: { ...d.itinerary, [dateKey]: (d.itinerary[dateKey] || []).filter((i) => i.id !== id) } }));
  const toggleVisited = (item) => {
    if (item.source === "excel") {
      setData((d) => ({ ...d, visitedOverrides: { ...d.visitedOverrides, [item.id]: !item.visited } }));
    } else {
      setData((d) => ({ ...d, itinerary: { ...d.itinerary, [dateKey]: (d.itinerary[dateKey] || []).map((i) => (i.id === item.id ? { ...i, visited: !i.visited } : i)) } }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-3xl overflow-hidden flex flex-col animate-sheet-up" style={{ backgroundColor: PAPER, maxHeight: "92vh" }}>
        <div className="w-10 h-1.5 rounded-full bg-black/15 mx-auto mt-3" />
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div>
            <div className="text-[11px] tracking-wide font-semibold uppercase" style={{ color: GOLD }}>לוז יומי · טיימליין</div>
            <h3 className="text-lg font-bold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>{formatHeDate(dateKey)}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E5DAC0" }}><X size={16} color={INK} /></button>
        </div>

        <div className="overflow-y-auto px-4 pb-6" style={{ flex: 1 }}>
          <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar pb-1">
            {PLACES.map((p) => (
              <button key={p.id} onClick={() => setPlaceForDay(p.id)} className="shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold border flex items-center gap-1"
                style={{ backgroundColor: placeId === p.id ? INDIGO : "#fff", color: placeId === p.id ? "#fff" : INDIGO, borderColor: INDIGO }}>
                <span>{p.emoji}</span>{p.label}
              </button>
            ))}
          </div>

          <DayWeatherBadge weather={weather} status={weatherStatus} placeId={placeId} dateKey={dateKey} />
          {placeById(placeId)?.weatherCity === "seoul" && (
            <div className="text-[11px] mt-1.5 px-1" style={{ color: "#8A7F63" }}>
              🇰🇷 ביום הזה קישורי המיקום ייפתחו ב-Naver Map במקום Google Maps — Google Maps מוגבל מאוד בדרום קוריאה.
            </div>
          )}

          <div className="mt-3 mb-4">
            <label className="text-[11px] font-medium flex items-center gap-1 mb-1" style={{ color: "#8A7F63" }}><StickyNote size={12} /> הערת יום (לוגיסטיקה, מלון, מזוודות...)</label>
            <textarea value={note} onChange={(e) => setNoteForDay(e.target.value)} rows={2} placeholder="לדוגמה: צ'ק-אאוט מהמלון ב-10:00" className="w-full rounded-lg px-3 py-2 text-sm border outline-none resize-none" style={{ borderColor: "#E5DAC0", backgroundColor: "#fff" }} />
          </div>

          <h4 className="font-bold text-sm mb-2" style={{ color: INK }}>הטיימליין ({items.length})</h4>

          {items.length === 0 && (
            <div className="text-sm text-center py-6 rounded-2xl mb-3" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
              עוד לא נוסף כלום ליום הזה. הוסיפו פריט למטה — הוא ישתלב אוטומטית לפי השעה.
            </div>
          )}

          {items.map((item, idx) => (
            <TimelineItem key={item.id} item={item} isFirst={idx === 0} isLast={idx === items.length - 1} isKorea={placeById(placeId)?.weatherCity === "seoul"}
              onToggleVisited={toggleVisited} onEdit={setEditingItem} onDelete={deleteItem} />
          ))}

          <div className="mt-2 pt-3 border-t-2 border-dashed" style={{ borderColor: "#E5DAC0" }}>
            {!adding && !editingItem && (
              <button onClick={() => setAdding(true)} className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold rounded-2xl py-2.5 text-white" style={{ backgroundColor: VERMILLION }}>
                <Plus size={15} /> הוספת פריט לטיימליין
              </button>
            )}
            {adding && <ItemForm onSave={saveItem} onCancel={() => setAdding(false)} />}
            {editingItem && <ItemForm initial={editingItem} onSave={saveItem} onCancel={() => setEditingItem(null)} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar tab                                                         */
/* ------------------------------------------------------------------ */

function MonthGrid({ year, month, merged, onPick }) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = []; for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_HE.map((w) => <div key={w} className="text-center text-[11px] font-semibold py-1" style={{ color: "#8A7F63" }}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = toKey(new Date(year, month, d));
          const inTrip = dayDiff(TRIP_START, key) >= 0 && dayDiff(key, TRIP_END) >= 0;
          const isToday = key === todayKey();
          const placeId = inTrip ? merged.cityForDate(key) : null;
          const place = placeId ? placeById(placeId) : null;
          const items = merged.itemsByDate[key] || [];
          const visitedCount = items.filter((i) => i.visited).length;

          return (
            <button key={i} disabled={!inTrip} onClick={() => onPick(key)}
              className="relative aspect-square rounded-xl flex flex-col items-center justify-center transition"
              style={{ backgroundColor: inTrip ? (isToday ? INDIGO : "#fff") : "transparent", border: inTrip ? `1.5px solid ${isToday ? INDIGO : "#E5DAC0"}` : "none", opacity: inTrip ? 1 : 0.3, color: isToday ? "#fff" : INK }}>
              <span className="text-sm font-semibold">{d}</span>
              {place && <span className="text-[13px] leading-none mt-0.5">{place.emoji}</span>}
              {inTrip && items.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 absolute bottom-1">
                  {items.slice(0, 4).map((it) => <span key={it.id} className="w-1 h-1 rounded-full" style={{ backgroundColor: isToday ? "#fff" : catById(it.category).color }} />)}
                </div>
              )}
              {inTrip && items.length > 0 && visitedCount === items.length && (
                <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: VERMILLION }}><Check size={9} color="#fff" /></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarTab({ merged, onPick }) {
  const [monthIdx, setMonthIdx] = useState(0);
  const months = [{ year: 2026, month: 8, label: "ספטמבר 2026" }, { year: 2026, month: 9, label: "אוקטובר 2026" }];
  const m = months[monthIdx];

  return (
    <div className="px-4 pb-6">
      <SectionTitle eyebrow="התכנון היומי" title="לוח שנה של הטיול" Icon={CalendarDays} />
      <div className="flex items-center justify-between mb-3">
        <button disabled={monthIdx === 0} onClick={() => setMonthIdx((i) => i - 1)} className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}><ChevronRight size={16} /></button>
        <span className="font-bold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>{m.label}</span>
        <button disabled={monthIdx === months.length - 1} onClick={() => setMonthIdx((i) => i + 1)} className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}><ChevronLeft size={16} /></button>
      </div>
      <MonthGrid year={m.year} month={m.month} merged={merged} onPick={onPick} />
      <div className="mt-5 flex flex-wrap gap-2">{CATEGORIES.map((c) => <CategoryChip key={c.id} cat={c} small />)}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Weather tab                                                          */
/* ------------------------------------------------------------------ */

function WeatherTab({ weather, status }) {
  const [city, setCity] = useState("tokyo");
  const cityWeather = weather[city] || {};
  const dates = Object.keys(cityWeather).sort();

  return (
    <div className="px-4 pb-6">
      <SectionTitle eyebrow="לפני שיוצאים" title="מזג האוויר ביעדים" Icon={Cloud} />
      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
        {WEATHER_CITIES.map((c) => (
          <button key={c.id} onClick={() => setCity(c.id)} className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold border" style={{ backgroundColor: city === c.id ? INDIGO : "#fff", color: city === c.id ? "#fff" : INDIGO, borderColor: INDIGO }}>{c.label}</button>
        ))}
      </div>
      {status === "loading" && <div className="text-sm text-center py-10 animate-pulse" style={{ color: "#8A7F63" }}>טוענת תחזית עדכנית…</div>}
      {status === "error" && <div className="text-sm text-center py-6 rounded-2xl" style={{ backgroundColor: "#F6E5DE", color: VERMILLION }}>לא הצלחנו לטעון תחזית כרגע. בדקו את החיבור לאינטרנט ונסו שוב.</div>}
      {status === "ready" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {dates.map((d) => {
              const e = cityWeather[d];
              const { Icon, label, color } = weatherVisual(e.code);
              const isToday = d === todayKey();
              return (
                <div key={d} className="rounded-2xl p-3 text-center" style={{ backgroundColor: isToday ? "#EAE1C6" : "#fff", border: `1px solid ${isToday ? GOLD : "#E5DAC0"}` }}>
                  <div className="text-[11px] font-semibold mb-1" style={{ color: "#8A7F63" }}>{formatHeShort(d)}{isToday ? " · היום" : ""}</div>
                  <Icon size={26} style={{ color, margin: "0 auto" }} />
                  <div className="text-xs mt-1" style={{ color: "#6B6355" }}>{label}</div>
                  <div className="text-sm font-bold mt-1" style={{ color: INK }}>{e.max}° / {e.min}°</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs leading-relaxed rounded-xl p-3" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
            תחזית מדויקת זמינה עד 16 יום קדימה. עבור ימים רחוקים יותר: {CLIMATE_NOTE[city]}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Budget tab                                                           */
/* ------------------------------------------------------------------ */

function BudgetTab({ data, setData, merged }) {
  const allItems = Object.values(merged.itemsByDate).flat();
  const itemsWithPrice = allItems.filter((i) => i.price && Number(i.price) > 0);
  const totalItinerary = itemsWithPrice.reduce((s, i) => s + Number(i.price), 0);
  const totalExtra = data.extraExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const total = totalItinerary + totalExtra;
  const byCategory = {};
  itemsWithPrice.forEach((i) => { byCategory[i.category] = (byCategory[i.category] || 0) + Number(i.price); });

  const [label, setLabel] = useState(""); const [amount, setAmount] = useState("");
  const addExpense = () => { if (!label.trim() || !amount) return; setData((d) => ({ ...d, extraExpenses: [...d.extraExpenses, { id: uid(), label, amount: Number(amount) }] })); setLabel(""); setAmount(""); };
  const removeExpense = (id) => setData((d) => ({ ...d, extraExpenses: d.extraExpenses.filter((e) => e.id !== id) }));

  return (
    <div className="px-4 pb-6">
      <SectionTitle eyebrow="מעקב הוצאות" title="תקציב הטיול" Icon={Wallet} />
      <div className="rounded-2xl p-4 text-center mb-4" style={{ backgroundColor: INDIGO }}>
        <div className="text-xs text-white/70">סה"כ מתוכנן</div>
        <div className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Heebo', sans-serif" }}>¥{total.toLocaleString()}</div>
      </div>
      {Object.keys(byCategory).length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-sm mb-2" style={{ color: INK }}>לפי קטגוריה</h4>
          <div className="space-y-1.5">
            {Object.entries(byCategory).map(([catId, sum]) => {
              const cat = catById(catId); const pct = Math.round((sum / totalItinerary) * 100);
              return (
                <div key={catId}>
                  <div className="flex justify-between text-xs mb-0.5"><span style={{ color: INK }}>{cat.label}</span><span style={{ color: "#8A7F63" }}>¥{sum.toLocaleString()}</span></div>
                  <div className="h-1.5 rounded-full bg-black/5"><div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <h4 className="font-bold text-sm mb-2" style={{ color: INK }}>הוצאות נוספות (טיסות, מלונות, ביטוח...)</h4>
      <div className="space-y-1.5 mb-3">
        {data.extraExpenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}>
            <span style={{ color: INK }}>{e.label}</span>
            <div className="flex items-center gap-2"><span className="font-semibold" style={{ color: GOLD }}>¥{Number(e.amount).toLocaleString()}</span><button onClick={() => removeExpense(e.id)}><Trash2 size={14} color={VERMILLION} /></button></div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="תיאור ההוצאה" className="flex-1 rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="¥" className="w-20 rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        <button onClick={addExpense} className="rounded-lg px-3 text-white" style={{ backgroundColor: INDIGO }}><Plus size={16} /></button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Info tab                                                              */
/* ------------------------------------------------------------------ */

function DictionaryEntry({ entry, lang }) {
  const [playing, setPlaying] = useState(false);
  const handlePlay = () => { if (speak(entry.native, lang)) { setPlaying(true); setTimeout(() => setPlaying(false), 900); } };
  return (
    <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "#F0E9D6" }}>
      <div className="flex-1 min-w-0">
        <div className="text-sm" style={{ color: INK }}>{entry.he}</div>
        <div className="text-xs" style={{ color: "#8A7F63" }}>{entry.native} <span className="opacity-70">· {entry.translit}</span></div>
      </div>
      <button onClick={handlePlay} className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition" style={{ backgroundColor: playing ? INDIGO : "#EFE7D4" }} title="השמעה קולית"><Volume2 size={15} color={playing ? "#fff" : INDIGO} /></button>
    </div>
  );
}

function DictionarySection({ flag, dictionary, lang }) {
  const [openCat, setOpenCat] = useState(dictionary[0]?.category || "");
  return (
    <div>
      <div className="text-xs mb-2 leading-relaxed rounded-lg px-3 py-2" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
        {flag} לחיצה על כפתור הרמקול משמיעה הגייה אמיתית — עובד גם ללא אינטרנט לאחר טעינת העמוד.
      </div>
      {dictionary.map((group) => (
        <div key={group.category} className="mb-2 rounded-xl overflow-hidden" style={{ border: "1px solid #F0E9D6" }}>
          <button onClick={() => setOpenCat(openCat === group.category ? "" : group.category)} className="w-full flex items-center justify-between px-3 py-2" style={{ backgroundColor: "#FBF7ED" }}>
            <span className="text-xs font-bold" style={{ color: INDIGO_MID }}>{group.category}</span>
            <ChevronDown size={14} style={{ transform: openCat === group.category ? "rotate(180deg)" : "none", transition: "0.2s", color: "#8A7F63" }} />
          </button>
          {openCat === group.category && <div className="px-3 py-1">{group.items.map((it, i) => <DictionaryEntry key={i} entry={it} lang={lang} />)}</div>}
        </div>
      ))}
    </div>
  );
}

function QuickTranslate() {
  const [text, setText] = useState(""); const [target, setTarget] = useState("ja");
  const openTranslate = () => window.open(`https://translate.google.com/?sl=auto&tl=${target}&text=${encodeURIComponent(text)}&op=translate`, "_blank", "noopener,noreferrer");
  const openConversation = () => window.open(`https://translate.google.com/?sl=${target}&tl=iw&op=translate`, "_blank", "noopener,noreferrer");
  return (
    <div>
      <div className="text-xs mb-3 leading-relaxed rounded-lg px-3 py-2" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
        לתרגום חופשי — הכלי פותח את Google Translate עם הטקסט ממולא מראש. טיפ: הורידו מראש בתוך האפליקציה של Google Translate את חבילות השפה "יפנית" ו"קוריאנית" למצב אופליין אמיתי.
      </div>
      <div className="flex gap-2 mb-2">
        <button onClick={() => setTarget("ja")} className="flex-1 rounded-full py-1.5 text-xs font-semibold border" style={{ backgroundColor: target === "ja" ? INDIGO : "#fff", color: target === "ja" ? "#fff" : INDIGO, borderColor: INDIGO }}>יפנית 🇯🇵</button>
        <button onClick={() => setTarget("ko")} className="flex-1 rounded-full py-1.5 text-xs font-semibold border" style={{ backgroundColor: target === "ko" ? INDIGO : "#fff", color: target === "ko" ? "#fff" : INDIGO, borderColor: INDIGO }}>קוריאנית 🇰🇷</button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="כתבו כאן מילה או משפט בעברית..." className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-2 resize-none" style={{ borderColor: "#E5DAC0", backgroundColor: "#fff" }} />
      <div className="flex gap-2">
        <button onClick={openTranslate} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-white" style={{ backgroundColor: VERMILLION }}><Send size={14} /> פתיחה בתרגום</button>
        <button onClick={openConversation} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold" style={{ backgroundColor: "#EFE7D4", color: INDIGO }}><MessageCircle size={14} /> מצב שיחה</button>
      </div>
    </div>
  );
}

function ExcelSyncPanel({ excel, onRefresh }) {
  return (
    <div>
      <div className="text-xs mb-3 leading-relaxed rounded-lg px-3 py-2" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
        הלוז נטען משני מקורות במקביל: קובץ Excel מסונכרן מ-GitHub (לתכנון המרכזי), ותוספות מקומיות שאת מזינה כאן באפליקציה — שני המקורות מתמזגים אוטומטית לפי שעה, בכל יום.
      </div>
      <div className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-2" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}>
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} color={excel.status === "ready" ? "#5B8266" : "#B0A483"} />
          <div>
            <div className="text-sm font-semibold" style={{ color: INK }}>
              {excel.status === "ready" && "קובץ אקסל מחובר בהצלחה"}
              {excel.status === "none" && "אין עדיין קובץ אקסל מסונכרן"}
              {excel.status === "loading" && "בודקת חיבור לקובץ…"}
              {excel.status === "error" && "שגיאה בטעינת הקובץ"}
            </div>
            <div className="text-[11px]" style={{ color: "#8A7F63" }}>
              {excel.status === "ready" ? `${Object.values(excel.byDate).flat().length} פריטים נטענו` : "העלו את itinerary.xlsx לתיקיית public/data ודחפו ל-GitHub"}
            </div>
          </div>
        </div>
        <button onClick={onRefresh} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EFE7D4" }}><RefreshCw size={14} color={INDIGO} /></button>
      </div>
      <div className="text-xs leading-relaxed" style={{ color: "#8A7F63" }}>
        קובץ התבנית (עם רשימות נפתחות למקום ולקטגוריה, וצבעים תואמים) מצורף בנפרד להורדה. שמרו אותו בשם <b>itinerary.xlsx</b> בתוך <b>public/data</b> בפרויקט.
      </div>
    </div>
  );
}

function InfoTab({ data, setData, excel, onRefreshExcel }) {
  const [newItem, setNewItem] = useState("");
  const togglePack = (id) => setData((d) => ({ ...d, packing: d.packing.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)) }));
  const addPack = () => { if (!newItem.trim()) return; setData((d) => ({ ...d, packing: [...d.packing, { id: uid(), label: newItem, checked: false }] })); setNewItem(""); };
  const removePack = (id) => setData((d) => ({ ...d, packing: d.packing.filter((p) => p.id !== id) }));
  const [openSection, setOpenSection] = useState("excel");

  const Collapsible = ({ id, title, Icon, children }) => (
    <div className="mb-3 rounded-2xl overflow-hidden" style={{ border: "1px solid #E5DAC0", backgroundColor: "#fff" }}>
      <button onClick={() => setOpenSection(openSection === id ? "" : id)} className="w-full flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 font-bold text-sm" style={{ color: INDIGO }}><Icon size={16} /> {title}</span>
        <ChevronDown size={16} style={{ transform: openSection === id ? "rotate(180deg)" : "none", transition: "0.2s" }} />
      </button>
      {openSection === id && <div className="px-4 pb-4">{children}</div>}
    </div>
  );

  return (
    <div className="px-4 pb-6">
      <SectionTitle eyebrow="שימושי לדרך" title="מידע שימושי" Icon={Info} />

      <Collapsible id="excel" title="סנכרון לוז מ-Excel" Icon={FileSpreadsheet}><ExcelSyncPanel excel={excel} onRefresh={onRefreshExcel} /></Collapsible>
      <Collapsible id="translate" title="תרגום מהיר (Google Translate)" Icon={Languages}><QuickTranslate /></Collapsible>
      <Collapsible id="jp" title="מילון עברית ↔ יפנית" Icon={Landmark}><DictionarySection flag="🇯🇵" dictionary={DICTIONARY_JP} lang="ja-JP" /></Collapsible>
      <Collapsible id="kr" title="מילון עברית ↔ קוריאנית" Icon={Landmark}><DictionarySection flag="🇰🇷" dictionary={DICTIONARY_KR} lang="ko-KR" /></Collapsible>

      <Collapsible id="packing" title={`רשימת אריזה (${data.packing.filter((p) => p.checked).length}/${data.packing.length})`} Icon={Backpack}>
        <div className="space-y-1.5 mb-3">
          {data.packing.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <button onClick={() => togglePack(p.id)} className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0" style={{ borderColor: p.checked ? INDIGO : "#D9CBA5", backgroundColor: p.checked ? INDIGO : "transparent" }}>{p.checked && <Check size={12} color="#fff" />}</button>
              <span className={`text-sm flex-1 ${p.checked ? "line-through opacity-50" : ""}`} style={{ color: INK }}>{p.label}</span>
              <button onClick={() => removePack(p.id)}><X size={13} color="#B0A483" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="הוספת פריט" className="flex-1 rounded-lg px-3 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
          <button onClick={addPack} className="rounded-lg px-3 text-white" style={{ backgroundColor: INDIGO }}><Plus size={14} /></button>
        </div>
      </Collapsible>

      <Collapsible id="emergency" title="מספרי חירום ומידע נוסף" Icon={ShieldAlert}>
        <div className="text-sm space-y-2" style={{ color: INK }}>
          <div>🇯🇵 <b>יפן</b> — משטרה: 110 · אמבולנס/כיבוי אש: 119</div>
          <div>🇰🇷 <b>קוריאה</b> — משטרה: 112 · אמבולנס/כיבוי אש: 119 · קו מידע לתיירים: 1330</div>
          <div className="flex items-start gap-1.5 pt-1"><Wifi size={14} className="mt-0.5 shrink-0" /> מומלץ להזמין eSIM / פוקט וויפיי מראש לניווט שוטף.</div>
          <div className="flex items-start gap-1.5"><Plane size={14} className="mt-0.5 shrink-0" /> שקלו JR Pass אם מתכננים כמה נסיעות בין ערים.</div>
          <div>שקע חשמל: Type A (כמו בארה"ב), מתח 100V.</div>
          <div>טיפים: לא מקובל לתת טיפ ביפן ובקוריאה.</div>
        </div>
      </Collapsible>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home tab                                                             */
/* ------------------------------------------------------------------ */

function SettingsModal({ names, onSave, onClose, onReset }) {
  const [n1, setN1] = useState(names[0] || ""); const [n2, setN2] = useState(names[1] || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: PAPER }}>
        <h3 className="font-bold text-lg mb-4" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>הגדרות</h3>
        <label className="text-xs font-medium block mb-1" style={{ color: "#8A7F63" }}>שם ראשון</label>
        <input value={n1} onChange={(e) => setN1(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-3" style={{ borderColor: "#E5DAC0" }} />
        <label className="text-xs font-medium block mb-1" style={{ color: "#8A7F63" }}>שם שני</label>
        <input value={n2} onChange={(e) => setN2(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-4" style={{ borderColor: "#E5DAC0" }} />
        <div className="text-[11px] mb-4 leading-relaxed" style={{ color: "#8A7F63" }}>טיפ: אפשר גם לקבוע את השמות קבוע בקוד — בראש הקובץ App.jsx, בשורות DEFAULT_NAME_1 ו-DEFAULT_NAME_2.</div>
        <button onClick={() => onSave([n1, n2])} className="w-full rounded-xl py-2 text-sm font-semibold text-white mb-2" style={{ backgroundColor: INDIGO }}>שמירה</button>
        <button onClick={onReset} className="w-full rounded-xl py-2 text-sm font-semibold" style={{ backgroundColor: "#F6E5DE", color: VERMILLION }}>איפוס כל הנתונים</button>
      </div>
    </div>
  );
}

function CityHero({ inTrip, afterTrip, daysUntil, currentDayNum, tripLen, placeId, names }) {
  if (!inTrip && !afterTrip) {
    return (
      <ToriiFrame>
        <div className="text-center px-4">
          <div className="text-xl font-bold mb-1" style={{ color: INK, fontFamily: "'Heebo', sans-serif" }}>היי {names[0]} ו{names[1]}!</div>
          <div className="text-5xl font-extrabold" style={{ color: VERMILLION, fontFamily: "'Heebo', sans-serif" }}>{daysUntil}</div>
          <div className="text-sm font-medium mt-1" style={{ color: "#8A7F63" }}>ימים עד הטיול שלכם ליפן</div>
        </div>
      </ToriiFrame>
    );
  }
  if (afterTrip) {
    return (
      <div className="text-center px-4 py-6">
        <div className="text-xl font-bold mb-1" style={{ color: INK, fontFamily: "'Heebo', sans-serif" }}>היי {names[0]} ו{names[1]}!</div>
        <div className="text-2xl font-extrabold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>איך היה הטיול? 🌸</div>
        <div className="text-sm font-medium mt-1" style={{ color: "#8A7F63" }}>אפשר עדיין לדפדף בזיכרונות ובסימונים שלכם</div>
      </div>
    );
  }
  const place = placeById(placeId) || { emoji: "🎌", label: "בדרכים", grad: [INDIGO, INDIGO_MID] };
  return (
    <div className="rounded-3xl overflow-hidden relative mx-1 mb-1" style={{ background: `linear-gradient(135deg, ${place.grad[0]}, ${place.grad[1]})` }}>
      <div className="text-center px-4 py-7 relative z-10">
        <div className="text-sm font-semibold text-white/80 mb-1">היי {names[0]} ו{names[1]} 👋</div>
        <div className="text-7xl leading-none mb-2 animate-float-soft inline-block">{place.emoji}</div>
        <div className="text-white font-extrabold text-xl" style={{ fontFamily: "'Heebo', sans-serif" }}>{place.label}</div>
        <div className="text-white/80 text-sm font-medium mt-1">יום {currentDayNum} מתוך {tripLen} בטיול 🎌</div>
      </div>
    </div>
  );
}

function MiniWeatherBadge({ code, max }) {
  const { Icon, color } = weatherVisual(code);
  return <div className="flex items-center gap-1 text-xs font-bold" style={{ color: INK }}><Icon size={16} style={{ color }} />{max}°</div>;
}

function UpcomingDayCard({ dateKey, merged, weather, weatherStatus, onOpen }) {
  const items = (merged.itemsByDate[dateKey] || []).slice(0, 3);
  const placeId = merged.cityForDate(dateKey);
  const place = placeId ? placeById(placeId) : null;
  const isToday = dateKey === todayKey();
  const w = place?.weatherCity ? weather[place.weatherCity]?.[dateKey] : null;

  return (
    <button onClick={() => onOpen(dateKey)} className="w-full text-right rounded-2xl overflow-hidden mb-2.5" style={{ backgroundColor: "#fff", border: `1.5px solid ${isToday ? GOLD : "#E5DAC0"}` }}>
      <div className="px-3.5 py-3 flex items-center justify-between" style={{ background: place ? `linear-gradient(90deg, ${place.grad[0]}14, transparent)` : "transparent" }}>
        <div className="flex items-center gap-2">
          <div className="text-center leading-none">
            <div className="text-[10px] font-semibold" style={{ color: "#8A7F63" }}>{formatHeWeekdayShort(dateKey)}</div>
            <div className="text-lg font-extrabold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>{keyToDate(dateKey).getDate()}</div>
          </div>
          {place ? <PlaceChip placeId={place.id} /> : <span className="text-xs" style={{ color: "#B0A483" }}>מקום לא נקבע</span>}
          {isToday && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: GOLD, color: "#fff" }}>היום</span>}
        </div>
        {weatherStatus === "ready" && w && <MiniWeatherBadge code={w.code} max={w.max} />}
      </div>
      <div className="px-3.5 pb-3">
        {items.length === 0 ? (
          <div className="text-xs py-1" style={{ color: "#B0A483" }}>עדיין לא תוכנן — הוסיפו פריטים ללוז</div>
        ) : (
          <div className="space-y-1">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-2 text-xs">
                {it.time && <span className="font-semibold shrink-0" style={{ color: INDIGO_MID }}>{it.time}</span>}
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: catById(it.category).color }} />
                <span className="truncate" style={{ color: "#6B6355" }}>{it.name}</span>
              </div>
            ))}
          </div>
        )}
        <div className="text-[11px] font-semibold mt-1.5" style={{ color: VERMILLION }}>לוז מלא ←</div>
      </div>
    </button>
  );
}

function HomeTab({ data, setData, merged, weather, weatherStatus, onOpenDay }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const today = todayKey();
  const daysUntil = dayDiff(today, TRIP_START);
  const daysUntilEnd = dayDiff(today, TRIP_END);
  const inTrip = daysUntil <= 0 && daysUntilEnd >= 0;
  const afterTrip = daysUntilEnd < 0;
  const tripLen = dayDiff(TRIP_START, TRIP_END) + 1;
  const currentDayNum = inTrip ? dayDiff(TRIP_START, today) + 1 : null;
  const todayPlace = merged.cityForDate(today);

  const allItems = Object.values(merged.itemsByDate).flat();
  const visitedCount = allItems.filter((i) => i.visited).length;

  const days = tripDays();
  const baseIdx = afterTrip ? -1 : Math.max(0, Math.min(dayDiff(TRIP_START, today), days.length - 1));
  const next3 = baseIdx >= 0 ? days.slice(baseIdx, baseIdx + 3) : [];

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between pt-4 pb-1">
        <div className="text-[11px] tracking-widest font-semibold uppercase" style={{ color: GOLD, fontFamily: "'Heebo', sans-serif" }}>יפן · קוריאה 2026</div>
        <button onClick={() => setSettingsOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}><Settings size={15} color={INDIGO} /></button>
      </div>

      <CityHero inTrip={inTrip} afterTrip={afterTrip} daysUntil={daysUntil} currentDayNum={currentDayNum} tripLen={tripLen} placeId={todayPlace} names={data.names} />

      {(inTrip || afterTrip) && (
        <div className="mt-3 mb-5">
          <div className="flex justify-between text-xs mb-1"><span style={{ color: "#8A7F63" }}>סומנו כ"ביקרנו"</span><span style={{ color: "#8A7F63" }}>{visitedCount}/{allItems.length || 0}</span></div>
          <div className="h-2 rounded-full bg-black/5"><div className="h-2 rounded-full" style={{ width: `${allItems.length ? (visitedCount / allItems.length) * 100 : 0}%`, backgroundColor: VERMILLION }} /></div>
        </div>
      )}

      <div className="mt-5">
        <SectionTitle eyebrow="עדכני לרגע זה" title="מזג אוויר ביעדים" Icon={Cloud} />
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {WEATHER_CITIES.map((c) => {
            const w = weather[c.id] && weather[c.id][today];
            const { Icon, color } = w ? weatherVisual(w.code) : { Icon: Cloud, color: "#B0A483" };
            return (
              <div key={c.id} className="shrink-0 rounded-xl px-3 py-2 text-center" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0", minWidth: 74 }}>
                <div className="text-[10px] font-semibold mb-1 whitespace-nowrap" style={{ color: INDIGO }}>{c.label}</div>
                {weatherStatus === "ready" && w ? (<><Icon size={18} style={{ color, margin: "0 auto" }} /><div className="text-xs font-bold mt-1" style={{ color: INK }}>{w.max}°</div></>) : (
                  <div className="text-[10px] py-1.5" style={{ color: "#B0A483" }}>{weatherStatus === "loading" ? "…" : "—"}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {next3.length > 0 && (
        <div className="mt-5">
          <SectionTitle eyebrow={inTrip ? "מה קורה עכשיו" : "טעימה מהטיול"} title="3 הימים הקרובים" Icon={CalendarDays} />
          {next3.map((d) => <UpcomingDayCard key={d} dateKey={d} merged={merged} weather={weather} weatherStatus={weatherStatus} onOpen={onOpenDay} />)}
        </div>
      )}

      {settingsOpen && (
        <SettingsModal names={data.names} onClose={() => setSettingsOpen(false)}
          onSave={(names) => { setData((d) => ({ ...d, names })); setSettingsOpen(false); }}
          onReset={async () => { if (confirm("לאפס את כל הנתונים? פעולה זו לא ניתנת לביטול.")) { try { await window.storage.delete(STORAGE_KEY, false); } catch (e) {} window.location.reload(); } }} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root App                                                              */
/* ------------------------------------------------------------------ */

export default function JapanTripApp() {
  const [data, setData, loaded] = useTripData();
  const [weather, weatherStatus] = useWeather();
  const [excel, refreshExcel] = useExcelItinerary();
  const merged = useMergedTrip(data, excel);
  const [tab, setTab] = useState("home");
  const [openDay, setOpenDay] = useState(null);

  const TABS = [
    { id: "home", label: "בית", Icon: Home },
    { id: "calendar", label: "לוח שנה", Icon: CalendarDays },
    { id: "weather", label: "מזג אוויר", Icon: Cloud },
    { id: "budget", label: "תקציב", Icon: Wallet },
    { id: "info", label: "מידע", Icon: Info },
  ];

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PAPER }}><div className="text-sm animate-pulse" style={{ color: "#8A7F63" }}>טוען את הטיול שלכם…</div></div>;
  }

  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: PAPER, fontFamily: "'Rubik', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800&family=Rubik:wght@300;400;500;600;700&display=swap');
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-sheet-up { animation: sheetUp 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
        @keyframes floatSoft { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-10px) rotate(3deg); } }
        .animate-float-soft { animation: floatSoft 3.2s ease-in-out infinite; }
        input:focus, textarea:focus, button:focus-visible { outline: 2px solid #35577D; outline-offset: 1px; }
        * { box-sizing: border-box; }
      `}</style>

      <div className="max-w-lg mx-auto pb-24">
        {tab === "home" && <HomeTab data={data} setData={setData} merged={merged} weather={weather} weatherStatus={weatherStatus} onOpenDay={(k) => { setTab("calendar"); setOpenDay(k); }} />}
        {tab === "calendar" && <CalendarTab merged={merged} onPick={setOpenDay} />}
        {tab === "weather" && <WeatherTab weather={weather} status={weatherStatus} />}
        {tab === "budget" && <BudgetTab data={data} setData={setData} merged={merged} />}
        {tab === "info" && <InfoTab data={data} setData={setData} excel={excel} onRefreshExcel={refreshExcel} />}
      </div>

      {openDay && <DaySheet dateKey={openDay} data={data} setData={setData} merged={merged} weather={weather} weatherStatus={weatherStatus} onClose={() => setOpenDay(null)} />}

      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-1 p-2 rounded-t-3xl" style={{ backgroundColor: "#fff", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition" style={{ backgroundColor: tab === t.id ? "#EFE7D4" : "transparent" }}>
              <t.Icon size={18} color={tab === t.id ? VERMILLION : "#B0A483"} />
              <span className="text-[10px] font-semibold" style={{ color: tab === t.id ? INDIGO : "#B0A483" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
