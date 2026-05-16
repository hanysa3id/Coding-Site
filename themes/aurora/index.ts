// Aurora theme entrypoint — dark/gradient/bento aesthetic.
// theme.css is imported once from app/[locale]/layout.tsx so it is in the
// initial CSS bundle; we re-export the public contract here.

import "./theme.css";

export { config } from "./config";
export { HomePage } from "./home-page";
export { SiteHeader } from "./site-header";
export { SiteFooter } from "./site-footer";
