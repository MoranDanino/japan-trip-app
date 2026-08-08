import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Camera, Sparkles, Utensils, UtensilsCrossed, CalendarCheck, Ticket, Bus,
  ShoppingBag, Star, MapPin, Clock, Check, X, Plus, Settings, ChevronLeft,
  ChevronRight, Cloud, Sun, CloudRain, CloudSnow, CloudFog, CloudLightning,
  CloudDrizzle, Wallet, Backpack, Info, Trash2, Pencil, ExternalLink, Home,
  CalendarDays, Plane, ShieldAlert, Wifi, Landmark, ChevronDown, StickyNote,
  Volume2, Languages, Send, MessageCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const TRIP_START = "2026-09-05";
const TRIP_END = "2026-10-07";

const CITIES = [
  { id: "tokyo", label: "טוקיו", lat: 35.6762, lon: 139.6503 },
  { id: "osaka", label: "אוסקה", lat: 34.6937, lon: 135.5023 },
  { id: "kyoto", label: "קיוטו", lat: 35.0116, lon: 135.7681 },
  { id: "seoul", label: "סיאול", lat: 37.5665, lon: 126.978 },
];

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
const cityById = (id) => CITIES.find((c) => c.id === id);

const INK = "#2B2926";
const PAPER = "#F7F1E4";
const PAPER_SOFT = "#FBF7ED";
const INDIGO = "#1F3A5F";
const INDIGO_MID = "#35577D";
const VERMILLION = "#C8442D";
const GOLD = "#C9A24B";

const DEFAULT_PACKING = [
  "דרכון + צילום גיבוי",
  "כרטיסי טיסה / אישורי הזמנה",
  "ביטוח נסיעות",
  "כרטיס JR Pass / IC Card (Suica/Icoca)",
  "מתאם חשמל יפני (Type A)",
  "פאוור בנק",
  "מטענים וכבלים",
  "מזומן (יין) לעסקאות קטנות",
  "נעליים נוחות להליכה",
  "מטרייה קומפקטית",
  "תרופות אישיות",
];

const DICTIONARY_JP = [
  {
    category: "ברכות ושיחת חולין",
    items: [
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
    ],
  },
  {
    category: "מספרים 1–10",
    items: [
      { he: "אחת", native: "一 (いち)", translit: "Ichi" },
      { he: "שתיים", native: "二 (に)", translit: "Ni" },
      { he: "שלוש", native: "三 (さん)", translit: "San" },
      { he: "ארבע", native: "四 (よん)", translit: "Yon" },
      { he: "חמש", native: "五 (ご)", translit: "Go" },
      { he: "שש", native: "六 (ろく)", translit: "Roku" },
      { he: "שבע", native: "七 (なな)", translit: "Nana" },
      { he: "שמונה", native: "八 (はち)", translit: "Hachi" },
      { he: "תשע", native: "九 (きゅう)", translit: "Kyuu" },
      { he: "עשר", native: "十 (じゅう)", translit: "Juu" },
    ],
  },
  {
    category: "כיוונים ותחבורה",
    items: [
      { he: "ימינה", native: "右 (みぎ)", translit: "Migi" },
      { he: "שמאלה", native: "左 (ひだり)", translit: "Hidari" },
      { he: "ישר", native: "まっすぐ", translit: "Massugu" },
      { he: "היכן התחנה?", native: "駅はどこですか？", translit: "Eki wa doko desu ka?" },
      { he: "כמה זה עולה?", native: "いくらですか？", translit: "Ikura desu ka?" },
      { he: "כרטיס", native: "切符", translit: "Kippu" },
    ],
  },
  {
    category: "אוכל",
    items: [
      { he: "טעים!", native: "おいしい！", translit: "Oishii!" },
      { he: "חשבון בבקשה", native: "お会計お願いします", translit: "Okaikei onegaishimasu" },
      { he: "לא חריף בבקשה", native: "辛くないでください", translit: "Karakunai de kudasai" },
      { he: "צמחוני/ת", native: "ベジタリアン", translit: "Bejitarian" },
      { he: "מים בבקשה", native: "お水をください", translit: "Omizu wo kudasai" },
      { he: "אחד מזה בבקשה", native: "一つください", translit: "Hitotsu kudasai" },
    ],
  },
  {
    category: "חירום ובקשת עזרה",
    items: [
      { he: "עזרה!", native: "助けて！", translit: "Tasukete!" },
      { he: "אני צריכ/ה רופא", native: "医者が必要です", translit: "Isha ga hitsuyou desu" },
      { he: "היכן השירותים?", native: "トイレはどこですか？", translit: "Toire wa doko desu ka?" },
      { he: "אני לא מבינ/ה", native: "わかりません", translit: "Wakarimasen" },
      { he: "את/ה מדבר/ת אנגלית?", native: "英語を話せますか？", translit: "Eigo wo hanasemasu ka?" },
    ],
  },
];

