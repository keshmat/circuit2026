// Keshmat Summer Circuit 2026 — Registration form logic

// ---------------------------------------------------------------------------
// i18n dictionary
// ---------------------------------------------------------------------------
const I18N = {
    en: {
        brand: "Keshmat Circuit 2026",
        heroTitle: "Register — Summer Circuit 2026",
        heroSubtitle: 'Stage 2 of the Keshmat Circuit 2026 · 23–26 July 2026 · <a href="https://maps.app.goo.gl/e1dZMF9qrCtZ688G7" target="_blank" rel="noopener" class="link link-primary">Keshmat Chess Center, Dekweneh, Lebanon 📍</a>',
        deadline: "Registration closes Friday 24 July 2026 at 12:00 PM (noon) — or when all seats are filled.",
        rapidTitle: "Summer Open — Rapid",
        rapidWhen: "📅 Thursday 23 July 2026 · check-in 5:30 PM, round 1 at 6:00 PM",
        rapidFormat: "♟️ 7-round Swiss · 10 min + 3 sec/move",
        rapidFee: "💵 Entry: $15 (title holders $10)",
        classicTitle: "Summer Open — Classical",
        classicWhen: "📅 Friday 24 – Sunday 26 July 2026 · check-in 30 min before each round",
        classicFormat: "♟️ 5-round Swiss · 75 min + 30 sec/move",
        classicFee: "💵 Entry: $30 (CM/WCM/WFM $20 · IM/WIM/FM free)",
        payNote: "Pay your entry fee via <b>Whish</b> to wallet <b>79344055</b>, then upload a screenshot of the receipt below.",
        formTitle: "Registration",
        labelName: "Full name *",
        phName: "Your full name",
        labelPhone: "Phone number *",
        phPhone: "e.g. 70 123 456",
        labelEmail: "Email *",
        phEmail: "you@example.com",
        labelFideStatus: "FIDE registration *",
        optHasFide: "I have a FIDE ID",
        optNoFide: "I'm not FIDE-registered (new / unrated player)",
        labelFideSearch: "Search your FIDE name or ID",
        phFide: "Type your FIDE name or FIDE ID number",
        fideHint: "Not sure of the spelling? Type your FIDE ID number instead. Can't find yourself? You may not be FIDE-registered — select \"I'm not FIDE-registered\" above.",
        clear: "Change",
        venueName: "Keshmat Chess Center — Dekweneh, Lebanon",
        directions: "Get directions",
        labelBirthday: "Date of birth *",
        birthdayHint: "Required for LCF registration",
        citizenshipWarning: "We can only register <strong>Lebanese citizens</strong> without a FIDE ID. If you are not a Lebanese citizen, please request a FIDE ID from your own national chess federation first, then register above using that FIDE ID.",
        labelTournaments: "Which tournament(s)? *",
        optRapid: "Rapid",
        optClassic: "Classical",
        feeNote: "Title-holder discounts (Rapid $10; Classical CM/WCM/WFM $20, IM/WIM/FM free) are verified by our staff against your receipt.",
        labelReceipt: "Payment receipt (image) *",
        receiptHint: "Screenshot of your Whish transfer to 79344055.",
        labelTerms: "I have read and accept the terms & code of conduct *",
        termsSummary: "Read the terms & code of conduct",
        termsRefund: "<b>Non-refundable:</b> Seats are limited and there is no waiting list. Registering reserves a seat; the registration fee is non-refundable.",
        termsConduct: "Per FIDE Article 11.1, all players must act with integrity. Article 11.5 strictly prohibits distracting or annoying an opponent. Respectful conduct toward players, arbiters, and organizers is required; repeated failures may lead to penalties under Article 12.9, up to loss of a game or expulsion. Arbiters maintain a good playing environment (Art. 12.2, 12.6). Keshmat reserves the right to remove any persistent nuisance.",
        termsRules: "FIDE and Lebanese Chess Federation rules apply.",
        submit: "Submit registration",
        footer: "Keshmat Chess Circuit 2026 - Dekweneh, Lebanon",
        // dynamic
        feeTotal: (n) => `Selected total: $${n}`,
        errNoTournament: "Please select at least one tournament.",
        errFideNotSelected: "Please pick your name from the FIDE search results.",
        errBirthday: "Please enter your date of birth.",
        errReceipt: "Please attach your payment receipt image.",
        errTerms: "Please accept the terms & code of conduct.",
        errRequired: "Please fill in all required fields.",
        searching: "Searching…",
        noResults: "No players found",
    },
    ar: {
        brand: "دورة كش مات 2026",
        heroTitle: "التسجيل — دورة الصيف 2026",
        heroSubtitle: 'المرحلة الثانية من دورة كش مات 2026 · 23–26 تموز 2026 · <a href="https://maps.app.goo.gl/e1dZMF9qrCtZ688G7" target="_blank" rel="noopener" class="link link-primary">مركز كش مات للشطرنج، الدكوانة، لبنان 📍</a>',
        deadline: "يُقفل باب التسجيل يوم الجمعة 24 تموز 2026 الساعة 12:00 ظهراً — أو عند حجز جميع المقاعد.",
        rapidTitle: "دورة الصيف المفتوحة — السريع",
        rapidWhen: "📅 الخميس 23 تموز 2026 · الحضور 5:30 مساءً، الجولة الأولى 6:00 مساءً",
        rapidFormat: "♟️ 7 جولات سويسري · 10 دقائق + 3 ثوانٍ للنقلة",
        rapidFee: "💵 رسم الاشتراك: 15$ (حاملو الألقاب 10$)",
        classicTitle: "دورة الصيف المفتوحة — الكلاسيكي",
        classicWhen: "📅 الجمعة 24 – الأحد 26 تموز 2026 · الحضور قبل 30 دقيقة من كل جولة",
        classicFormat: "♟️ 5 جولات سويسري · 75 دقيقة + 30 ثانية للنقلة",
        classicFee: "💵 رسم الاشتراك: 30$ (CM/WCM/WFM بـ 20$ · IM/WIM/FM مجاناً)",
        payNote: "ادفع رسم الاشتراك عبر <b>Whish</b> إلى المحفظة <b>79344055</b>، ثم حمّل صورة الإيصال أدناه.",
        formTitle: "التسجيل",
        labelName: "الاسم الكامل *",
        phName: "اسمك الكامل",
        labelPhone: "رقم الهاتف *",
        phPhone: "مثال: 70 123 456",
        labelEmail: "البريد الإلكتروني *",
        phEmail: "you@example.com",
        labelFideStatus: "التسجيل في FIDE *",
        optHasFide: "لديّ رقم FIDE",
        optNoFide: "غير مسجّل(ة) في FIDE (لاعب(ة) جديد(ة) / غير مصنّف(ة))",
        labelFideSearch: "ابحث عن اسمك أو رقمك في FIDE",
        phFide: "اكتب اسمك في FIDE أو رقم FIDE الخاص بك",
        fideHint: "لست متأكداً من كتابة الاسم؟ اكتب رقم FIDE الخاص بك. لا تجد نفسك؟ قد لا تكون مسجّلاً في FIDE — اختر «غير مسجّل(ة) في FIDE» أعلاه.",
        clear: "تغيير",
        venueName: "مركز كش مات للشطرنج — الدكوانة، لبنان",
        directions: "احصل على الاتجاهات",
        labelBirthday: "تاريخ الولادة *",
        birthdayHint: "مطلوب لتسجيل الاتحاد اللبناني",
        citizenshipWarning: "يمكننا تسجيل <strong>المواطنين اللبنانيين</strong> فقط من دون رقم FIDE. إذا لم تكن مواطناً لبنانياً، يُرجى طلب رقم FIDE من اتحادك الوطني للشطرنج أولاً، ثم التسجيل أعلاه باستخدام رقم FIDE هذا.",
        labelTournaments: "أي دورة/دورات؟ *",
        optRapid: "السريع",
        optClassic: "الكلاسيكي",
        feeNote: "تُحقَّق حسومات حاملي الألقاب (السريع 10$؛ الكلاسيكي CM/WCM/WFM بـ 20$، وIM/WIM/FM مجاناً) من قبل فريقنا بمقارنتها بإيصالك.",
        labelReceipt: "إيصال الدفع (صورة) *",
        receiptHint: "صورة تحويلك عبر Whish إلى 79344055.",
        labelTerms: "قرأت وأوافق على الشروط ومدونة السلوك *",
        termsSummary: "اقرأ الشروط ومدونة السلوك",
        termsRefund: "<b>غير قابل للاسترجاع:</b> المقاعد محدودة ولا توجد لائحة انتظار. التسجيل يحجز مقعداً؛ ورسم التسجيل غير قابل للاسترجاع.",
        termsConduct: "وفقاً للمادة 11.1 من قوانين FIDE، على جميع اللاعبين التصرّف بنزاهة. وتمنع المادة 11.5 منعاً باتاً تشتيت الخصم أو إزعاجه. السلوك المحترم تجاه اللاعبين والحكام والمنظمين شرط أساسي؛ وقد يؤدي التكرار إلى عقوبات بموجب المادة 12.9 تصل إلى خسارة المباراة أو الطرد. يحافظ الحكام على بيئة لعب جيدة (المادتان 12.2 و12.6). ويحتفظ مركز كش مات بحق إبعاد أي مصدر إزعاج مستمر.",
        termsRules: "تُطبَّق قوانين الاتحادين الدولي واللبناني للشطرنج.",
        submit: "إرسال التسجيل",
        footer: "دورة كش مات للشطرنج 2026 - الدكوانة، لبنان",
        // dynamic
        feeTotal: (n) => `المجموع المختار: $${n}`,
        errNoTournament: "الرجاء اختيار دورة واحدة على الأقل.",
        errFideNotSelected: "الرجاء اختيار اسمك من نتائج بحث FIDE.",
        errBirthday: "الرجاء إدخال تاريخ ولادتك.",
        errReceipt: "الرجاء إرفاق صورة إيصال الدفع.",
        errTerms: "الرجاء الموافقة على الشروط ومدونة السلوك.",
        errRequired: "الرجاء تعبئة جميع الحقول المطلوبة.",
        searching: "جارٍ البحث…",
        noResults: "لا يوجد لاعبون",
    },
};

