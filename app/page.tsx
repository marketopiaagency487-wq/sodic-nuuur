"use client";

import { useState, useEffect, useRef, useMemo, FormEvent, ReactNode } from "react";
import {
  PHONE_DISPLAY, PHONE_INTL, WEB3_KEY, WA_MAIN, wa,
  AGENT_AR, AGENT_EN, AGENT_EMAIL, PRICE_NOTE,
  UNITS, TABS, OFFERS, HERO_STATS, PHASE_POINTS, AMENITIES, WHY,
  LOCATION, GALLERY, FAQ, DIAL, UNIT_OPTIONS,
  DOWN, YEARS, EOI, FINISH, type Cat,
} from "./lib/site";

/* ═══════════════ helpers ═══════════════ */
const N = ({ children }: { children: ReactNode }) => <span className="num">{children}</span>;
const fmt = (n: number) => n.toLocaleString("en-US");

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const el = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const n = el.current;
    if (!n) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    io.observe(n);
    return () => io.disconnect();
  }, []);
  return <div ref={el} className={`reveal ${on ? "in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const WaIcon = ({ s = 17 }: { s?: number }) => (
  <svg viewBox="0 0 24 24" style={{ width: s, height: s }} className="fill-current shrink-0" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
);
const PhoneIcon = ({ s = 17 }: { s?: number }) => (
  <svg viewBox="0 0 24 24" style={{ width: s, height: s }} className="fill-current shrink-0" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
);

const hit = (n: string) => {
  const f = (window as unknown as Record<string, (() => void) | undefined>)[n];
  if (f) f();
};
const onWA = () => hit("trackWhatsapp");
const onCall = () => hit("trackCall");

const NAV = [
  { t: "الوحدات والأسعار", h: "#units" },
  { t: "حاسبة التقسيط", h: "#calc" },
  { t: "المرحلة", h: "#phase" },
  { t: "الموقع", h: "#location" },
  { t: "الصور", h: "#gallery" },
  { t: "عروض أخرى", h: "#offers" },
];

/* ═══════════════ lead form ═══════════════ */
function LeadForm({ subject, openLegal, compact = false, preset = "" }:
  { subject: string; openLegal: () => void; compact?: boolean; preset?: string }) {
  const [st, setSt] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");
  const ref = useRef<HTMLFormElement>(null);

  async function go(e: FormEvent) {
    e.preventDefault();
    if (!ref.current) return;
    const fd = new FormData(ref.current);
    if ((fd.get("company") as string)?.length) return;
    setErr(""); setSt("sending");
    const body: Record<string, string> = { access_key: WEB3_KEY, from_name: AGENT_EN };
    fd.forEach((v, k) => { if (k !== "company") body[k] = v.toString(); });
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!d.success) throw new Error();
      setSt("sent"); ref.current.reset(); hit("trackFormLead");
    } catch {
      setSt("idle"); setErr("حصل خطأ في الإرسال. جرّب مرة تانية أو كلّمنا على واتساب.");
    }
  }

  if (st === "sent") {
    return (
      <div className="text-center py-8">
        <h3 className="text-sodic text-[21px] mb-2">تم استلام بياناتك</h3>
        <p className="text-muted text-[14.5px]">هيوصلك جدول الأسعار والماستر بلان، وهيتواصل معك مستشار عقاري خلال <N>24</N> ساعة عمل.</p>
      </div>
    );
  }

  return (
    <form ref={ref} onSubmit={go}>
      <input type="text" name="company" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="subject" value={subject} />
      <div className={compact ? "" : "grid sm:grid-cols-2 gap-4"}>
        <input name="name" className={`fld ${compact ? "mb-3.5" : ""}`} placeholder="الاسم بالكامل *" required aria-label="الاسم" />
        <div className={`flex gap-2 ${compact ? "mb-3.5" : ""}`}>
          <select name="dial" className="fld num !w-[100px] !px-2 shrink-0" defaultValue="EG +20" aria-label="كود الدولة">
            {DIAL.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input name="phone" type="tel" dir="ltr" className="fld num" placeholder="01012345678 *" required aria-label="رقم الهاتف" />
        </div>
      </div>
      <select name="unit" className={`fld ${compact ? "" : "mt-4"}`} defaultValue={preset} aria-label="الوحدة المهتم بها">
        <option value="">الوحدة المهتم بها</option>
        {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
      <button type="submit" disabled={st === "sending"} className="btn btn-sodic w-full mt-4">
        {st === "sending" ? "جاري الإرسال…" : "أرسل بياناتي واستلم الأسعار"}
      </button>
      {err && <p className="text-[13px] text-[#c0392b] mt-3 text-center">{err}</p>}
      <p className="text-[11.5px] text-muted leading-[1.85] mt-4">
        بإرسال البيانات أنت توافق على تواصل فريق {AGENT_AR} معك بخصوص المشروع وعلى{" "}
        <button type="button" onClick={openLegal} className="text-sodic underline bg-transparent border-0 p-0 cursor-pointer font-[inherit] text-[inherit]">سياسة الخصوصية</button>.
        نحن وكيل مبيعات معتمد لدى سوديك ولسنا الموقع الرسمي للمطوّر.
      </p>
    </form>
  );
}

/* ═══════════════ payment calculator ═══════════════ */
function Calculator() {
  const [id, setId] = useState(UNITS[0].id);
  const [dp, setDp] = useState(1.5);
  const [freq, setFreq] = useState<"q" | "m">("q");
  const u = UNITS.find((x) => x.id === id)!;

  const calc = useMemo(() => {
    const down = Math.round(u.price * (dp / 100));
    const rest = u.price - down;
    const n = freq === "q" ? 40 : 120;          // 10 سنوات
    return { down, rest, n, inst: Math.round(rest / n) };
  }, [u, dp, freq]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="card p-6 md:p-8">
        <label className="block text-[13px] font-semibold mb-2">الوحدة</label>
        <select value={id} onChange={(e) => setId(e.target.value)} className="fld mb-5" aria-label="اختر الوحدة">
          {UNITS.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.area} م²</option>)}
        </select>

        <label className="block text-[13px] font-semibold mb-2">نسبة المقدم — <span className="num text-sodic">{dp}%</span></label>
        <input type="range" min={1.5} max={30} step={0.5} value={dp} onChange={(e) => setDp(+e.target.value)}
          className="w-full accent-sodic mb-5" aria-label="نسبة المقدم" />

        <label className="block text-[13px] font-semibold mb-2">دورية القسط</label>
        <div className="flex gap-2">
          {([["q", "ربع سنوي"], ["m", "شهري"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFreq(k)} aria-pressed={freq === k}
              className={`flex-1 py-3 rounded-[6px] text-[14px] font-semibold border transition-colors cursor-pointer ${freq === k ? "bg-sodic text-white border-sodic" : "bg-white text-muted border-line-2 hover:border-sodic"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 md:p-8 bg-coal border-coal text-white">
        <p className="text-white/50 text-[13px] mb-1">{u.name} — <N>{u.area}</N> م²</p>
        <p className="font-[family-name:var(--font-display)] font-extrabold text-[26px] text-sodic-sky mb-6"><N>{fmt(u.price)}</N> <span className="text-[15px] text-white/50">ج</span></p>
        <dl className="grid grid-cols-2 gap-x-6">
          {[
            ["جدية الحجز", `${EOI} ج`],
            ["المقدم", `${fmt(calc.down)} ج`],
            ["عدد الأقساط", `${calc.n}`],
            ["مدة السداد", YEARS],
          ].map(([k, v], i) => (
            <div key={i} className="py-3 border-b border-white/12">
              <dt className="text-white/45 text-[12px]">{k}</dt>
              <dd className="font-[family-name:var(--font-display)] font-bold text-[16px] m-0 mt-0.5"><N>{v}</N></dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 pt-5 border-t border-white/15">
          <p className="text-white/50 text-[12.5px] mb-1">{freq === "q" ? "القسط الربع سنوي التقريبي" : "القسط الشهري التقريبي"}</p>
          <p className="font-[family-name:var(--font-display)] font-extrabold text-[30px] text-white leading-none"><N>{fmt(calc.inst)}</N></p>
          <p className="text-white/45 text-[12.5px] mt-1">جنيه مصري</p>
        </div>
        <a href={wa(`مهتم بـ${u.name} (${u.code}) في المرحلة الجديدة بسوديك إيست — ${u.area} م² — سعر بداية ${fmt(u.price)} ج، بمقدم ${dp}% وتقسيط 10 سنوات. برجاء إرسال جدول السداد الرسمي.`)}
          target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa w-full mt-6">
          <WaIcon />اطلب جدول السداد الرسمي
        </a>
        <p className="text-white/35 text-[11.5px] leading-[1.8] mt-4">
          الحساب استرشادي بدون فوائد وبتوزيع متساوٍ للأقساط. جدول السداد الرسمي الصادر من المطوّر هو المعتمد.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════ legal modal ═══════════════ */
function LegalModal({ close }: { close: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [close]);
  const rows: [string, string][] = [
    ["البيانات التي نجمعها", "الاسم ورقم الهاتف والوحدة محل الاهتمام، وذلك فقط عند ملء النموذج بنفسك. كما نجمع بيانات فنية تلقائية (نوع المتصفح ومصدر الزيارة) عبر أدوات القياس."],
    ["الاستخدام", "نستخدم بياناتك للتواصل معك بخصوص استفسارك العقاري وإرسال جداول الأسعار والماستر بلان، ولقياس أداء الحملات الإعلانية. لا نبيع بياناتك لأي طرف ثالث لأغراض تسويقية."],
    ["المشاركة", "نشارك بياناتك مع الشركة المطوّرة بالقدر اللازم لإتمام إجراءات الحجز أو التعاقد، ومع مزوّدي الخدمات التقنية الذين يشغّلون الموقع ونظام إدارة العملاء."],
    ["ملفات تعريف الارتباط", "نستخدمها لقياس تحويلات الإعلانات. لا تُفعّل ملفات الارتباط الإعلانية إلا بعد موافقتك الصريحة من الشريط الذي يظهر عند أول زيارة."],
    ["مدة الاحتفاظ وحقوقك", `نحتفظ ببيانات التواصل مدة أقصاها 24 شهراً من آخر تفاعل. لك حق طلب نسخة من بياناتك أو تصحيحها أو حذفها أو سحب موافقتك — راسلنا على ${AGENT_EMAIL}.`],
    ["صفة مشغّل الموقع", `يدير هذا الموقع ${AGENT_AR} (${AGENT_EN})، وكيل مبيعات معتمد لدى سوديك. لسنا الشركة المطوّرة وهذه ليست الصفحة الرسمية لسوديك.`],
    ["الأسعار وجدية الحجز", `${PRICE_NOTE} مبلغ جدية الحجز (EOI) وشروط استرداده تتحدد من الشركة المطوّرة، وننصح بمراجعتها معها مباشرة قبل السداد.`],
    ["حاسبة التقسيط", "الحاسبة أداة استرشادية تقسّم المتبقي بعد المقدم على عدد الأقساط بالتساوي وبدون فوائد، ولا تعكس بالضرورة جدول السداد الرسمي. المعتمد هو الجدول الصادر من المطوّر."],
    ["العلامات التجارية والصور", "«سوديك» و«SODIC» وأسماء المشروعات وشعاراتها علامات تجارية مملوكة لأصحابها وتُستخدم هنا لغرض وصفي بحت. الصور والمخططات مواد تسويقية صادرة عن المطوّر وذات طبيعة تعبيرية وقد تختلف عن الواقع."],
    ["حدود المسئولية والقانون", "لا نتحمل مسئولية أي قرار شرائي يُتخذ بناءً على المعلومات المعروضة هنا وحدها. تخضع هذه الشروط لقوانين جمهورية مصر العربية."],
  ];
  return (
    <>
      <div className="fixed inset-0 z-200 bg-coal/70 backdrop-blur-[3px]" onClick={close} />
      <div role="dialog" aria-modal="true" aria-label="سياسة الخصوصية وإخلاء المسئولية"
        className="fixed z-201 top-1/2 start-1/2 translate-x-1/2 -translate-y-1/2 w-[min(680px,93vw)] max-h-[86vh] overflow-y-auto bg-white rounded-[10px] p-8 md:p-10">
        <button onClick={close} aria-label="إغلاق" className="absolute top-4 start-4 w-9 h-9 rounded-full bg-soft text-ink border-0 cursor-pointer text-[16px]">✕</button>
        <span className="label">Privacy &amp; Disclaimer</span>
        <h2 className="text-[23px] mb-5">سياسة الخصوصية وإخلاء المسئولية</h2>
        <div className="text-muted text-[14px] leading-[2]">
          {rows.map(([h, b], i) => <div key={i}><h3 className="text-[15px] text-ink mt-5 mb-1">{h}</h3><p>{b}</p></div>)}
          <p className="text-[12px] text-muted/70 pt-5">آخر تحديث: سبتمبر <N>2026</N></p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════ PAGE ═══════════════ */
export default function Page() {
  const [legal, setLegal] = useState(false);
  const openLegal = () => setLegal(true);
  const [bar, setBar] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [cat, setCat] = useState<Cat>("all");
  const [sortLow, setSortLow] = useState(true);
  const [faq, setFaq] = useState<number | null>(0);
  const [cookie, setCookie] = useState(false);
  const [up, setUp] = useState(false);

  useEffect(() => { try { if (!localStorage.getItem("sodic_cookie_ok")) setCookie(true); } catch { setCookie(true); } }, []);
  useEffect(() => {
    const f = () => setUp(window.scrollY > 400);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const acceptCookies = () => {
    setCookie(false);
    try { localStorage.setItem("sodic_cookie_ok", "1"); } catch { }
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (g) g("consent", "update", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" });
  };

  const rows = useMemo(() => {
    const list = cat === "all" ? [...UNITS] : UNITS.filter((u) => u.cat === cat);
    return list.sort((a, b) => (sortLow ? a.price - b.price : b.price - a.price));
  }, [cat, sortLow]);

  return (
    <>
      {/* ANNOUNCEMENT */}
      {bar && (
        <div className="bg-sodic text-white text-[13px] font-semibold text-center py-2.5 px-10 relative leading-relaxed">
          مطروح الآن: المرحلة الجديدة في سوديك إيست — <N>7</N> نوعيات وحدات · مقدم <N>1.5%</N> · EOI مفتوح
          <button onClick={() => setBar(false)} aria-label="إغلاق"
            className="absolute top-1/2 -translate-y-1/2 start-3 w-6 h-6 rounded-full bg-white/20 text-white border-0 cursor-pointer text-[13px] leading-none">✕</button>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-90 bg-coal/97 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-[1220px] px-5 h-[66px] flex items-center gap-5">
          <a href="#top" className="flex items-center gap-3 shrink-0 no-underline">
            <span className="w-[3px] h-9 bg-sodic-sky block" />
            <span>
              <span className="block font-[family-name:var(--font-display)] text-[16px] font-extrabold text-white leading-tight">سوديك إيست</span>
              <span className="block text-[10.5px] text-white/50 leading-tight tracking-wide">SODIC EAST — NEW PHASE</span>
            </span>
          </a>
          <nav className="hidden lg:flex gap-5 ms-auto">
            {NAV.map((n) => <a key={n.h} href={n.h} className="text-[13.5px] text-white/72 hover:text-white no-underline transition-colors whitespace-nowrap">{n.t}</a>)}
          </nav>
          <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="hidden md:inline-flex btn btn-wa !py-2.5 !px-4 !text-[13.5px] ms-auto lg:ms-0 shrink-0"><WaIcon s={16} />تواصل الآن</a>
          <button onClick={() => setDrawer(!drawer)} aria-label="القائمة" aria-expanded={drawer} className="lg:hidden text-white p-1.5 shrink-0 ms-auto md:ms-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
        {drawer && (
          <div className="lg:hidden bg-coal border-t border-white/10 px-5 pb-4">
            {NAV.map((n) => <a key={n.h} href={n.h} onClick={() => setDrawer(false)} className="block py-3 text-[14.5px] text-white/75 no-underline border-b border-white/8">{n.t}</a>)}
            <a href="#lead" onClick={() => setDrawer(false)} className="btn btn-sodic w-full mt-4">استلم جدول الأسعار</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative min-h-[82vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-coal">
          <img src="/images/hero.webp" alt="سوديك إيست — المرحلة الجديدة" className="w-full h-full object-cover kenburns opacity-50"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/88 to-coal/45" />
        <div className="relative mx-auto max-w-[1220px] w-full px-5 py-16">
          <div className="max-w-[760px]">
            <p className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[12.5px] text-white/80 mb-6">
              مطروح الآن للـEOI · التخصيص بأولوية التسجيل
            </p>
            <span className="label label-light">SODIC EAST · NEW MF PHASE</span>
            <h1 className="text-white text-[clamp(28px,5.2vw,50px)] mb-5">
              المرحلة الجديدة في سوديك إيست
            </h1>
            <p className="text-white/65 text-[15.5px] leading-[2] max-w-[62ch] mb-9">
              مرحلة سكنية جديدة على أكثر من <N>65</N> فداناً بتشطيب {FINISH}، تضم <N>7</N> نوعيات وحدات
              من <N>76</N> حتى <N>200</N> متر. الأسعار تبدأ من <N>6,700,000</N> جنيه بمقدم <N>{DOWN}</N> فقط
              وتقسيط حتى <N>10</N> سنوات، وجدية الحجز <N>{EOI}</N> جنيه.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <a href="#units" className="btn btn-sodic">تصفّح الوحدات والأسعار</a>
              <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa"><WaIcon />واتساب مباشر</a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 border-t border-white/15 pt-7">
              {HERO_STATS.map((s, i) => (
                <div key={i} className={i > 0 ? "sm:ps-5 sm:border-s sm:border-white/15" : ""}>
                  <div className="font-[family-name:var(--font-display)] font-extrabold text-[26px] text-sodic-sky leading-none"><N>{s.v}</N></div>
                  <div className="text-white/45 text-[12px] mt-2">{s.l}</div>
                </div>
              ))}
            </div>
            <p className="text-white/35 text-[11.5px] mt-6">
              {AGENT_AR} — وكيل مبيعات معتمد لدى سوديك. أسعار استرشادية قابلة للتغيير.
            </p>
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section id="lead" className="py-14 bg-wash border-b border-line">
        <div className="mx-auto max-w-[900px] px-5">
          <div className="card p-7 md:p-9">
            <div className="text-center mb-7">
              <span className="label justify-center">REGISTER INTEREST</span>
              <h2 className="text-[clamp(21px,3vw,28px)] mb-2">استلم جدول الأسعار الكامل</h2>
              <p className="text-muted text-[14.5px] max-w-[52ch] mx-auto">
                جدول الأسعار والماستر بلان والمتاح الحالي من وحدات المرحلة الجديدة
              </p>
            </div>
            <LeadForm subject="Lead — سوديك إيست المرحلة الجديدة" openLegal={openLegal} />
          </div>
        </div>
      </section>

      {/* UNITS & PRICES */}
      <section id="units" className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">UNITS &amp; PRICES</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] mb-3">وحدات وأسعار المرحلة الجديدة</h2>
            <p className="text-muted text-[15px] leading-[2] max-w-[76ch] mb-8">
              أسعار بداية كل نوع على نظام <N>10</N> سنوات بمقدم <N>{DOWN}</N>. اضغط واتساب جنب أي وحدة
              وهيوصلك المتاح منها بالدور والفيو والمساحة الفعلية.
            </p>
          </Reveal>

          <Reveal>
            <div className="flex flex-wrap gap-2 items-center mb-7">
              {TABS.map(([k, l]) => (
                <button key={k} onClick={() => setCat(k)} aria-pressed={cat === k}
                  className={`px-4 py-2 text-[13.5px] font-semibold rounded-full border transition-colors cursor-pointer ${cat === k ? "bg-sodic text-white border-sodic" : "bg-white text-muted border-line-2 hover:border-sodic"}`}>
                  {l}
                </button>
              ))}
              <button onClick={() => setSortLow(!sortLow)}
                className="ms-auto px-4 py-2 text-[13px] font-semibold rounded-full border border-line-2 bg-white text-muted hover:border-sodic transition-colors cursor-pointer">
                {sortLow ? "الأقل سعراً أولاً ↓" : "الأعلى سعراً أولاً ↑"}
              </button>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rows.map((u, i) => (
              <Reveal key={u.id} delay={i * 45}>
                <article className="card h-full flex flex-col">
                  <div className="relative aspect-16/10 bg-wash">
                    <img src={u.img} alt={`${u.name} — سوديك إيست`} loading="lazy" className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span className="absolute top-3 start-3 badge !text-[11.5px] !px-3">{u.catLabel}</span>
                    {u.note && <span className="absolute top-3 end-3 badge badge-coal !text-[11px] !px-3">{u.note}</span>}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="block text-[11px] font-bold tracking-wider text-sodic num mb-1.5">{u.code}</span>
                    <h3 className="text-[17.5px] mb-4 leading-snug">{u.name}</h3>

                    <dl className="grid grid-cols-2 gap-x-5 mb-4">
                      {[
                        ["المساحة", `${u.area} م²`],
                        ["المقدم", DOWN],
                        ["التقسيط", YEARS],
                        ["جدية الحجز", `${EOI} ج`],
                      ].map(([k, v], j) => (
                        <div key={j} className="py-2 border-b border-line">
                          <dt className="text-muted text-[11.5px]">{k}</dt>
                          <dd className="font-[family-name:var(--font-display)] font-bold text-[14px] m-0"><N>{v}</N></dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-auto">
                      <p className="text-muted text-[12px] mb-0.5">تبدأ من</p>
                      <p className="font-[family-name:var(--font-display)] font-extrabold text-[22px] text-sodic leading-none mb-4">
                        <N>{fmt(u.price)}</N> <span className="text-[13px] text-muted font-normal">ج</span>
                      </p>
                      <div className="flex gap-2">
                        <a href={wa(`مهتم بـ${u.name} (${u.code}) في المرحلة الجديدة بسوديك إيست — متوسط ${u.area} م² — سعر بداية ${fmt(u.price)} ج. برجاء إرسال التفاصيل وخطة السداد والمتاح حالياً.`)}
                          target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa flex-1 !py-3 !px-3 !text-[13.5px]">
                          <WaIcon s={16} />التفاصيل والحجز
                        </a>
                        <a href="#calc" className="btn btn-line !py-3 !px-4 !text-[13.5px] shrink-0">احسب القسط</a>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <p className="text-muted text-[12.5px] leading-[1.95] mt-7 max-w-[94ch]">* {PRICE_NOTE}</p>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calc" className="py-16 lg:py-20 bg-soft">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">PAYMENT PLAN</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] mb-3">احسب قسطك</h2>
            <p className="text-muted text-[15px] leading-[2] max-w-[72ch] mb-9">
              اختار الوحدة ونسبة المقدم عشان تشوف قيمة القسط التقريبية على <N>10</N> سنوات.
              الحساب استرشادي بدون فوائد، وجدول السداد الرسمي من المطوّر هو المعتمد.
            </p>
          </Reveal>
          <Reveal><Calculator /></Reveal>
        </div>
      </section>

      {/* PHASE / ABOUT */}
      <section id="phase" className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <div className="overflow-hidden rounded-[10px] aspect-4/3 bg-wash">
              <img src="/images/district.webp" alt="سوديك إيست — المنطقة التجارية والمجتمع" className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <span className="label">THE PHASE</span>
            <h2 className="text-[clamp(22px,3.2vw,30px)] mb-5">مرحلة جديدة داخل مجتمع شغّال بالفعل</h2>
            <p className="text-muted text-[15px] leading-[2] mb-7 max-w-[64ch]">
              المرحلة دي جوّه سوديك إيست — مجتمع فيه مراحل مسلّمة ومسكونة ومنطقة تجارية وخدمات شغّالة.
              يعني مش بتشتري في أرض فاضية، بتشتري مرحلة جديدة جوّه حاجة قايمة ومعروفة إدارتها ومستوى تشطيبها.
            </p>
            <ul className="list-none grid sm:grid-cols-2 gap-x-8">
              {PHASE_POINTS.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] py-2.5 border-b border-line">
                  <span className="w-1.5 h-1.5 bg-sodic rotate-45 mt-2.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ON SITE */}
      <section className="py-16 lg:py-20 bg-coal text-white">
        <div className="mx-auto max-w-[1220px] px-5 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14 items-center">
          <Reveal>
            <div className="overflow-hidden rounded-[10px] aspect-3/4 bg-white/10">
              <img src="/images/onsite.webp" alt="سوديك إيست — لقطة من المشروع على الطبيعة" className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <span className="label label-light">ON SITE</span>
            <h2 className="text-[clamp(22px,3.2vw,30px)] text-white mb-5">المشروع على الطبيعة — مش رندر بس</h2>
            <p className="text-white/60 text-[15px] leading-[2] mb-7 max-w-[60ch]">
              الصورة دي من داخل سوديك إيست نفسه: مباني منفّذة، لاندسكيب مزروع، وشوارع داخلية جاهزة.
              ده الفرق بين مشروع لسه على الماكيت ومشروع بتشوف فيه مرحلة قبلك اتسلّمت واتعاشت.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                ["مراحل مسلّمة", "داخل نفس المشروع"],
                ["لاندسكيب منفّذ", "مش وعد في الماستر بلان"],
                ["إدارة مجتمعية", "شغّالة بالفعل"],
              ].map(([t, d], i) => (
                <div key={i} className="border-s-3 border-sodic-sky ps-4 py-1">
                  <div className="font-[family-name:var(--font-display)] font-bold text-[15.5px] text-white">{t}</div>
                  <div className="text-white/45 text-[12.5px] mt-1">{d}</div>
                </div>
              ))}
            </div>
            <a href="#lead" className="btn btn-sodic mt-8">احجز معاينة على الطبيعة</a>
          </Reveal>
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">THE CASE</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] mb-3">ليه المرحلة دي تحديداً</h2>
            <p className="text-muted text-[15px] leading-[2] max-w-[72ch] mb-10">
              أربع نقاط بتفرق بين المرحلة دي وبين أي طرح تاني في التجمع دلوقتي.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY.map((w, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="card p-6 h-full">
                  <div className="font-[family-name:var(--font-display)] font-extrabold text-[30px] text-sodic leading-none num">{w.n}</div>
                  <div className="text-muted text-[12px] mb-4">{w.nl}</div>
                  <h3 className="text-[16px] mb-2 leading-snug">{w.t}</h3>
                  <p className="text-muted text-[13.5px] leading-[1.9]">{w.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="py-16 lg:py-20 bg-soft">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">THE COMMUNITY</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] mb-10">الخدمات داخل المجتمع</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10">
            {AMENITIES.map((a, i) => (
              <Reveal key={i} delay={i * 40}>
                <div className="py-5 border-b border-line">
                  <h3 className="text-[15.5px] mb-1">{a.t}</h3>
                  <p className="text-muted text-[13.5px] leading-[1.85]">{a.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="location" className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <span className="label">THE LOCATION</span>
            <h2 className="text-[clamp(22px,3.2vw,30px)] mb-5">سوديك إيست — شرق القاهرة</h2>
            <p className="text-muted text-[15px] leading-[2] mb-7 max-w-[60ch]">
              موقع بيربط بين التجمع والعاصمة الإدارية، وعلى وصول مباشر بالطريق الدائري الأوسطي
              ومحور محمد بن زايد.
            </p>
            <ul className="list-none">
              {LOCATION.map((l, i) => (
                <li key={i} className="flex justify-between gap-5 py-3.5 border-b border-line last:border-0 text-[14.5px]">
                  <b className="font-bold">{l.t}</b>
                  <span className="text-muted shrink-0">{l.d}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted text-[12px] leading-[1.9] mt-5">
              المسافات تقريبية وتختلف حسب نقطة الانطلاق وحالة الطريق.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="overflow-hidden rounded-[10px] aspect-4/3 bg-wash">
              <img src="/images/aerial.webp" alt="منظر جوي لسوديك إيست" className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-16 lg:py-20 bg-soft">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">GALLERY</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] mb-3">صور من المشروع</h2>
            <p className="text-muted text-[15px] leading-[2] max-w-[70ch] mb-9">
              صور ومخططات من المواد التسويقية للشركة المطوّرة، وذات طبيعة تعبيرية وقد تختلف عن الشكل النهائي.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY.map((g, i) => (
              <Reveal key={i} delay={i * 45}>
                <figure className="relative overflow-hidden rounded-[8px] aspect-16/9 bg-wash">
                  <img src={g.src} alt={g.cap} loading="lazy" className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <figcaption className="absolute inset-x-0 bottom-0 px-4 pt-9 pb-3 text-[12.5px] text-white bg-gradient-to-t from-coal/85 to-transparent">{g.cap}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">FAQ</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] mb-9">أسئلة متكررة</h2>
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-x-12">
            {FAQ.map((f, i) => (
              <div key={i} className="border-b border-line self-start">
                <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}
                  className="w-full text-start py-5 flex justify-between items-center gap-4 bg-transparent border-0 cursor-pointer font-[family-name:var(--font-display)] font-bold text-[15px] text-ink">
                  <span>{f.q}</span>
                  <span className={`shrink-0 text-sodic text-[20px] leading-none transition-transform duration-200 ${faq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                <div className={`acc ${faq === i ? "open" : ""}`}>
                  <p className="pb-5 text-muted text-[14px] leading-[2]">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OTHER OFFERS */}
      <section id="offers" className="py-16 lg:py-20 bg-coal text-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label label-light">MORE FROM SODIC</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] text-white mb-3">عروض سوديك الأخرى المطروحة</h2>
            <p className="text-white/55 text-[15px] leading-[2] max-w-[72ch] mb-10">
              لو المرحلة الجديدة مش الأنسب ليك، في تلات عروض تانية شغّالة دلوقتي.
              كلّمنا واتساب أو اتصل وهنبعتلك تفاصيل أي واحد فيهم.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {OFFERS.map((o, i) => (
              <Reveal key={o.en} delay={i * 70}>
                <div className="bg-white/6 border border-white/12 rounded-[10px] overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-16/10 bg-white/10">
                    <img src={o.img} alt={o.name} loading="lazy" className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span className="absolute top-3 start-3 badge !text-[11.5px] !px-3">{o.tag}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="block text-[11px] font-bold tracking-wider text-sodic-sky num mb-1.5">{o.en}</span>
                    <h3 className="text-[18px] text-white mb-1.5">{o.name}</h3>
                    <p className="text-white/45 text-[12.5px] mb-3">{o.city}</p>
                    <p className="text-white/60 text-[13.5px] leading-[1.9] mb-6">{o.line}</p>
                    <div className="flex gap-2 mt-auto">
                      <a href={wa(`مهتم بـ${o.name} (${o.en}) من سوديك. برجاء إرسال التفاصيل والأسعار وخطة السداد.`)}
                        target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa flex-1 !py-3 !px-3 !text-[13.5px]">
                        <WaIcon s={16} />واتساب
                      </a>
                      <a href={`tel:${PHONE_INTL}`} onClick={onCall} className="btn btn-ghost !py-3 !px-4 !text-[13.5px] shrink-0">
                        <PhoneIcon s={16} />اتصال
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL LEAD */}
      <section className="py-16 lg:py-20 bg-wash">
        <div className="mx-auto max-w-[1220px] px-5 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="label">REGISTER INTEREST</span>
            <h2 className="text-[clamp(21px,3vw,30px)] mb-4">سجّل اهتمامك واستلم جدول الأسعار</h2>
            <p className="text-muted text-[15px] leading-[2] mb-6 max-w-[54ch]">
              هنبعتلك جدول الأسعار الكامل والماستر بلان والمتاح الحالي من وحدات المرحلة الجديدة.
            </p>
            <ul className="list-none mb-7">
              {[
                `مقدم ${DOWN} فقط وتقسيط ${YEARS}`,
                `جدية الحجز ${EOI} جنيه — التخصيص بأولوية التسجيل`,
                "7 نوعيات وحدات من 76 حتى 200 م²",
                `تشطيب ${FINISH}`,
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14.5px] py-2.5 border-b border-line-2/60">
                  <span className="w-1.5 h-1.5 bg-sodic rotate-45 mt-2.5 shrink-0" />{t}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa"><WaIcon />واتساب مباشر</a>
              <a href={`tel:${PHONE_INTL}`} onClick={onCall} className="btn btn-line"><PhoneIcon />{PHONE_DISPLAY}</a>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="card p-7 md:p-8">
              <LeadForm subject="Lead (final) — سوديك إيست المرحلة الجديدة" openLegal={openLegal} compact />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-coal-2 text-white/55 pt-14 pb-28 md:pb-14 text-[13px]">
        <div className="mx-auto max-w-[1220px] px-5">
          <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10 pb-8 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-[3px] h-8 bg-sodic-sky block" />
                <span className="font-[family-name:var(--font-display)] text-[17px] font-extrabold text-white">سوديك إيست — المرحلة الجديدة</span>
              </div>
              <p className="leading-[2] max-w-[46ch]">
                {AGENT_AR} — وكيل مبيعات معتمد لدى سوديك. نعرض المرحلة الجديدة وباقي عروض سوديك المطروحة.
              </p>
            </div>
            <div>
              <h4 className="text-white text-[14px] mb-3">الصفحة</h4>
              <ul className="list-none">
                {NAV.map((n) => <li key={n.h} className="py-1"><a href={n.h} className="no-underline hover:text-white">{n.t}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[14px] mb-3">تواصل</h4>
              <ul className="list-none">
                <li className="py-1"><a href={`tel:${PHONE_INTL}`} onClick={onCall} className="no-underline hover:text-white num">{PHONE_DISPLAY}</a></li>
                <li className="py-1"><a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="no-underline hover:text-white">واتساب</a></li>
                <li className="py-1"><a href={`mailto:${AGENT_EMAIL}`} className="no-underline hover:text-white" dir="ltr">{AGENT_EMAIL}</a></li>
                <li className="py-1"><button onClick={openLegal} className="bg-transparent border-0 p-0 cursor-pointer text-white/55 hover:text-white underline font-[inherit] text-[inherit]">سياسة الخصوصية وإخلاء المسئولية</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-7 text-[12px] leading-[2] text-white/38">
            <p className="max-w-[96ch] mb-3">
              هذا الموقع مملوك ومُدار بواسطة {AGENT_AR} ({AGENT_EN})، وكيل مبيعات معتمد لدى سوديك.
              <strong className="text-white/60"> لسنا الشركة المطوّرة وهذه ليست الصفحة الرسمية لسوديك.</strong>{" "}
              «سوديك» و«SODIC» وأسماء المشروعات وشعاراتها علامات تجارية مملوكة لأصحابها وتُستخدم هنا لغرض
              تعريف المشروعات المعروضة فقط. الصور والمخططات مواد تسويقية صادرة عن المطوّر وذات طبيعة تعبيرية.
            </p>
            <p className="max-w-[96ch] mb-3">{PRICE_NOTE}</p>
            <p>© <N>2026</N> {AGENT_EN} — جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* LEGAL */}
      {legal && <LegalModal close={() => setLegal(false)} />}

      {/* COOKIE */}
      {cookie && (
        <div className="fixed inset-x-0 bottom-0 z-190 bg-coal text-white/75 px-5 py-3.5 flex flex-wrap gap-3 items-center justify-center text-[13px] border-t-3 border-sodic mb-[64px] md:mb-0">
          <span className="max-w-[600px] leading-[1.8] text-center">
            نستخدم ملفات تعريف الارتباط لقياس أداء الإعلانات.{" "}
            <button onClick={openLegal} className="text-sodic-sky underline bg-transparent border-0 p-0 cursor-pointer font-[inherit] text-[inherit]">اعرف أكثر</button>
          </span>
          <span className="flex gap-2">
            <button onClick={acceptCookies} className="btn btn-sodic !py-2 !px-5 !text-[13px]">موافق</button>
            <button onClick={() => setCookie(false)} className="btn btn-ghost !py-2 !px-5 !text-[13px]">رفض</button>
          </span>
        </div>
      )}

      {/* FABS */}
      <div className="fab-stack">
        <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="fab fab-wa" aria-label="تواصل واتساب">
          <span className="fab-tip">تواصل واتساب</span><WaIcon s={26} />
        </a>
        <a href={`tel:${PHONE_INTL}`} onClick={onCall} className="fab fab-call" aria-label="اتصل بنا">
          <span className="fab-tip">اتصل بنا — {PHONE_DISPLAY}</span><PhoneIcon s={24} />
        </a>
        {up && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fab fab-top border-0 cursor-pointer" aria-label="أعلى الصفحة">
            <span className="fab-tip">أعلى الصفحة</span>
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        )}
      </div>

      {/* MOBILE BAR */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-95 bg-white border-t border-line p-2 flex gap-2">
        <a href={`tel:${PHONE_INTL}`} onClick={onCall} className="btn btn-coal flex-1 !py-3 !px-2 !text-[13.5px]">اتصل</a>
        <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa flex-1 !py-3 !px-2 !text-[13.5px]">واتساب</a>
        <a href="#lead" className="btn btn-sodic flex-1 !py-3 !px-2 !text-[13.5px]">سجّل</a>
      </nav>
    </>
  );
}