const DICTIONARY_KR = [
  {
    category: "ברכות ושיחת חולין",
    items: [
      { he: "שלום", native: "안녕하세요", translit: "Annyeonghaseyo" },
      { he: "תודה רבה", native: "감사합니다", translit: "Gamsahamnida" },
      { he: "סליחה / התנצלות", native: "죄송합니다", translit: "Joesonghamnida" },
      { he: "כן", native: "네", translit: "Ne" },
      { he: "לא", native: "아니요", translit: "Aniyo" },
      { he: "להתראות (את/ה יוצא/ת)", native: "안녕히 계세요", translit: "Annyeonghi gyeseyo" },
      { he: "נעים להכיר", native: "만나서 반갑습니다", translit: "Mannaseo bangapseumnida" },
    ],
  },
  {
    category: "מספרים 1–10",
    items: [
      { he: "אחת", native: "일", translit: "Il" },
      { he: "שתיים", native: "이", translit: "I" },
      { he: "שלוש", native: "삼", translit: "Sam" },
      { he: "ארבע", native: "사", translit: "Sa" },
      { he: "חמש", native: "오", translit: "O" },
      { he: "שש", native: "육", translit: "Yuk" },
      { he: "שבע", native: "칠", translit: "Chil" },
      { he: "שמונה", native: "팔", translit: "Pal" },
      { he: "תשע", native: "구", translit: "Gu" },
      { he: "עשר", native: "십", translit: "Sip" },
    ],
  },
  {
    category: "כיוונים ותחבורה",
    items: [
      { he: "ימינה", native: "오른쪽", translit: "Oreunjjok" },
      { he: "שמאלה", native: "왼쪽", translit: "Oenjjok" },
      { he: "ישר", native: "직진", translit: "Jikjin" },
      { he: "היכן התחנה?", native: "역이 어디예요?", translit: "Yeogi eodiyeyo?" },
      { he: "כמה זה עולה?", native: "얼마예요？", translit: "Eolmayeyo?" },
    ],
  },
  {
    category: "אוכל",
    items: [
      { he: "טעים!", native: "맛있어요!", translit: "Masisseoyo!" },
      { he: "חשבון בבקשה", native: "계산서 주세요", translit: "Gyesanseo juseyo" },
      { he: "מים בבקשה", native: "물 주세요", translit: "Mul juseyo" },
      { he: "לא חריף בבקשה", native: "안 맵게 해주세요", translit: "An maepge haejuseyo" },
    ],
  },
  {
    category: "חירום ובקשת עזרה",
    items: [
      { he: "עזרה!", native: "도와주세요!", translit: "Dowajuseyo!" },
      { he: "אני צריכ/ה רופא", native: "의사가 필요해요", translit: "Uisaga pilyohaeyo" },
      { he: "היכן השירותים?", native: "화장실이 어디예요？", translit: "Hwajangsiri eodiyeyo?" },
      { he: "אני לא מבינ/ה", native: "이해가 안 돼요", translit: "Ihaega an dwaeyo" },
      { he: "את/ה מדבר/ת אנגלית?", native: "영어 하세요?", translit: "Yeongeo haseyo?" },
    ],
  },
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
  } catch (e) {
    return false;
  }
}

const WEEKDAYS_HE = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function toKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function keyToDate(k) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(k, n) {
  const d = keyToDate(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
}
function dayDiff(aKey, bKey) {
  const a = keyToDate(aKey), b = keyToDate(bKey);
  return Math.round((b - a) / 86400000);
}
function formatHeDate(k) {
  const d = keyToDate(k);
  return d.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
}
function formatHeShort(k) {
  const d = keyToDate(k);
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}
function todayKey() {
  return toKey(new Date());
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function tripDays() {
  const days = [];
  let cur = TRIP_START;
  while (dayDiff(cur, TRIP_END) >= 0) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
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
};

/* ------------------------------------------------------------------ */
/* Storage hook                                                       */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "japan-trip-data-v1";
const DEFAULT_DATA = {
  names: ["נועה", "איתי"],
  dayCities: {},
  dayNotes: {},
  itinerary: {},
  packing: DEFAULT_PACKING.map((label) => ({ id: uid(), label, checked: false })),
  extraExpenses: [],
};

function useTripData() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (!cancelled && res && res.value) {
          const parsed = JSON.parse(res.value);
          setData((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        /* no saved data yet */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const res = await window.storage.set(STORAGE_KEY, JSON.stringify(data), false);
        setSaveError(!res);
      } catch (e) {
        setSaveError(true);
      }
    })();
  }, [data, loaded]);

  return [data, setData, loaded, saveError];
}

/* ------------------------------------------------------------------ */
/* Weather hook                                                       */
/* ------------------------------------------------------------------ */

