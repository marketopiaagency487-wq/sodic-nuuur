"use client";

import { useState, useEffect, useRef, FormEvent, ReactNode } from "react";
import {
  PHONE_DISPLAY, PHONE_INTL, WEB3_KEY, WA_MAIN, wa,
  AGENT_AR, AGENT_EN, AGENT_EMAIL, AGENT_ADDRESS, AGENT_HOURS,
  PRICE_NOTE, PROJECTS, BAND, WHY, HUB_FAQ, DIAL, KARMELL_RELEASE,
  type Project,
} from "./lib/site";

/* ═══════════════════ helpers ═══════════════════ */
export const N = ({ children }: { children: ReactNode }) => <span className="num">{children}</span>;

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

const toneCls = (t: Project["tone"]) =>
  t === "coal" ? "badge badge-coal" : t === "sky" ? "badge badge-sky" : "badge";

const hit = (n: string) => {
  const f = (window as unknown as Record<string, (() => void) | undefined>)[n];
  if (f) f();
};
const onWA = () => hit("trackWhatsapp");
const onCall = () => hit("trackCall");

async function submit(
  ref: React.RefObject<HTMLFormElement | null>,
  setSt: (s: "idle" | "sending" | "sent") => void,
  setErr: (s: string) => void,
) {
  if (!ref.current) return false;
  const fd = new FormData(ref.current);
  if ((fd.get("company") as string)?.length) return false;
  setErr(""); setSt("sending");
  const body: Record<string, string> = { access_key: WEB3_KEY, from_name: AGENT_EN };
  fd.forEach((v, k) => { if (k !== "company") body[k] = v.toString(); });
  try {
    const r = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!d.success) throw new Error();
    setSt("sent"); ref.current.reset(); hit("trackFormLead");
    return true;
  } catch {
    setSt("idle"); setErr("حصل خطأ في الإرسال. جرّب مرة تانية أو كلّمنا على واتساب.");
    return false;
  }
}

/* ═══════════════════ chrome ═══════════════════ */
type ChromeProps = { openLegal: () => void };

function Header({ openLegal }: ChromeProps & { openLegal: () => void }) {
  const [drawer, setDrawer] = useState(false);
  return (
    <header className="sticky top-0 z-90 bg-coal/97 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-[1220px] px-5 h-[66px] flex items-center gap-5">
        <a href="/" className="flex items-center gap-3 shrink-0 no-underline">
          <span className="w-[3px] h-9 bg-sodic-sky block" />
          <span>
            <span className="block font-[family-name:var(--font-display)] text-[16px] font-extrabold text-white leading-tight">إطلاقات سوديك</span>
            <span className="block text-[10.5px] text-white/50 leading-tight tracking-wide">SODIC — NEW LAUNCHES</span>
          </span>
        </a>
        <nav className="hidden lg:flex gap-5 ms-auto">
          {PROJECTS.map((p) => (
            <a key={p.slug} href={`/${p.slug}`} className="text-[13.5px] text-white/72 hover:text-white no-underline transition-colors whitespace-nowrap">{p.name.split(" — ")[0]}</a>
          ))}
          <a href="/#faq" className="text-[13.5px] text-white/72 hover:text-white no-underline whitespace-nowrap">أسئلة شائعة</a>
        </nav>
        <div className="hidden md:flex items-center gap-2.5 ms-auto lg:ms-0 shrink-0">
          <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa !py-2.5 !px-4 !text-[13.5px]"><WaIcon s={16} />واتساب</a>
          <a href={`tel:${PHONE_INTL}`} onClick={onCall} className="btn btn-ghost !py-2.5 !px-4 !text-[13.5px] num">{PHONE_DISPLAY}</a>
        </div>
        <button onClick={() => setDrawer(!drawer)} aria-label="القائمة" aria-expanded={drawer} className="lg:hidden text-white p-1.5 shrink-0 ms-auto md:ms-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
      {drawer && (
        <div className="lg:hidden bg-coal border-t border-white/10 px-5 pb-4">
          {PROJECTS.map((p) => (
            <a key={p.slug} href={`/${p.slug}`} onClick={() => setDrawer(false)} className="block py-3 text-[14.5px] text-white/75 no-underline border-b border-white/8">{p.name}</a>
          ))}
          <a href="#lead" onClick={() => setDrawer(false)} className="btn btn-sodic w-full mt-4">اطلب قائمة الأسعار</a>
        </div>
      )}
    </header>
  );
}

