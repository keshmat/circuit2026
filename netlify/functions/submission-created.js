// Netlify auto-invokes this function on every verified (non-spam) form
// submission. It emails the registrant a confirmation via Resend.
// Staff notification is handled separately by Netlify's native form notification.

const { Resend } = require("resend");

const STRINGS = {
  en: {
    subject: "Keshmat Summer Circuit 2026 — registration received",
    greeting: (name) => `Hi ${name},`,
    intro: "We've received your registration for the Keshmat Summer Circuit 2026. Here's what you sent us:",
    rName: "Name",
    rPhone: "Phone",
    rEmail: "Email",
    rTournaments: "Tournament(s)",
    rFee: "Expected fee",
    rFide: "FIDE ID",
    rBirthday: "Date of birth",
    feeNote: "Title-holder discounts are applied by our staff when verifying your receipt.",
    pending: "Your seat is confirmed only after our staff verifies your Whish payment (wallet 79344055). The registration fee is non-refundable.",
    signoff: "See you at the board,<br>Keshmat Chess Center — Dekweneh, Lebanon",
  },
  ar: {
    subject: "دورة كش مات لصيف 2026 — تم استلام تسجيلك",
    greeting: (name) => `مرحباً ${name}،`,
    intro: "لقد استلمنا تسجيلك في دورة كش مات لصيف 2026. إليك ما أرسلته إلينا:",
    rName: "الاسم",
    rPhone: "الهاتف",
    rEmail: "البريد الإلكتروني",
    rTournaments: "الدورة/الدورات",
    rFee: "الرسم المتوقع",
    rFide: "رقم FIDE",
    rBirthday: "تاريخ الولادة",
    feeNote: "تُطبَّق حسومات حاملي الألقاب من قبل فريقنا عند التحقق من إيصالك.",
    pending: "يُؤكَّد مقعدك فقط بعد تحقّق فريقنا من دفعتك عبر Whish (المحفظة 79344055). رسم التسجيل غير قابل للاسترجاع.",
    signoff: "نراكم على الرقعة،<br>مركز كش مات للشطرنج — الدكوانة، لبنان",
  },
};

function feeFor(tournaments) {
  return tournaments.reduce((sum, v) => sum + (/30/.test(v) ? 30 : /15/.test(v) ? 15 : 0), 0);
}

function row(label, value) {
  if (!value) return "";
  return `<tr><td style="padding:4px 12px 4px 0;color:#666">${label}</td><td style="padding:4px 0"><b>${value}</b></td></tr>`;
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const data = (body.payload && body.payload.data) || {};
    const to = data.email;
    if (!to) return { statusCode: 200, body: "no email on submission" };
    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
      console.error("Missing RESEND_API_KEY or FROM_EMAIL");
      return { statusCode: 200, body: "email not configured" };
    }

    const lang = data.lang === "ar" ? "ar" : "en";
    const s = STRINGS[lang];
    const dir = lang === "ar" ? "rtl" : "ltr";

    let tournaments = data.tournaments || [];
    if (!Array.isArray(tournaments)) tournaments = [tournaments];
    tournaments = tournaments.filter(Boolean);
    const fee = feeFor(tournaments);

    const fideLine =
      data.fide_id
        ? row(s.rFide, `${data.fide_id}${data.fide_name ? " · " + data.fide_name : ""}${data.fide_title ? " · " + data.fide_title : ""}`)
        : row(s.rBirthday, data.birthday);

    const html = `
      <div dir="${dir}" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;max-width:560px">
        <p>${s.greeting(data.name || "")}</p>
        <p>${s.intro}</p>
        <table style="border-collapse:collapse;margin:12px 0">
          ${row(s.rName, data.name)}
          ${row(s.rPhone, data.phone)}
          ${row(s.rEmail, data.email)}
          ${row(s.rTournaments, tournaments.join(" + "))}
          ${row(s.rFee, `$${fee}`)}
          ${fideLine}
        </table>
        <p style="font-size:13px;color:#666">${s.feeNote}</p>
        <p style="background:#fff7ed;border:1px solid #fed7aa;padding:10px 12px;border-radius:8px;font-size:14px">${s.pending}</p>
        <p>${s.signoff}</p>
      </div>`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject: s.subject,
      html,
    });

    return { statusCode: 200, body: "confirmation sent" };
  } catch (err) {
    // Never fail the submission pipeline over an email error.
    console.error("submission-created error:", err);
    return { statusCode: 200, body: "error handled" };
  }
};