function useWeather() {
  const [weather, setWeather] = useState({});
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          CITIES.map(async (c) => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`;
            const r = await fetch(url);
            if (!r.ok) throw new Error("bad response");
            const j = await r.json();
            const byDate = {};
            j.daily.time.forEach((t, i) => {
              byDate[t] = {
                code: j.daily.weathercode[i],
                max: Math.round(j.daily.temperature_2m_max[i]),
                min: Math.round(j.daily.temperature_2m_min[i]),
              };
            });
            return [c.id, byDate];
          })
        );
        if (!cancelled) {
          const obj = {};
          results.forEach(([id, byDate]) => (obj[id] = byDate));
          setWeather(obj);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return [weather, status];
}

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                     */
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
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-300"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "scale(1) rotate(-8deg)" : "scale(1.6) rotate(-8deg)",
      }}
    >
      <div
        className="w-14 h-14 rounded-md border-4 flex items-center justify-center text-[10px] font-bold leading-tight text-center"
        style={{
          borderColor: VERMILLION,
          color: VERMILLION,
          fontFamily: "'Heebo', sans-serif",
          boxShadow: "0 0 0 2px rgba(200,68,45,0.15)",
        }}
      >
        ביקרנו<br />旅
      </div>
    </div>
  );
}

function CategoryChip({ cat, small }) {
  const { Icon, label, color } = cat;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${small ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <Icon size={small ? 11 : 13} />
      {label}
    </span>
  );
}

function SectionTitle({ eyebrow, title, Icon }) {
  return (
    <div className="mb-3">
      {eyebrow && (
        <div className="text-[11px] tracking-widest font-semibold uppercase mb-1" style={{ color: GOLD, fontFamily: "'Heebo', sans-serif" }}>
          {eyebrow}
        </div>
      )}
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} style={{ color: INDIGO }} />}
        <h2 className="text-lg font-bold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>{title}</h2>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Weather card                                                       */
/* ------------------------------------------------------------------ */

function DayWeatherBadge({ weather, status, cityId, dateKey }) {
  if (!cityId) {
    return <div className="text-xs px-3 py-2 rounded-xl" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>הגדירו עיר ליום זה כדי לראות תחזית</div>;
  }
  if (status === "loading") {
    return <div className="text-xs px-3 py-2 rounded-xl animate-pulse" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>טוען תחזית…</div>;
  }
  const cityWeather = weather[cityId];
  const entry = cityWeather && cityWeather[dateKey];
  if (!entry) {
    return (
      <div className="text-xs px-3 py-2 rounded-xl leading-relaxed" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
        התחזית המדויקת תתעדכן כשנתקרב לתאריך (עד 16 יום מראש).
        <br />ממוצע אקלימי: {CLIMATE_NOTE[cityId]}
      </div>
    );
  }
  const { Icon, label, color } = weatherVisual(entry.code);
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ backgroundColor: "#EFE7D4" }}>
      <Icon size={26} style={{ color }} />
      <div className="text-sm">
        <div className="font-semibold" style={{ color: INK }}>{label} · {cityById(cityId)?.label}</div>
        <div style={{ color: "#8A7F63" }}>גבוה {entry.max}° / נמוך {entry.min}°</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Item form (add / edit itinerary item)                              */
/* ------------------------------------------------------------------ */

function ItemForm({ initial, dateKey, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { time: "", name: "", category: "attraction", place: "", openTime: "", closeTime: "", notes: "", price: "", visited: false }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: PAPER_SOFT, border: `1px solid #E5DAC0` }}>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>שעה</label>
          <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)}
            className="w-full rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>מחיר (אופציונלי, ¥)</label>
          <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0"
            className="w-full rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        </div>
      </div>

      <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>שם המקום / הפעילות</label>
      <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="לדוגמה: מקדש סנסו־ג'י"
        className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-2" style={{ borderColor: "#E5DAC0" }} />

      <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>כתובת / שם לחיפוש ב-Google Maps</label>
      <input value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="לדוגמה: Sensoji Temple, Tokyo"
        className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-2" style={{ borderColor: "#E5DAC0" }} />

      <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>קטגוריה</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => set("category", c.id)}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium border transition"
            style={{
              backgroundColor: form.category === c.id ? c.color : "transparent",
              color: form.category === c.id ? "#fff" : c.color,
              borderColor: c.color,
            }}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>שעת פתיחה</label>
          <input type="time" value={form.openTime} onChange={(e) => set("openTime", e.target.value)}
            className="w-full rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>שעת סגירה</label>
          <input type="time" value={form.closeTime} onChange={(e) => set("closeTime", e.target.value)}
            className="w-full rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: "#E5DAC0" }} />
        </div>
      </div>

      <label className="text-[11px] font-medium block mb-1" style={{ color: "#8A7F63" }}>הערות</label>
      <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="פרטים נוספים, מס' הזמנה וכו׳"
        className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-3 resize-none" style={{ borderColor: "#E5DAC0" }} />

      <div className="flex gap-2">
        <button onClick={() => form.name.trim() && onSave({ ...form, id: form.id || uid() })}
          className="flex-1 rounded-xl py-2 text-sm font-semibold text-white flex items-center justify-center gap-1"
          style={{ backgroundColor: INDIGO }}>
          <Check size={15} /> שמירה
        </button>
        <button onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-medium" style={{ backgroundColor: "#E5DAC0", color: INK }}>
          ביטול
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Itinerary item card                                                */
/* ------------------------------------------------------------------ */