function Footer({ openLegal }: ChromeProps) {
  return (
    <footer className="bg-coal-2 text-white/55 pt-14 pb-28 md:pb-14 text-[13px]">
      <div className="mx-auto max-w-[1220px] px-5">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-[3px] h-8 bg-sodic-sky block" />
              <span className="font-[family-name:var(--font-display)] text-[17px] font-extrabold text-white">إطلاقات سوديك</span>
            </div>
            <p className="leading-[2] max-w-[46ch]">
              {AGENT_AR} — وكيل مبيعات معتمد لدى سوديك. نعرض آخر الإطلاقات والعروض ونساعدك تختار الوحدة المناسبة.
            </p>
            <p className="leading-[2] mt-3 text-white/40 text-[12px]">
              {AGENT_ADDRESS}<br />{AGENT_HOURS}
            </p>
          </div>
          <div>
            <h4 className="text-white text-[14px] mb-3">المشروعات</h4>
            <ul className="list-none">
              {PROJECTS.map((p) => <li key={p.slug} className="py-1"><a href={`/${p.slug}`} className="no-underline hover:text-white">{p.name}</a></li>)}
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
            تعريف المشروعات المعروضة فقط. الصور والمخططات مواد تسويقية صادرة عن المطوّر وذات طبيعة تعبيرية
            وقد تختلف عن الشكل النهائي.
          </p>
          <p className="max-w-[96ch] mb-3">{PRICE_NOTE} التعاقد والسداد يتمّان مع الشركة المطوّرة مباشرة وبعقودها وحساباتها الرسمية.</p>
          <p>© <N>2026</N> {AGENT_EN} — جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

function Fabs() {
  const [up, setUp] = useState(false);
  useEffect(() => {
    const f = () => setUp(window.scrollY > 400);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <>
      <div className="fab-stack">
        <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="fab fab-wa" aria-label="تواصل واتساب">
          <span className="fab-tip">تواصل واتساب</span><WaIcon s={26} />
        </a>
        <a href={`tel:${PHONE_INTL}`} onClick={onCall} className="fab fab-call" aria-label="اتصل بنا">
          <span className="fab-tip">اتصل بنا — {PHONE_DISPLAY}</span>
          <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] fill-current" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
        </a>
        {up && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fab fab-top border-0 cursor-pointer" aria-label="أعلى الصفحة">
            <span className="fab-tip">أعلى الصفحة</span>
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        )}
      </div>
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-95 bg-white border-t border-line p-2 flex gap-2">
        <a href={`tel:${PHONE_INTL}`} onClick={onCall} className="btn btn-coal flex-1 !py-3 !px-2 !text-[13.5px]">اتصال</a>
        <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa flex-1 !py-3 !px-2 !text-[13.5px]">واتساب</a>
        <a href="#lead" className="btn btn-sodic flex-1 !py-3 !px-2 !text-[13.5px]">احجز الآن</a>
      </nav>
    </>
  );
}

function LegalModal({ close }: { close: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [close]);
  const rows: [string, string][] = [
    ["البيانات التي نجمعها", "الاسم ورقم الهاتف والبريد والمشروع محل الاهتمام، وذلك فقط عند ملء النموذج بنفسك. كما نجمع بيانات فنية تلقائية (نوع المتصفح ومصدر الزيارة) عبر أدوات القياس."],
    ["الاستخدام", "نستخدم بياناتك للتواصل معك بخصوص استفسارك العقاري وإرسال قوائم الوحدات والأسعار، ولقياس أداء الحملات الإعلانية. لا نبيع بياناتك لأي طرف ثالث لأغراض تسويقية."],
    ["المشاركة", "نشارك بياناتك مع الشركة المطوّرة بالقدر اللازم لإتمام إجراءات الحجز أو التعاقد، ومع مزوّدي الخدمات التقنية الذين يشغّلون الموقع ونظام إدارة العملاء."],
    ["ملفات تعريف الارتباط", "نستخدمها لقياس تحويلات الإعلانات. لا تُفعّل ملفات الارتباط الإعلانية إلا بعد موافقتك الصريحة من الشريط الذي يظهر عند أول زيارة، ويمكنك حذفها من إعدادات المتصفح في أي وقت."],
    ["مدة الاحتفاظ وحقوقك", `نحتفظ ببيانات التواصل مدة أقصاها 24 شهراً من آخر تفاعل. لك حق طلب نسخة من بياناتك أو تصحيحها أو حذفها أو سحب موافقتك في أي وقت — راسلنا على ${AGENT_EMAIL}.`],
    ["صفة مشغّل الموقع", `يدير هذا الموقع ${AGENT_AR} (${AGENT_EN})، وكيل مبيعات معتمد لدى سوديك. لسنا الشركة المطوّرة وهذه ليست الصفحة الرسمية لسوديك.`],
    ["الأسعار وجدية الحجز", `${PRICE_NOTE} مبالغ جدية الحجز (EOI) وشروط استردادها تتحدد من الشركة المطوّرة، وننصح بمراجعتها معها مباشرة قبل السداد.`],
    ["العلامات التجارية والصور", "«سوديك» و«SODIC» وأسماء المشروعات وشعاراتها علامات تجارية مملوكة لأصحابها وتُستخدم هنا لغرض وصفي بحت. الصور والمخططات مواد تسويقية صادرة عن المطوّر وذات طبيعة تعبيرية."],
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
          {rows.map(([h, b], i) => (
            <div key={i}><h3 className="text-[15px] text-ink mt-5 mb-1">{h}</h3><p>{b}</p></div>
          ))}
          <p className="text-[12px] text-muted/70 pt-5">آخر تحديث: سبتمبر <N>2026</N></p>
        </div>
      </div>
    </>
  );
}

function CookieBar({ openLegal }: ChromeProps) {
  const [show, setShow] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem("sodic_cookie_ok")) setShow(true); } catch { setShow(true); } }, []);
  if (!show) return null;
  const accept = () => {
    setShow(false);
    try { localStorage.setItem("sodic_cookie_ok", "1"); } catch { }
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (g) g("consent", "update", {
      ad_storage: "granted", ad_user_data: "granted",
      ad_personalization: "granted", analytics_storage: "granted",
    });
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-190 bg-coal text-white/75 px-5 py-3.5 flex flex-wrap gap-3 items-center justify-center text-[13px] border-t-3 border-sodic mb-[64px] md:mb-0">
      <span className="max-w-[600px] leading-[1.8] text-center">
        نستخدم ملفات تعريف الارتباط لقياس أداء الإعلانات.{" "}
        <button onClick={openLegal} className="text-sodic-sky underline bg-transparent border-0 p-0 cursor-pointer font-[inherit] text-[inherit]">اعرف أكثر</button>
      </span>
      <span className="flex gap-2">
        <button onClick={accept} className="btn btn-sodic !py-2 !px-5 !text-[13px]">موافق</button>
        <button onClick={() => setShow(false)} className="btn btn-ghost !py-2 !px-5 !text-[13px]">رفض</button>
      </span>
    </div>
  );
}