let currentLang = localStorage.getItem("lang") || "en";

function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (key === "langSwitch") {
            el.textContent = lang === "ar" ? "English" : "العربية";
        } else {
            el.innerHTML = t(key);
        }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });

    const langField = document.getElementById("lang-field");
    if (langField) langField.value = lang;

    updateFeeSummary();
}

// ---------------------------------------------------------------------------
// Theme (mirrors index.html behaviour)
// ---------------------------------------------------------------------------
(function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const html = document.documentElement;
    if (localStorage.getItem("theme") === "light") {
        html.setAttribute("data-theme", "light");
        themeToggle.checked = true;
    }
    themeToggle.addEventListener("change", () => {
        const light = themeToggle.checked;
        html.setAttribute("data-theme", light ? "light" : "dark");
        localStorage.setItem("theme", light ? "light" : "dark");
    });
})();

// ---------------------------------------------------------------------------
// FIDE status conditional block (default: has a FIDE ID)
// ---------------------------------------------------------------------------
const fideBlock = document.getElementById("fide-block");
const birthdayBlock = document.getElementById("birthday-block");
const birthdayInput = document.getElementById("birthday");

function hasFideSelected() {
    const checked = document.querySelector('input[name="fide_status"]:checked');
    return !checked || checked.value === "has_fide";
}