function ItemCard({ item, onToggleVisited, onEdit, onDelete }) {
  const cat = catById(item.category);
  const { Icon } = cat;
  const mapsUrl = item.place
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.place)}`
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2.5 border" style={{ borderColor: "#E5DAC0", backgroundColor: "#fff" }}>
      <div className="absolute right-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: cat.color }} />
      <HankoStamp show={item.visited} />
      <div className="p-3 pr-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {item.time && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: INDIGO }}>
                  <Clock size={12} /> {item.time}
                </span>
              )}
              <CategoryChip cat={cat} small />
            </div>
            <div className="font-bold text-[15px]" style={{ color: INK, fontFamily: "'Heebo', sans-serif" }}>{item.name}</div>
            {(item.openTime || item.closeTime) && (
              <div className="text-xs mt-0.5" style={{ color: "#8A7F63" }}>
                שעות פתיחה: {item.openTime || "?"} – {item.closeTime || "?"}
              </div>
            )}
            {item.price && (
              <div className="text-xs mt-0.5 font-medium" style={{ color: GOLD }}>~¥{item.price}</div>
            )}
            {item.notes && <div className="text-xs mt-1 leading-relaxed" style={{ color: "#6B6355" }}>{item.notes}</div>}
          </div>
          <button onClick={() => onToggleVisited(item.id)}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition"
            style={{ borderColor: item.visited ? VERMILLION : "#D9CBA5", backgroundColor: item.visited ? VERMILLION : "transparent" }}>
            <Check size={16} color={item.visited ? "#fff" : "#D9CBA5"} />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t" style={{ borderColor: "#F0E9D6" }}>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: INDIGO_MID }}>
              <MapPin size={13} /> ניווט ב-Google Maps <ExternalLink size={11} />
            </a>
          )}
          <button onClick={() => onEdit(item)} className="inline-flex items-center gap-1 text-xs font-medium mr-auto" style={{ color: "#8A7F63" }}>
            <Pencil size={12} /> עריכה
          </button>
          <button onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: VERMILLION }}>
            <Trash2 size={12} /> מחיקה
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Day Sheet (bottom sheet with full day detail)                      */
/* ------------------------------------------------------------------ */

function DaySheet({ dateKey, data, setData, weather, weatherStatus, onClose }) {
  const [adding, setAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const items = (data.itinerary[dateKey] || []).slice().sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
  const cityId = data.dayCities[dateKey] || "";
  const note = data.dayNotes[dateKey] || "";

  const setCityForDay = (c) => setData((d) => ({ ...d, dayCities: { ...d.dayCities, [dateKey]: c } }));
  const setNoteForDay = (v) => setData((d) => ({ ...d, dayNotes: { ...d.dayNotes, [dateKey]: v } }));

  const saveItem = (item) => {
    setData((d) => {
      const list = d.itinerary[dateKey] ? [...d.itinerary[dateKey]] : [];
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx >= 0) list[idx] = item; else list.push(item);
      return { ...d, itinerary: { ...d.itinerary, [dateKey]: list } };
    });
    setAdding(false);
    setEditingItem(null);
  };
  const deleteItem = (id) => {
    setData((d) => ({ ...d, itinerary: { ...d.itinerary, [dateKey]: (d.itinerary[dateKey] || []).filter((i) => i.id !== id) } }));
  };
  const toggleVisited = (id) => {
    setData((d) => ({
      ...d,
      itinerary: {
        ...d.itinerary,
        [dateKey]: (d.itinerary[dateKey] || []).map((i) => (i.id === id ? { ...i, visited: !i.visited } : i)),
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-3xl overflow-hidden flex flex-col animate-sheet-up"
        style={{ backgroundColor: PAPER, maxHeight: "92vh" }}>
        <div className="w-10 h-1.5 rounded-full bg-black/15 mx-auto mt-3" />
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div>
            <div className="text-[11px] tracking-wide font-semibold uppercase" style={{ color: GOLD }}>לוז יומי</div>
            <h3 className="text-lg font-bold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>{formatHeDate(dateKey)}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E5DAC0" }}>
            <X size={16} color={INK} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-6" style={{ flex: 1 }}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {CITIES.map((c) => (
              <button key={c.id} onClick={() => setCityForDay(c.id)}
                className="rounded-full px-3 py-1 text-xs font-semibold border"
                style={{
                  backgroundColor: cityId === c.id ? INDIGO : "transparent",
                  color: cityId === c.id ? "#fff" : INDIGO,
                  borderColor: INDIGO,
                }}>
                {c.label}
              </button>
            ))}
          </div>

          <DayWeatherBadge weather={weather} status={weatherStatus} cityId={cityId} dateKey={dateKey} />

          <div className="mt-3 mb-4">
            <label className="text-[11px] font-medium flex items-center gap-1 mb-1" style={{ color: "#8A7F63" }}>
              <StickyNote size={12} /> הערת יום (לוגיסטיקה, מלון, מזוודות...)
            </label>
            <textarea value={note} onChange={(e) => setNoteForDay(e.target.value)} rows={2} placeholder="לדוגמה: צ'ק-אאוט מהמלון ב-10:00, מזוודות בלוקר בתחנה"
              className="w-full rounded-lg px-3 py-2 text-sm border outline-none resize-none" style={{ borderColor: "#E5DAC0", backgroundColor: "#fff" }} />
          </div>

          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm" style={{ color: INK }}>לוח זמנים ({items.length})</h4>
            {!adding && !editingItem && (
              <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 text-white" style={{ backgroundColor: VERMILLION }}>
                <Plus size={13} /> הוספת פריט
              </button>
            )}
          </div>

          {adding && <ItemForm dateKey={dateKey} onSave={saveItem} onCancel={() => setAdding(false)} />}
          {editingItem && <ItemForm initial={editingItem} dateKey={dateKey} onSave={saveItem} onCancel={() => setEditingItem(null)} />}

          {items.length === 0 && !adding && (
            <div className="text-sm text-center py-8 rounded-2xl" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
              עוד לא נוספו פריטים ליום הזה. לחצו על "הוספת פריט" כדי להתחיל לתכנן.
            </div>
          )}

          {items.map((item) => (
            <ItemCard key={item.id} item={item} onToggleVisited={toggleVisited} onEdit={setEditingItem} onDelete={deleteItem} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar tab                                                       */
/* ------------------------------------------------------------------ */

function MonthGrid({ year, month, data, onPick }) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_HE.map((w) => (
          <div key={w} className="text-center text-[11px] font-semibold py-1" style={{ color: "#8A7F63" }}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = toKey(new Date(year, month, d));
          const inTrip = dayDiff(TRIP_START, key) >= 0 && dayDiff(key, TRIP_END) >= 0;
          const isToday = key === todayKey();
          const cityId = data.dayCities[key];
          const items = data.itinerary[key] || [];
          const visitedCount = items.filter((i) => i.visited).length;

          return (
            <button key={i} disabled={!inTrip} onClick={() => onPick(key)}
              className="relative aspect-square rounded-xl flex flex-col items-center justify-center transition"
              style={{
                backgroundColor: inTrip ? (isToday ? INDIGO : "#fff") : "transparent",
                border: inTrip ? `1.5px solid ${isToday ? INDIGO : "#E5DAC0"}` : "none",
                opacity: inTrip ? 1 : 0.3,
                color: isToday ? "#fff" : INK,
              }}>
              <span className="text-sm font-semibold">{d}</span>
              {inTrip && cityId && (
                <span className="text-[8px] mt-0.5 font-medium truncate max-w-full px-1" style={{ color: isToday ? "#F0E9D6" : GOLD }}>
                  {cityById(cityId)?.label}
                </span>
              )}
              {inTrip && items.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 absolute bottom-1">
                  {items.slice(0, 4).map((it) => (
                    <span key={it.id} className="w-1 h-1 rounded-full" style={{ backgroundColor: isToday ? "#fff" : catById(it.category).color }} />
                  ))}
                </div>
              )}
              {inTrip && items.length > 0 && visitedCount === items.length && (
                <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: VERMILLION }}>
                  <Check size={9} color="#fff" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarTab({ data, setData, weather, weatherStatus, onPick }) {
  const [monthIdx, setMonthIdx] = useState(0);
  const months = [
    { year: 2026, month: 8, label: "ספטמבר 2026" },
    { year: 2026, month: 9, label: "אוקטובר 2026" },
  ];
  const m = months[monthIdx];

  return (
    <div className="px-4 pb-6">
      <SectionTitle eyebrow="התכנון היומי" title="לוח שנה של הטיול" Icon={CalendarDays} />
      <div className="flex items-center justify-between mb-3">
        <button disabled={monthIdx === 0} onClick={() => setMonthIdx((i) => i - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}>
          <ChevronRight size={16} />
        </button>
        <span className="font-bold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>{m.label}</span>
        <button disabled={monthIdx === months.length - 1} onClick={() => setMonthIdx((i) => i + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}>
          <ChevronLeft size={16} />
        </button>
      </div>
      <MonthGrid year={m.year} month={m.month} data={data} onPick={onPick} />

      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => <CategoryChip key={c.id} cat={c} small />)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Weather tab                                                        */
/* ------------------------------------------------------------------ */

function WeatherTab({ weather, status }) {
  const [city, setCity] = useState("tokyo");
  const cityWeather = weather[city] || {};
  const dates = Object.keys(cityWeather).sort();

  return (
    <div className="px-4 pb-6">
      <SectionTitle eyebrow="לפני שיוצאים" title="מזג האוויר ביעדים" Icon={Cloud} />
      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
        {CITIES.map((c) => (
          <button key={c.id} onClick={() => setCity(c.id)}
            className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold border"
            style={{ backgroundColor: city === c.id ? INDIGO : "#fff", color: city === c.id ? "#fff" : INDIGO, borderColor: INDIGO }}>
            {c.label}
          </button>
        ))}
      </div>

      {status === "loading" && (
        <div className="text-sm text-center py-10 animate-pulse" style={{ color: "#8A7F63" }}>טוענת תחזית עדכנית…</div>
      )}
      {status === "error" && (
        <div className="text-sm text-center py-6 rounded-2xl" style={{ backgroundColor: "#F6E5DE", color: VERMILLION }}>
          לא הצלחנו לטעון תחזית כרגע. בדקו את החיבור לאינטרנט ונסו שוב.
        </div>
      )}
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
            תחזית מדויקת זמינה עד 16 יום קדימה. עבור ימים רחוקים יותר בטיול:
            <br />{CLIMATE_NOTE[city]}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Budget tab                                                         */
/* ------------------------------------------------------------------ */

function BudgetTab({ data, setData }) {
  const allItems = Object.values(data.itinerary).flat();
  const itemsWithPrice = allItems.filter((i) => i.price && Number(i.price) > 0);
  const totalItinerary = itemsWithPrice.reduce((s, i) => s + Number(i.price), 0);
  const totalExtra = data.extraExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const total = totalItinerary + totalExtra;

  const byCategory = {};
  itemsWithPrice.forEach((i) => { byCategory[i.category] = (byCategory[i.category] || 0) + Number(i.price); });

  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const addExpense = () => {
    if (!label.trim() || !amount) return;
    setData((d) => ({ ...d, extraExpenses: [...d.extraExpenses, { id: uid(), label, amount: Number(amount) }] }));
    setLabel(""); setAmount("");
  };
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
              const cat = catById(catId);
              const pct = Math.round((sum / totalItinerary) * 100);
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
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: GOLD }}>¥{Number(e.amount).toLocaleString()}</span>
              <button onClick={() => removeExpense(e.id)}><Trash2 size={14} color={VERMILLION} /></button>
            </div>
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
/* Info tab (packing, phrases, emergency)                             */
/* ------------------------------------------------------------------ */

function DictionaryEntry({ entry, lang }) {
  const [playing, setPlaying] = useState(false);
  const handlePlay = () => {
    const ok = speak(entry.native, lang);
    if (ok) {
      setPlaying(true);
      setTimeout(() => setPlaying(false), 900);
    }
  };
  return (
    <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "#F0E9D6" }}>
      <div className="flex-1 min-w-0">
        <div className="text-sm" style={{ color: INK }}>{entry.he}</div>
        <div className="text-xs" style={{ color: "#8A7F63" }}>{entry.native} <span className="opacity-70">· {entry.translit}</span></div>
      </div>
      <button onClick={handlePlay} className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition"
        style={{ backgroundColor: playing ? INDIGO : "#EFE7D4" }} title="השמעה קולית">
        <Volume2 size={15} color={playing ? "#fff" : INDIGO} />
      </button>
    </div>
  );
}

function DictionarySection({ title, flag, dictionary, lang }) {
  const [openCat, setOpenCat] = useState(dictionary[0]?.category || "");
  return (
    <div>
      <div className="text-xs mb-2 leading-relaxed rounded-lg px-3 py-2" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
        {flag} לחיצה על כפתור הרמקול משמיעה הגייה אמיתית — עובד גם ללא אינטרנט לאחר טעינת העמוד (תלוי בקולות המותקנים במכשיר).
      </div>
      {dictionary.map((group) => (
        <div key={group.category} className="mb-2 rounded-xl overflow-hidden" style={{ border: "1px solid #F0E9D6" }}>
          <button onClick={() => setOpenCat(openCat === group.category ? "" : group.category)}
            className="w-full flex items-center justify-between px-3 py-2" style={{ backgroundColor: "#FBF7ED" }}>
            <span className="text-xs font-bold" style={{ color: INDIGO_MID }}>{group.category}</span>
            <ChevronDown size={14} style={{ transform: openCat === group.category ? "rotate(180deg)" : "none", transition: "0.2s", color: "#8A7F63" }} />
          </button>
          {openCat === group.category && (
            <div className="px-3 py-1">
              {group.items.map((it, i) => <DictionaryEntry key={i} entry={it} lang={lang} />)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function QuickTranslate() {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("ja");

  const openTranslate = () => {
    const url = `https://translate.google.com/?sl=auto&tl=${target}&text=${encodeURIComponent(text)}&op=translate`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const openConversation = () => {
    const url = `https://translate.google.com/?sl=${target}&tl=iw&op=translate`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <div className="text-xs mb-3 leading-relaxed rounded-lg px-3 py-2" style={{ backgroundColor: "#EFE7D4", color: "#8A7F63" }}>
        לתרגום חופשי של כל מילה או משפט — הכלי כאן פותח את Google Translate (אפליקציה או אתר) עם הטקסט ממולא מראש. טיפ: הורידו מראש בתוך אפליקציית Google Translate את חבילות השפה "יפנית" ו"קוריאנית" למצב אופליין אמיתי בזמן הטיול.
      </div>
      <div className="flex gap-2 mb-2">
        <button onClick={() => setTarget("ja")} className="flex-1 rounded-full py-1.5 text-xs font-semibold border"
          style={{ backgroundColor: target === "ja" ? INDIGO : "#fff", color: target === "ja" ? "#fff" : INDIGO, borderColor: INDIGO }}>יפנית 🇯🇵</button>
        <button onClick={() => setTarget("ko")} className="flex-1 rounded-full py-1.5 text-xs font-semibold border"
          style={{ backgroundColor: target === "ko" ? INDIGO : "#fff", color: target === "ko" ? "#fff" : INDIGO, borderColor: INDIGO }}>קוריאנית 🇰🇷</button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="כתבו כאן מילה או משפט בעברית..."
        className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-2 resize-none" style={{ borderColor: "#E5DAC0", backgroundColor: "#fff" }} />
      <div className="flex gap-2">
        <button onClick={openTranslate} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-white" style={{ backgroundColor: VERMILLION }}>
          <Send size={14} /> פתיחה בתרגום
        </button>
        <button onClick={openConversation} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold" style={{ backgroundColor: "#EFE7D4", color: INDIGO }}>
          <MessageCircle size={14} /> מצב שיחה
        </button>
      </div>
      <div className="text-[11px] mt-2" style={{ color: "#B0A483" }}>
        "מצב שיחה" פותח את Google Translate מוכן לתרגום דו-כיווני — בתוך האפליקציה עצמה אפשר לעבור למסך "Conversation" להקשבה הדדית בזמן אמת.
      </div>
    </div>
  );
}