/* ═══════════════════ lead form ═══════════════════ */
function LeadForm({ subject, preset, openLegal, variant = "full" }:
  { subject: string; preset?: string; openLegal: () => void; variant?: "full" | "strip" }) {
  const [st, setSt] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");
  const ref = useRef<HTMLFormElement>(null);

  if (st === "sent") {
    return (
      <div className="text-center py-7">
        <h3 className="text-sodic text-[21px] mb-2">تم استلام طلبك</h3>
        <p className="text-muted text-[14.5px]">هيتواصل معك مستشار عقاري خلال <N>24</N> ساعة عمل بقائمة الوحدات المتاحة والأسعار المحدثة.</p>
      </div>
    );
  }

  const projectField = (
    <select name="project" className="fld" defaultValue={preset || ""} aria-label="المشروع">
      <option value="">المشروع الذي يهمّك</option>
      {PROJECTS.map((p) => <option key={p.slug} value={p.name}>{p.name}</option>)}
      <option value="استفسار عام">استفسار عام</option>
    </select>
  );

  return (
    <form ref={ref} onSubmit={(e: FormEvent) => { e.preventDefault(); submit(ref, setSt, setErr); }}
      className={variant === "strip" ? "grid lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center" : ""}>
      <input type="text" name="company" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="subject" value={subject} />

      {variant === "strip" ? (
        <>
          <input name="name" className="fld" placeholder="الاسم بالكامل *" required aria-label="الاسم" />
          <input name="phone" type="tel" dir="ltr" className="fld num" placeholder="01012345678 *" required aria-label="رقم الموبايل" />
          {projectField}
          <button type="submit" disabled={st === "sending"} className="btn btn-sodic whitespace-nowrap">
            {st === "sending" ? "جاري الإرسال…" : "ابعتلي القائمة"}
          </button>
          {err && <p className="lg:col-span-4 text-[13px] text-[#c0392b]">{err}</p>}
          <p className="lg:col-span-4 text-[11.5px] text-muted leading-[1.7]">
            بالضغط على إرسال أنت توافق على{" "}
            <button type="button" onClick={openLegal} className="text-sodic underline bg-transparent border-0 p-0 cursor-pointer font-[inherit] text-[inherit]">سياسة الخصوصية</button>.
          </p>
        </>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="name" className="fld" placeholder="الاسم بالكامل *" required aria-label="الاسم" />
            <div className="flex gap-2">
              <select name="dial" className="fld num !w-[104px] !px-2 shrink-0" defaultValue="EG +20" aria-label="كود الدولة">
                {DIAL.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input name="phone" type="tel" dir="ltr" className="fld num" placeholder="01012345678 *" required aria-label="رقم الموبايل" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {projectField}
            <input name="email" type="email" dir="ltr" className="fld" placeholder="البريد الإلكتروني (اختياري)" aria-label="البريد" />
          </div>
          <button type="submit" disabled={st === "sending"} className="btn btn-sodic w-full mt-5">
            {st === "sending" ? "جاري الإرسال…" : "اطلب قائمة الأسعار"}
          </button>
          {err && <p className="text-[13px] text-[#c0392b] mt-3 text-center">{err}</p>}
          <p className="text-[12px] text-muted leading-[1.8] mt-4 text-center">
            بالضغط على إرسال أنت توافق على{" "}
            <button type="button" onClick={openLegal} className="text-sodic underline bg-transparent border-0 p-0 cursor-pointer font-[inherit] text-[inherit]">سياسة الخصوصية</button>
            {" "}— بياناتك تُستخدم فقط للتواصل بخصوص استفسارك العقاري.
          </p>
        </>
      )}
    </form>
  );
}

/* ═══════════════════ FAQ ═══════════════════ */
function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="grid lg:grid-cols-2 gap-x-12">
      {items.map((f, i) => (
        <div key={i} className="border-b border-line self-start">
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
            className="w-full text-start py-5 flex justify-between items-center gap-4 bg-transparent border-0 cursor-pointer font-[family-name:var(--font-display)] font-bold text-[15px] text-ink">
            <span>{f.q}</span>
            <span className={`shrink-0 text-sodic text-[20px] leading-none transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}>+</span>
          </button>
          <div className={`acc ${open === i ? "open" : ""}`}>
            <p className="pb-5 text-muted text-[14px] leading-[2]">{f.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════ HUB PAGE ═══════════════════ */
export function HubPage() {
  const [legal, setLegal] = useState(false);
  const openLegal = () => setLegal(true);
  const [bar, setBar] = useState(true);

  return (
    <>
      {bar && (
        <div className="bg-sodic text-white text-[13px] font-semibold text-center py-2.5 px-10 relative leading-relaxed">
          إطلاقات سوديك الجديدة — سوديك إيست · إيست فيل · في ريزيدنس · كارميل
          <button onClick={() => setBar(false)} aria-label="إغلاق"
            className="absolute top-1/2 -translate-y-1/2 start-3 w-6 h-6 rounded-full bg-white/20 text-white border-0 cursor-pointer text-[13px] leading-none">✕</button>
        </div>
      )}

      <Header openLegal={openLegal} />

      {/* HERO */}
      <section className="relative min-h-[76vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-coal">
          <img src="/images/hero.webp" alt="" className="w-full h-full object-cover kenburns opacity-45"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/88 to-coal/50" />
        <div className="relative mx-auto max-w-[1220px] w-full px-5 py-16">
          <div className="max-w-[740px]">
            <span className="label label-light">SODIC — UPCOMING OPPORTUNITIES</span>
            <h1 className="text-white text-[clamp(28px,5.2vw,48px)] mb-5">
              إطلاقات وعروض سوديك الجديدة
              <span className="block text-sodic-sky text-[0.58em] font-bold mt-2">أربع فرص مطروحة الآن — من <N>6.7</N> مليون جنيه</span>
            </h1>
            <p className="text-white/65 text-[15.5px] leading-[2] max-w-[62ch] mb-9">
              مرحلة جديدة في سوديك إيست بأسعار بداية معلنة ومقدم <N>1.5%</N>، نظام سداد جديد على إيست فيل،
              وحدات استلام فوري في في ريزيدنس بالجولدن سكوير، وطرح محدود لفلات فيلا كارميل.
              اطلب قائمة الوحدات والأسعار المحدثة لأي منهم.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <a href="#lead" className="btn btn-sodic">اطلب قائمة الأسعار</a>
              <a href={WA_MAIN} target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa"><WaIcon />واتساب مباشر</a>
            </div>
            <div className="flex items-baseline gap-3 border-t border-white/15 pt-6">
              <span className="text-white/50 text-[13px]">أقل سعر بداية معلن</span>
              <span className="font-[family-name:var(--font-display)] font-extrabold text-[28px] text-sodic-sky leading-none"><N>6,700,000</N></span>
              <span className="text-white/50 text-[13px]">جنيه · مقدم <N>1.5%</N></span>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT CARDS */}
      <section id="projects" className="bg-soft border-b border-line">
        <div className="mx-auto max-w-[1220px] px-5 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <a href={`/${p.slug}`} className="card block h-full no-underline text-inherit hover:border-sodic transition-colors">
                <div className="relative aspect-16/10 bg-wash">
                  <img src={p.img} alt={`${p.name} — ${p.city}`} loading="lazy" className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <span className={`${toneCls(p.tone)} absolute top-3 start-3 !text-[11.5px] !px-3`}>{p.tag}</span>
                </div>
                <div className="p-5">
                  <span className="block text-[11px] font-bold tracking-wider text-sodic num mb-1.5">{p.en}</span>
                  <h3 className="text-[17px] mb-1.5 leading-snug">{p.name}</h3>
                  <p className="text-muted text-[13px] mb-4">{p.city}</p>
                  <div className="flex items-center justify-between border-t border-line pt-3.5 gap-2">
                    <span className="text-[12.5px] text-muted">{p.priceFrom ? "يبدأ من" : "التفاصيل"}</span>
                    <span className="text-sodic font-bold text-[13.5px] num">{p.priceFrom ? `${p.priceFrom} ج` : "←"}</span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BAND */}
      <section className="bg-sodic text-white">
        <div className="mx-auto max-w-[1220px] px-5 grid grid-cols-2 lg:grid-cols-4">
          {BAND.map((b, i) => (
            <div key={i} className="py-7 px-4 text-center border-b border-white/15 lg:border-b-0 lg:border-s lg:border-white/15 lg:first:border-s-0">
              <div className="font-[family-name:var(--font-display)] font-extrabold text-[28px] leading-none"><N>{b.v}</N></div>
              <div className="text-white/65 text-[12px] mt-2 leading-snug">{b.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LEAD STRIP */}
      <section id="lead" className="bg-wash border-b border-line">
        <div className="mx-auto max-w-[1220px] px-5 py-9">
          <p className="font-[family-name:var(--font-display)] font-bold text-[16px] mb-4">اطلب قائمة الوحدات والأسعار المحدثة</p>
          <LeadForm subject="Lead — إطلاقات سوديك" openLegal={openLegal} variant="strip" />
        </div>
      </section>

      {/* SODIC EAST PRICE TABLE — the headline offer */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">أسعار المرحلة الجديدة</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] mb-3">أسعار سوديك إيست — المرحلة الجديدة <N>2026</N></h2>
            <p className="text-muted text-[15px] leading-[2] max-w-[76ch] mb-8">
              مرحلة سكنية جديدة على أكثر من <N>65</N> فداناً بتشطيب Flexi، بأسعار بداية معلنة لسبع نوعيات وحدات.
              المقدم <N>1.5%</N> والتقسيط حتى <N>10</N> سنوات، وجدية الحجز <N>50,000</N> جنيه.
            </p>
          </Reveal>
          <Reveal>
            <div className="card overflow-x-auto">
              <table className="ptab">
                <thead>
                  <tr><th>نوع الوحدة</th><th>الكود</th><th>متوسط المساحة</th><th>السعر يبدأ من (ج)</th><th></th></tr>
                </thead>
                <tbody>
                  {PROJECTS[0].units.map((u, i) => (
                    <tr key={i}>
                      <td className="font-semibold">{u.type}</td>
                      <td className="text-muted num text-[13px]">{u.en}</td>
                      <td className="num">{u.area}</td>
                      <td className="text-sodic font-bold num">{u.price}</td>
                      <td>
                        <a href={wa(`مرحباً، مهتم بوحدة ${u.type} (${u.en}) في مرحلة سوديك إيست الجديدة — ${u.area} — سعر معلن من ${u.price} ج. ممكن أعرف المتاح؟`)}
                          target="_blank" rel="noopener" onClick={onWA}
                          aria-label={`استفسر عن ${u.type} على واتساب`}
                          className="w-9 h-9 rounded-full bg-wa text-white flex items-center justify-center no-underline hover:brightness-90 transition-[filter]">
                          <WaIcon s={17} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted text-[12.5px] leading-[1.95] mt-5 max-w-[92ch]">* {PRICE_NOTE}</p>
            <div className="mt-6"><a href="/sodic-east" className="btn btn-line">كل تفاصيل المرحلة الجديدة</a></div>
          </Reveal>
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 lg:py-20 bg-coal text-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label label-light">ليه سوديك</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] text-white mb-10">إيه اللي بيميّز العروض دي</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-x-14">
            {WHY.map((w, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="flex gap-5 py-6 border-b border-white/12">
                  <span className="font-[family-name:var(--font-display)] font-extrabold text-[32px] text-sodic-sky/35 leading-none shrink-0 num">{i + 1}</span>
                  <div>
                    <h3 className="text-[17px] text-white mb-2">{w.t}</h3>
                    <p className="text-white/55 text-[14.5px] leading-[1.95]">{w.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 lg:py-20 bg-soft">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">أسئلة شائعة</span>
            <h2 className="text-[clamp(22px,3.2vw,32px)] mb-9">أسئلة شائعة عن إطلاقات سوديك</h2>
          </Reveal>
          <Faq items={HUB_FAQ} />
        </div>
      </section>

      {/* FULL FORM */}
      <section id="full-form" className="py-16 lg:py-20 bg-wash">
        <div className="mx-auto max-w-[820px] px-5">
          <div className="card p-7 md:p-10">
            <div className="text-center mb-8">
              <span className="label justify-center">سجّل اهتمامك</span>
              <h2 className="text-[clamp(21px,3vw,28px)] mb-2">استلم قائمة الوحدات والأسعار</h2>
              <p className="text-muted text-[14.5px] max-w-[54ch] mx-auto">اختار المشروع اللي يهمّك وهيوصلك آخر متاح بالمساحات والأسعار المعلنة من المطوّر</p>
            </div>
            <LeadForm subject="Lead (full) — إطلاقات سوديك" openLegal={openLegal} />
          </div>
        </div>
      </section>

      <Footer openLegal={openLegal} />
      <Fabs />
      <CookieBar openLegal={openLegal} />
      {legal && <LegalModal close={() => setLegal(false)} />}
    </>
  );
}

/* ═══════════════════ PROJECT PAGE ═══════════════════ */
export function ProjectPage({ slug }: { slug: string }) {
  const [legal, setLegal] = useState(false);
  const openLegal = () => setLegal(true);
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) return null;
  const others = PROJECTS.filter((x) => x.slug !== slug);

  return (
    <>
      <Header openLegal={openLegal} />

      {/* HERO */}
      <section className="relative min-h-[64vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-coal">
          <img src={p.hero} alt="" className="w-full h-full object-cover kenburns opacity-45"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/88 to-coal/45" />
        <div className="relative mx-auto max-w-[1220px] w-full px-5 py-14">
          <nav className="text-[12.5px] text-white/45 mb-5">
            <a href="/" className="no-underline hover:text-white">إطلاقات سوديك</a>
            <span className="mx-2">/</span>
            <span className="text-white/70">{p.name}</span>
          </nav>
          <span className={`${toneCls(p.tone)} mb-4`}>{p.tag}</span>
          <h1 className="text-white text-[clamp(26px,4.6vw,42px)] mb-4 max-w-[22ch]">{p.headline}</h1>
          <p className="text-white/60 text-[14px] mb-7">{p.loc}</p>
          <div className="flex flex-wrap gap-3">
            <a href="#lead" className="btn btn-sodic">اطلب قائمة الوحدات</a>
            <a href={wa(`مرحباً، مهتم بـ${p.name} — ${p.city}. ممكن أعرف المتاح والأسعار؟`)}
              target="_blank" rel="noopener" onClick={onWA} className="btn btn-wa"><WaIcon />واتساب</a>
          </div>
        </div>
      </section>

      {/* FACTS BAND */}
      <section className="bg-sodic text-white">
        <div className="mx-auto max-w-[1220px] px-5 grid grid-cols-2 lg:grid-cols-4">
          {p.facts.map(([k, v], i) => (
            <div key={i} className="py-6 px-4 text-center border-b border-white/15 lg:border-b-0 lg:border-s lg:border-white/15 lg:first:border-s-0">
              <div className="font-[family-name:var(--font-display)] font-extrabold text-[21px] leading-none"><N>{v}</N></div>
              <div className="text-white/65 text-[12px] mt-2">{k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LEAD STRIP */}
      <section id="lead" className="bg-wash border-b border-line">
        <div className="mx-auto max-w-[1220px] px-5 py-9">
          <p className="font-[family-name:var(--font-display)] font-bold text-[16px] mb-4">اطلب قائمة وحدات {p.name} والأسعار</p>
          <LeadForm subject={`Lead — ${p.name}`} preset={p.name} openLegal={openLegal} variant="strip" />
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <div className="overflow-hidden rounded-[10px] aspect-4/3 bg-wash">
              <img src={p.img} alt={`${p.name} — ${p.city}`} className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <span className="label">{p.en}</span>
            <h2 className="text-[clamp(22px,3.2vw,30px)] mb-5">عن {p.name}</h2>
            <p className="text-muted text-[15px] leading-[2] mb-7 max-w-[64ch]"
              dangerouslySetInnerHTML={{ __html: p.blurb }} />
            {p.slug === "karmell" && KARMELL_RELEASE && (
              <p className="text-[14px] bg-wash text-sodic-d rounded-[8px] px-5 py-4 mb-7 leading-[1.9]">
                <strong>موعد الطرح:</strong> {KARMELL_RELEASE}. الطرح محدود العدد — سجّل بياناتك قبله عشان تكون جاهز.
              </p>
            )}
            <ul className="list-none grid sm:grid-cols-2 gap-x-8">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] py-2.5 border-b border-line">
                  <span className="w-1.5 h-1.5 bg-sodic rotate-45 mt-2.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* UNITS + PRICES */}
      {p.units.length > 0 && (
        <section className="py-16 lg:py-20 bg-soft">
          <div className="mx-auto max-w-[1220px] px-5">
            <Reveal>
              <span className="label">الوحدات والأسعار</span>
              <h2 className="text-[clamp(22px,3.2vw,30px)] mb-3">وحدات ومساحات {p.name}</h2>
              <p className="text-muted text-[15px] leading-[2] max-w-[74ch] mb-8">
                {p.priceFrom
                  ? <>الأسعار الاسترشادية المعلنة تبدأ من <strong className="text-sodic"><N>{p.priceFrom}</N> ج</strong>{p.down ? <>، بمقدم <N>{p.down}</N></> : null}{p.years ? <> وتقسيط حتى {p.years}</> : null}{p.eoi ? <>، وجدية حجز <N>{p.eoi}</N> ج</> : null}.</>
                  : "الأسعار تتغيّر مع كل مرحلة إطلاق وحسب المساحة والدور والفيو — اطلب آخر قائمة معتمدة."}
              </p>
            </Reveal>
            <Reveal>
              <div className="card overflow-x-auto">
                <table className="ptab">
                  <thead>
                    <tr><th>نوع الوحدة</th><th>الكود</th><th>المساحة</th><th>السعر يبدأ من (ج)</th><th></th></tr>
                  </thead>
                  <tbody>
                    {p.units.map((u, i) => (
                      <tr key={i}>
                        <td className="font-semibold">{u.type}</td>
                        <td className="text-muted num text-[13px]">{u.en}</td>
                        <td className="num">{u.area}</td>
                        <td className={u.price ? "text-sodic font-bold num" : "text-muted text-[13.5px]"}>
                          {u.price ? <N>{u.price}</N> : "تواصل لآخر سعر"}
                        </td>
                        <td>
                          <a href={wa(`مرحباً، مهتم بوحدة ${u.type} في ${p.name}${u.area !== "—" ? ` — ${u.area}` : ""}${u.price ? ` — سعر معلن من ${u.price} ج` : ""}. ممكن أعرف المتاح؟`)}
                            target="_blank" rel="noopener" onClick={onWA}
                            aria-label={`استفسر عن ${u.type} على واتساب`}
                            className="w-9 h-9 rounded-full bg-wa text-white flex items-center justify-center no-underline hover:brightness-90 transition-[filter]">
                            <WaIcon s={17} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-muted text-[12.5px] leading-[1.95] mt-5 max-w-[92ch]">* {PRICE_NOTE}</p>
            </Reveal>
          </div>
        </section>
      )}

      {/* PAYMENT */}
      <section className="py-16 lg:py-20 bg-coal text-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label label-light">السداد</span>
            <h2 className="text-[clamp(22px,3.2vw,30px)] text-white mb-8">نظام السداد المعلن</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              ["المقدم", p.down || "—"],
              ["مدة التقسيط", p.years || "—"],
              ["التشطيب", p.finish || "—"],
              [p.eoi ? "جدية الحجز (EOI)" : "الاستلام", p.eoi ? `${p.eoi} ج` : (p.delivery || "—")],
            ].map(([k, v], i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="bg-white/6 border border-white/12 rounded-[10px] p-6 h-full">
                  <div className="text-white/50 text-[12.5px] mb-2">{k}</div>
                  <div className="font-[family-name:var(--font-display)] font-extrabold text-[22px] text-sodic-sky"><N>{v}</N></div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="text-white/40 text-[12.5px] leading-[1.95] mt-7 max-w-[92ch]">
            قيمة الأقساط والشروط النهائية تتحدد من الشركة المطوّرة عند التعاقد. {PRICE_NOTE}
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">معرض الصور</span>
            <h2 className="text-[clamp(22px,3.2vw,30px)] mb-3">صور {p.name}</h2>
            <p className="text-muted text-[15px] leading-[2] max-w-[70ch] mb-8">
              صور ومخططات من المواد التسويقية للشركة المطوّرة، وذات طبيعة تعبيرية.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {p.gallery.map((g, i) => (
              <Reveal key={i} delay={i * 50}>
                <figure className="relative overflow-hidden rounded-[8px] aspect-4/3 bg-wash">
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
      <section className="py-16 lg:py-20 bg-soft">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">أسئلة شائعة</span>
            <h2 className="text-[clamp(22px,3.2vw,30px)] mb-9">أسئلة شائعة عن {p.name}</h2>
          </Reveal>
          <Faq items={p.faq} />
        </div>
      </section>

      {/* OTHER LAUNCHES */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1220px] px-5">
          <Reveal>
            <span className="label">إطلاقات أخرى</span>
            <h2 className="text-[clamp(22px,3.2vw,30px)] mb-8">عروض سوديك الأخرى المطروحة</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 60}>
                <a href={`/${o.slug}`} className="card block h-full no-underline text-inherit hover:border-sodic transition-colors">
                  <div className="relative aspect-16/10 bg-wash">
                    <img src={o.img} alt={o.name} loading="lazy" className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span className={`${toneCls(o.tone)} absolute top-3 start-3 !text-[11.5px] !px-3`}>{o.tag}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[16.5px] mb-1.5 leading-snug">{o.name}</h3>
                    <p className="text-muted text-[13px]">{o.city}</p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FULL FORM */}
      <section id="full-form" className="py-16 lg:py-20 bg-wash">
        <div className="mx-auto max-w-[820px] px-5">
          <div className="card p-7 md:p-10">
            <div className="text-center mb-8">
              <span className="label justify-center">سجّل اهتمامك</span>
              <h2 className="text-[clamp(21px,3vw,28px)] mb-2">استلم قائمة وحدات {p.name}</h2>
              <p className="text-muted text-[14.5px] max-w-[54ch] mx-auto">آخر وحدات متاحة بالمساحات والأسعار المعلنة من المطوّر</p>
            </div>
            <LeadForm subject={`Lead (full) — ${p.name}`} preset={p.name} openLegal={openLegal} />
          </div>
        </div>
      </section>

      <Footer openLegal={openLegal} />
      <Fabs />
      <CookieBar openLegal={openLegal} />
      {legal && <LegalModal close={() => setLegal(false)} />}
    </>
  );
}