function syncFideMode() {
    const on = hasFideSelected();
    fideBlock.hidden = !on;
    birthdayBlock.hidden = on;
    if (on) {
        birthdayInput.value = "";
    } else {
        clearFideSelection();
    }
}
document.querySelectorAll('input[name="fide_status"]').forEach((el) =>
    el.addEventListener("change", syncFideMode)
);

// ---------------------------------------------------------------------------
// FIDE search (Datasette FTS API)
// ---------------------------------------------------------------------------
const FIDE_API = "https://fide-players.fly.dev/players/players.json";
const fideSearch = document.getElementById("fide-search");
const fideResults = document.getElementById("fide-results");
const fideSelected = document.getElementById("fide-selected");
const fideSelectedText = document.getElementById("fide-selected-text");
const fideClear = document.getElementById("fide-clear");

let fideTimer = null;
let fideAbort = null;

function renderFideMessage(msg) {
    fideResults.innerHTML = `<li><a class="pointer-events-none opacity-60">${msg}</a></li>`;
    fideResults.hidden = false;
}

async function runFideSearch(q) {
    if (fideAbort) fideAbort.abort();
    fideAbort = new AbortController();
    // Numeric query = FIDE ID lookup; otherwise full-text name search
    const url = /^\d{3,}$/.test(q)
        ? `${FIDE_API}?fideid__exact=${encodeURIComponent(q)}&_shape=array&_size=8`
        : `${FIDE_API}?_search=${encodeURIComponent(q)}&_shape=array&_size=8`;
    try {
        renderFideMessage(t("searching"));
        const res = await fetch(url, { signal: fideAbort.signal });
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) {
            renderFideMessage(t("noResults"));
            return;
        }
        fideResults.innerHTML = "";
        rows.forEach((p) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            const title = p.title ? ` · ${p.title}` : "";
            const rating = p.rating ? ` · ${p.rating}` : "";
            a.textContent = `${p.name} (${p.country || "?"})${rating}${title}`;
            a.addEventListener("click", () => selectFide(p));
            li.appendChild(a);
            fideResults.appendChild(li);
        });
        fideResults.hidden = false;
    } catch (err) {
        if (err.name !== "AbortError") renderFideMessage(t("noResults"));
    }
}

fideSearch.addEventListener("input", () => {
    const q = fideSearch.value.trim();
    clearTimeout(fideTimer);
    if (q.length < 2) {
        fideResults.hidden = true;
        return;
    }
    fideTimer = setTimeout(() => runFideSearch(q), 300);
});

