import Script from "next/script";
import { createAdminClient } from "@/lib/supabase/admin";
import type { IntegrationsSettings } from "@/lib/validators/settings";

async function getIntegrations(): Promise<IntegrationsSettings | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "integrations")
      .maybeSingle();
    return (data?.value as IntegrationsSettings) ?? null;
  } catch {
    return null;
  }
}

/**
 * Injects analytics & tracking scripts based on saved integrations settings.
 * Mount once per locale in [locale]/layout.tsx (after <body>).
 *
 * Skipped entirely in development to avoid noise in real analytics.
 */
export async function SiteAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;
  const i = await getIntegrations();
  if (!i) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {i.gtm_id && (
        <>
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${i.gtm_id}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${i.gtm_id}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (only if no GTM, to avoid double-tracking) */}
      {i.ga4_measurement_id && !i.gtm_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${i.ga4_measurement_id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${i.ga4_measurement_id}');`}
          </Script>
        </>
      )}

      {/* Google Ads */}
      {i.google_ads_id && !i.gtm_id && (
        <Script id="google-ads" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('config', '${i.google_ads_id}');`}
        </Script>
      )}

      {/* Facebook Pixel */}
      {i.facebook_pixel_id && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${i.facebook_pixel_id}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {/* Microsoft Clarity */}
      {i.microsoft_clarity_id && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${i.microsoft_clarity_id}");`}
        </Script>
      )}

      {/* Hotjar */}
      {i.hotjar_id && (
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){
h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
h._hjSettings={hjid:${i.hotjar_id},hjsv:6};
a=o.getElementsByTagName('head')[0];
r=o.createElement('script');r.async=1;
r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      )}

      {/* TikTok Pixel */}
      {i.tiktok_pixel_id && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.load('${i.tiktok_pixel_id}');
ttq.page();
}(window, document, 'ttq');`}
        </Script>
      )}

      {/* Snap Pixel */}
      {i.snap_pixel_id && (
        <Script id="snap-pixel" strategy="afterInteractive">
          {`(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){
a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');
snaptr('init', '${i.snap_pixel_id}');
snaptr('track', 'PAGE_VIEW');`}
        </Script>
      )}

      {/* Tawk.to live chat */}
      {i.tawk_to_id && (
        <Script id="tawkto" strategy="afterInteractive">
          {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/${i.tawk_to_id}';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();`}
        </Script>
      )}

      {/* Crisp live chat */}
      {i.crisp_website_id && (
        <Script id="crisp" strategy="afterInteractive">
          {`window.$crisp=[];window.CRISP_WEBSITE_ID="${i.crisp_website_id}";
(function(){d=document;s=d.createElement("script");
s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}
        </Script>
      )}

      {/* Intercom live chat */}
      {i.intercom_app_id && (
        <Script id="intercom" strategy="afterInteractive">
          {`window.intercomSettings = { app_id: "${i.intercom_app_id}" };
(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${i.intercom_app_id}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`}
        </Script>
      )}
    </>
  );
}

/**
 * Returns the verification meta tags for search engines (Google, Bing).
 * Should be rendered in the <head>.
 */
export async function VerificationMetaTags() {
  const i = await getIntegrations();
  if (!i) return null;
  return (
    <>
      {i.google_site_verification && (
        <meta name="google-site-verification" content={i.google_site_verification} />
      )}
      {i.bing_site_verification && (
        <meta name="msvalidate.01" content={i.bing_site_verification} />
      )}
      {i.facebook_app_id && <meta property="fb:app_id" content={i.facebook_app_id} />}
    </>
  );
}
