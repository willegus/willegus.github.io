// ============================================================
//  REDIGERA HÄR – det här är allt du behöver ändra i vardagen
// ============================================================

// Utvalda TikTok-videos. Klistra in länken till ett klipp på en ny rad.
const VIDEOS = [
  "https://www.tiktok.com/@williamgu00/video/7695326491210435862",
  "https://www.tiktok.com/@williamgu00/video/7672325443105656086",
  "https://www.tiktok.com/@williamgu00/video/7616135818616376598",
];

// Ditt gear. Lägg till, ta bort eller ändra rader.
const GEAR = [
  {
    icon: "🎸",
    type: { sv: "Gitarr", en: "Guitar" },
    name: "Fender Stratocaster",
    note: { sv: "Min huvudgitarr – den du hör i nästan alla klipp.", en: "My main guitar – the one you hear in almost every clip." },
  },
  {
    icon: "🎛️",
    type: { sv: "Förstärkare & effekter", en: "Amp & effects" },
    name: "Guitar Rig 8",
    note: { sv: "Hela mitt ljud: förstärkare, pedaler och effekter.", en: "My whole sound: amps, pedals and effects." },
  },
];

// Alla texter på svenska och engelska.
const TEXTS = {
  sv: {
    navVideos: "Setlist",
    navAbout: "Om mig",
    navGear: "Gear",
    navContact: "Kontakt",
    eyebrow: "Gitarrcovers på TikTok",
    tagline: "Spelar gitarr och skapar covers! :)",
    emailBtn: "Mejla mig",
    strumHint: "Dra musen över strängarna – klicka först för ljud",
    strumHintTouch: "Dra fingret över strängarna",
    featuredTitle: "Setlist",
    featuredText: "Några av mina favoritcovers.",
    latestTitle: "Senaste på TikTok",
    aboutTitle: "Om mig",
    aboutText: "Hej! Jag är willegus. Jag spelar gitarr och gör covers på låtar jag gillar – allt spelat på min Strat genom Guitar Rig 8. Följ med på TikTok!",
    factInstrument: "Instrument",
    factSound: "Ljud",
    factThing: "Grej",
    factThingValue: "Covers",
    factWhere: "Hitta mig",
    gearTitle: "Gear",
    contactTitle: "Kontakt",
    contactText: "Har du en låtönskan eller vill samarbeta? Hör av dig!",
    footer: "Gjord med en Strat och lite för mycket gain",
  },
  en: {
    navVideos: "Setlist",
    navAbout: "About",
    navGear: "Gear",
    navContact: "Contact",
    eyebrow: "Guitar covers on TikTok",
    tagline: "Playing guitar and making covers! :)",
    emailBtn: "Email me",
    strumHint: "Move your mouse across the strings – click first for sound",
    strumHintTouch: "Swipe your finger across the strings",
    featuredTitle: "Setlist",
    featuredText: "A few of my favourite covers.",
    latestTitle: "Latest on TikTok",
    aboutTitle: "About me",
    aboutText: "Hi! I'm willegus. I play guitar and make covers of songs I love – all played on my Strat through Guitar Rig 8. Come along on TikTok!",
    factInstrument: "Instrument",
    factSound: "Sound",
    factThing: "Thing",
    factThingValue: "Covers",
    factWhere: "Find me",
    gearTitle: "Gear",
    contactTitle: "Contact",
    contactText: "Got a song request or want to collaborate? Get in touch!",
    footer: "Made with a Strat and slightly too much gain",
  },
};

// ============================================================
//  Kod nedanför behöver du inte röra
// ============================================================

document.documentElement.classList.add("js");

const isTouch = window.matchMedia("(pointer: coarse)").matches;

let lang = "sv";
try {
  lang = localStorage.getItem("lang") || (navigator.language.startsWith("sv") ? "sv" : "en");
} catch (e) {}

function renderVideos() {
  const grid = document.getElementById("video-grid");
  grid.innerHTML = VIDEOS.map((url) => {
    const id = url.split("/video/")[1]?.split(/[?/]/)[0];
    if (!id) return "";
    return `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${id}" style="max-width: 325px; min-width: 288px;">
      <section><a target="_blank" href="${url}">TikTok</a></section>
    </blockquote>`;
  }).join("");
}

function renderGear() {
  document.getElementById("gear-list").innerHTML = GEAR.map(
    (g) => `<li>
      <span class="icon">${g.icon}</span>
      <span class="type">${g.type[lang]}</span>
      <span class="name">${g.name}</span>
      <p class="note">${g.note[lang]}</p>
    </li>`
  ).join("");
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = TEXTS[lang][el.dataset.i18n];
  });
  document.getElementById("strum-hint").textContent = TEXTS[lang][isTouch ? "strumHintTouch" : "strumHint"];
  document.getElementById("lang-toggle").textContent = lang === "sv" ? "EN" : "SV";
  renderGear();
}

document.getElementById("lang-toggle").addEventListener("click", () => {
  lang = lang === "sv" ? "en" : "sv";
  try { localStorage.setItem("lang", lang); } catch (e) {}
  applyLanguage();
});

// Sektioner tonar in när man scrollar till dem
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();
renderVideos();
applyLanguage();

// Ladda TikToks embed-skript efter att videorna lagts in
const s = document.createElement("script");
s.src = "https://www.tiktok.com/embed.js";
s.async = true;
document.body.appendChild(s);
