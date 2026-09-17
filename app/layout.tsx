import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SITE_URL, AGENT_EN, PHONE_INTL, AGENT_EMAIL } from "./lib/site";

/* ⚠️ حط الـ Google Ads ID والتحويلات */
const ADS_ID = "AW-XXXXXXXXXX";
const CONV_FORM = `${ADS_ID}/XXXXXXXXXXXXXXXXXXX`;
const CONV_WA = `${ADS_ID}/XXXXXXXXXXXXXXXXXXX`;
const CONV_CALL = `${ADS_ID}/XXXXXXXXXXXXXXXXXXX`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  openGraph: { siteName: AGENT_EN, locale: "ar_EG", type: "website" },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: AGENT_EN,
  url: SITE_URL,
  telephone: PHONE_INTL,
  email: AGENT_EMAIL,
  address: { "@type": "PostalAddress", addressLocality: "القاهرة", addressCountry: "EG" },
  description: "وكيل مبيعات عقاري معتمد لدى سوديك في مصر. لسنا الشركة المطوّرة.",
  areaServed: "EG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Archivo:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      </head>
      <body>
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
          try { if (localStorage.getItem('sodic_cookie_ok')) {
            gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});
          } } catch(e) {}
          gtag('config','${ADS_ID}');
          function trackFormLead(){ gtag('event','conversion',{'send_to':'${CONV_FORM}'}); }
          function trackWhatsapp(){ gtag('event','conversion',{'send_to':'${CONV_WA}'}); }
          function trackCall(){ gtag('event','conversion',{'send_to':'${CONV_CALL}'}); }
        `}</Script>
      </body>
    </html>
  );
}