function selectFide(p) {
    document.getElementById("fide_id").value = p.fideid || "";
    document.getElementById("fide_name").value = p.name || "";
    document.getElementById("fide_title").value = p.title || "";
    document.getElementById("fide_rating").value = p.rating || "";
    document.getElementById("fide_birthyear").value = p.birthday || "";
    document.getElementById("fide_country").value = p.country || "";

    const title = p.title ? ` · ${p.title}` : "";
    fideSelectedText.textContent = `${p.name} — FIDE ${p.fideid}${title}`;
    fideSelected.hidden = false;
    fideResults.hidden = true;
    fideSearch.hidden = true;
}

function clearFideSelection() {
    ["fide_id", "fide_name", "fide_title", "fide_rating", "fide_birthyear", "fide_country"].forEach(
        (id) => (document.getElementById(id).value = "")
    );
    fideSelected.hidden = true;
    fideResults.hidden = true;
    fideSearch.hidden = false;
    fideSearch.value = "";
}
fideClear.addEventListener("click", clearFideSelection);

// Hide results when clicking outside
document.addEventListener("click", (e) => {
    if (!fideBlock.contains(e.target)) fideResults.hidden = true;
});

// ---------------------------------------------------------------------------
// Fee summary
// ---------------------------------------------------------------------------
function updateFeeSummary() {
    const checked = Array.from(document.querySelectorAll(".tourney:checked"));
    const summary = document.getElementById("fee-summary");
    if (checked.length === 0) {
        summary.hidden = true;
        return;
    }
    const total = checked.reduce((sum, el) => sum + Number(el.dataset.fee || 0), 0);
    summary.textContent = t("feeTotal")(total);
    summary.hidden = false;
}
document.querySelectorAll(".tourney").forEach((el) => el.addEventListener("change", updateFeeSummary));

// ---------------------------------------------------------------------------
// Validation + submit
// ---------------------------------------------------------------------------
const form = document.getElementById("reg-form");
const errorBox = document.getElementById("form-error");

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    // Native required-field check (name, phone, email, receipt, terms)
    const requiredNative = ["name", "phone", "email"];
    for (const nm of requiredNative) {
        const el = form.elements[nm];
        if (!el.value.trim()) return showError(t("errRequired"));
    }
    // Basic email sanity
    const email = form.elements["email"].value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError(t("errRequired"));

    // Tournaments
    if (document.querySelectorAll(".tourney:checked").length === 0) {
        return showError(t("errNoTournament"));
    }
    // FIDE vs birthday
    if (hasFideSelected()) {
        if (!document.getElementById("fide_id").value) return showError(t("errFideNotSelected"));
    } else {
        if (!birthdayInput.value) return showError(t("errBirthday"));
    }
    // Receipt
    const receipt = document.getElementById("receipt");
    if (!receipt.files || receipt.files.length === 0) return showError(t("errReceipt"));
    // Terms
    if (!form.elements["terms"].checked) return showError(t("errTerms"));

    // All good — disable + submit natively (Netlify captures file upload)
    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    btn.classList.add("loading");
    form.submit();
});

// ---------------------------------------------------------------------------
// Venue minimap (OpenFreeMap tiles via MapLibre GL)
// ---------------------------------------------------------------------------
(function initVenueMap() {
    const VENUE = { lng: 35.5468631, lat: 33.8663654 };
    const container = document.getElementById("venue-map");
    if (!container || !window.maplibregl) return;
    try {
        // Render Arabic (RTL) place labels correctly. Load once, lazily.
        if (maplibregl.getRTLTextPluginStatus &&
            maplibregl.getRTLTextPluginStatus() === "unavailable") {
            maplibregl.setRTLTextPlugin(
                "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.js",
                null,
                true // lazy: load when RTL text is first encountered
            );
        }
        const map = new maplibregl.Map({
            container: "venue-map",
            style: "https://tiles.openfreemap.org/styles/bright",
            center: [VENUE.lng, VENUE.lat],
            zoom: 11,
            cooperativeGestures: true,
            attributionControl: { compact: true },
        });
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
        new maplibregl.Marker({ color: "#e11d48" }).setLngLat([VENUE.lng, VENUE.lat]).addTo(map);
    } catch (e) {
        // Map is decorative; the "Get directions" link still works without it.
        console.warn("Venue map failed to load:", e);
    }
})();

// ---------------------------------------------------------------------------
// Language toggle + init
// ---------------------------------------------------------------------------
document.getElementById("lang-toggle").addEventListener("click", () => {
    applyLang(currentLang === "ar" ? "en" : "ar");
});

syncFideMode();
applyLang(currentLang);