function InfoTab({ data, setData }) {
  const [newItem, setNewItem] = useState("");
  const togglePack = (id) => setData((d) => ({ ...d, packing: d.packing.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)) }));
  const addPack = () => {
    if (!newItem.trim()) return;
    setData((d) => ({ ...d, packing: [...d.packing, { id: uid(), label: newItem, checked: false }] }));
    setNewItem("");
  };
  const removePack = (id) => setData((d) => ({ ...d, packing: d.packing.filter((p) => p.id !== id) }));
  const [openSection, setOpenSection] = useState("packing");

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

      <Collapsible id="packing" title={`רשימת אריזה (${data.packing.filter((p) => p.checked).length}/${data.packing.length})`} Icon={Backpack}>
        <div className="space-y-1.5 mb-3">
          {data.packing.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <button onClick={() => togglePack(p.id)} className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: p.checked ? INDIGO : "#D9CBA5", backgroundColor: p.checked ? INDIGO : "transparent" }}>
                {p.checked && <Check size={12} color="#fff" />}
              </button>
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

      <Collapsible id="translate" title="תרגום מהיר (Google Translate)" Icon={Languages}>
        <QuickTranslate />
      </Collapsible>

      <Collapsible id="jp" title="מילון עברית ↔ יפנית" Icon={Landmark}>
        <DictionarySection title="יפנית" flag="🇯🇵" dictionary={DICTIONARY_JP} lang="ja-JP" />
      </Collapsible>

      <Collapsible id="kr" title="מילון עברית ↔ קוריאנית" Icon={Landmark}>
        <DictionarySection title="קוריאנית" flag="🇰🇷" dictionary={DICTIONARY_KR} lang="ko-KR" />
      </Collapsible>

      <Collapsible id="emergency" title="מספרי חירום ומידע נוסף" Icon={ShieldAlert}>
        <div className="text-sm space-y-2" style={{ color: INK }}>
          <div>🇯🇵 <b>יפן</b> — משטרה: 110 · אמבולנס/כיבוי אש: 119</div>
          <div>🇰🇷 <b>קוריאה</b> — משטרה: 112 · אמבולנס/כיבוי אש: 119 · קו מידע לתיירים: 1330</div>
          <div className="flex items-start gap-1.5 pt-1"><Wifi size={14} className="mt-0.5 shrink-0" /> מומלץ להזמין eSIM / פוקט וויפיי מראש לניווט שוטף.</div>
          <div className="flex items-start gap-1.5"><Plane size={14} className="mt-0.5 shrink-0" /> שקלו רכישת JR Pass מראש אם מתכננים כמה נסיעות בין ערים.</div>
          <div>שקע חשמל: Type A (כמו בארה"ב), מתח 100V — כדאי מתאם + אם צריך גם ממיר מתח.</div>
          <div>טיפים: לא מקובל לתת טיפ ביפן ובקוריאה — זה יכול אף להיחשב מוזר.</div>
        </div>
      </Collapsible>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home tab                                                            */
/* ------------------------------------------------------------------ */

function SettingsModal({ names, onSave, onClose, onReset }) {
  const [n1, setN1] = useState(names[0] || "");
  const [n2, setN2] = useState(names[1] || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: PAPER }}>
        <h3 className="font-bold text-lg mb-4" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>הגדרות</h3>
        <label className="text-xs font-medium block mb-1" style={{ color: "#8A7F63" }}>שם ראשון</label>
        <input value={n1} onChange={(e) => setN1(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-3" style={{ borderColor: "#E5DAC0" }} />
        <label className="text-xs font-medium block mb-1" style={{ color: "#8A7F63" }}>שם שני</label>
        <input value={n2} onChange={(e) => setN2(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none mb-4" style={{ borderColor: "#E5DAC0" }} />
        <button onClick={() => onSave([n1, n2])} className="w-full rounded-xl py-2 text-sm font-semibold text-white mb-2" style={{ backgroundColor: INDIGO }}>שמירה</button>
        <button onClick={onReset} className="w-full rounded-xl py-2 text-sm font-semibold" style={{ backgroundColor: "#F6E5DE", color: VERMILLION }}>איפוס כל הנתונים</button>
      </div>
    </div>
  );
}

function HomeTab({ data, setData, weather, weatherStatus, onOpenDay }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const today = todayKey();
  const daysUntil = dayDiff(today, TRIP_START);
  const daysUntilEnd = dayDiff(today, TRIP_END);
  const inTrip = daysUntil <= 0 && daysUntilEnd >= 0;
  const afterTrip = daysUntilEnd < 0;
  const tripLen = dayDiff(TRIP_START, TRIP_END) + 1;
  const currentDayNum = inTrip ? dayDiff(TRIP_START, today) + 1 : null;
  const todayCity = data.dayCities[today];

  const allItems = Object.entries(data.itinerary).flatMap(([k, arr]) => arr.map((i) => ({ ...i, dateKey: k })));
  const visitedCount = allItems.filter((i) => i.visited).length;

  const upcomingDate = useMemo(() => {
    const days = tripDays();
    const future = days.find((k) => dayDiff(today, k) >= 0 && (data.itinerary[k] || []).length > 0);
    return future || days.find((k) => (data.itinerary[k] || []).length > 0);
  }, [data.itinerary]);
  const upcomingItems = upcomingDate ? (data.itinerary[upcomingDate] || []).slice().sort((a, b) => (a.time || "99").localeCompare(b.time || "99")).slice(0, 3) : [];

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between pt-4 pb-1">
        <div className="text-[11px] tracking-widest font-semibold uppercase" style={{ color: GOLD, fontFamily: "'Heebo', sans-serif" }}>יפן · קוריאה 2026</div>
        <button onClick={() => setSettingsOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}>
          <Settings size={15} color={INDIGO} />
        </button>
      </div>

      <ToriiFrame>
        <div className="text-center px-4">
          <div className="text-xl font-bold mb-1" style={{ color: INK, fontFamily: "'Heebo', sans-serif" }}>
            היי {data.names[0]} ו{data.names[1]}!
          </div>
          {!inTrip && !afterTrip && (
            <>
              <div className="text-5xl font-extrabold" style={{ color: VERMILLION, fontFamily: "'Heebo', sans-serif" }}>{daysUntil}</div>
              <div className="text-sm font-medium mt-1" style={{ color: "#8A7F63" }}>ימים עד הטיול שלכם ליפן</div>
            </>
          )}
          {inTrip && (
            <>
              <div className="text-3xl font-extrabold" style={{ color: VERMILLION, fontFamily: "'Heebo', sans-serif" }}>יום {currentDayNum} מתוך {tripLen}</div>
              <div className="text-sm font-medium mt-1" style={{ color: "#8A7F63" }}>
                {todayCity ? `היום ב${cityById(todayCity)?.label}` : "נהנים מהטיול!"} 🎌
              </div>
            </>
          )}
          {afterTrip && (
            <>
              <div className="text-2xl font-extrabold" style={{ color: INDIGO, fontFamily: "'Heebo', sans-serif" }}>איך היה הטיול? 🌸</div>
              <div className="text-sm font-medium mt-1" style={{ color: "#8A7F63" }}>אפשר עדיין לדפדף בזיכרונות ובסימונים שלכם</div>
            </>
          )}
        </div>
      </ToriiFrame>

      {(inTrip || afterTrip) && (
        <div className="mt-2 mb-5">
          <div className="flex justify-between text-xs mb-1"><span style={{ color: "#8A7F63" }}>סומנו כ"ביקרנו"</span><span style={{ color: "#8A7F63" }}>{visitedCount}/{allItems.length || 0}</span></div>
          <div className="h-2 rounded-full bg-black/5"><div className="h-2 rounded-full" style={{ width: `${allItems.length ? (visitedCount / allItems.length) * 100 : 0}%`, backgroundColor: VERMILLION }} /></div>
        </div>
      )}

      <div className="mt-4">
        <SectionTitle eyebrow="עדכני לרגע זה" title="מזג אוויר ביעדים" Icon={Cloud} />
        <div className="grid grid-cols-4 gap-2">
          {CITIES.map((c) => {
            const w = weather[c.id] && weather[c.id][today];
            const { Icon, color } = w ? weatherVisual(w.code) : { Icon: Cloud, color: "#B0A483" };
            return (
              <div key={c.id} className="rounded-xl p-2 text-center" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}>
                <div className="text-[10px] font-semibold mb-1" style={{ color: INDIGO }}>{c.label}</div>
                {weatherStatus === "ready" && w ? (
                  <>
                    <Icon size={20} style={{ color, margin: "0 auto" }} />
                    <div className="text-xs font-bold mt-1" style={{ color: INK }}>{w.max}°</div>
                  </>
                ) : (
                  <div className="text-[10px] py-1.5" style={{ color: "#B0A483" }}>{weatherStatus === "loading" ? "…" : "אין נתון"}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {upcomingDate && (
        <div className="mt-5">
          <SectionTitle eyebrow="בקרוב בלוז" title={formatHeDate(upcomingDate)} Icon={CalendarDays} />
          <div className="space-y-2">
            {upcomingItems.map((it) => {
              const cat = catById(it.category);
              return (
                <button key={it.id} onClick={() => onOpenDay(upcomingDate)} className="w-full flex items-center gap-3 rounded-xl p-2.5 text-right" style={{ backgroundColor: "#fff", border: "1px solid #E5DAC0" }}>
                  <div className="w-1.5 self-stretch rounded-full" style={{ backgroundColor: cat.color }} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: INK }}>{it.name}</div>
                    <div className="text-[11px]" style={{ color: "#8A7F63" }}>{it.time && `${it.time} · `}{cat.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => onOpenDay(upcomingDate)} className="mt-2 text-xs font-semibold" style={{ color: INDIGO_MID }}>לצפייה בלוז המלא של היום →</button>
        </div>
      )}

      {settingsOpen && (
        <SettingsModal
          names={data.names}
          onClose={() => setSettingsOpen(false)}
          onSave={(names) => { setData((d) => ({ ...d, names })); setSettingsOpen(false); }}
          onReset={async () => {
            if (confirm("לאפס את כל הנתונים? פעולה זו לא ניתנת לביטול.")) {
              try { await window.storage.delete(STORAGE_KEY, false); } catch (e) {}
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root App                                                           */
/* ------------------------------------------------------------------ */

export default function JapanTripApp() {
  const [data, setData, loaded] = useTripData();
  const [weather, weatherStatus] = useWeather();
  const [tab, setTab] = useState("home");
  const [jumpDay, setJumpDay] = useState(null);

  const TABS = [
    { id: "home", label: "בית", Icon: Home },
    { id: "calendar", label: "לוח שנה", Icon: CalendarDays },
    { id: "weather", label: "מזג אוויר", Icon: Cloud },
    { id: "budget", label: "תקציב", Icon: Wallet },
    { id: "info", label: "מידע", Icon: Info },
  ];

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PAPER }}>
        <div className="text-sm animate-pulse" style={{ color: "#8A7F63" }}>טוען את הטיול שלכם…</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: PAPER, fontFamily: "'Rubik', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800&family=Rubik:wght@300;400;500;600;700&display=swap');
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-sheet-up { animation: sheetUp 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
        input:focus, textarea:focus, button:focus-visible { outline: 2px solid #35577D; outline-offset: 1px; }
        * { box-sizing: border-box; }
      `}</style>

      <div className="max-w-lg mx-auto pb-24">
        {tab === "home" && <HomeTab data={data} setData={setData} weather={weather} weatherStatus={weatherStatus} onOpenDay={(k) => { setTab("calendar"); setJumpDay(k); }} />}
        {tab === "calendar" && <CalendarTabWrapper data={data} setData={setData} weather={weather} weatherStatus={weatherStatus} jumpDay={jumpDay} clearJump={() => setJumpDay(null)} />}
        {tab === "weather" && <WeatherTab weather={weather} status={weatherStatus} />}
        {tab === "budget" && <BudgetTab data={data} setData={setData} />}
        {tab === "info" && <InfoTab data={data} setData={setData} />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-1 p-2 rounded-t-3xl" style={{ backgroundColor: "#fff", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition"
              style={{ backgroundColor: tab === t.id ? "#EFE7D4" : "transparent" }}>
              <t.Icon size={18} color={tab === t.id ? VERMILLION : "#B0A483"} />
              <span className="text-[10px] font-semibold" style={{ color: tab === t.id ? INDIGO : "#B0A483" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function CalendarTabWrapper({ data, setData, weather, weatherStatus, jumpDay, clearJump }) {
  const [openDay, setOpenDay] = useState(null);
  useEffect(() => {
    if (jumpDay) { setOpenDay(jumpDay); clearJump(); }
  }, [jumpDay]);

  return (
    <>
      <CalendarTab data={data} setData={setData} weather={weather} weatherStatus={weatherStatus} onPick={setOpenDay} />
      {openDay && (
        <DaySheet dateKey={openDay} data={data} setData={setData} weather={weather} weatherStatus={weatherStatus} onClose={() => setOpenDay(null)} />
      )}
    </>
  );
}
