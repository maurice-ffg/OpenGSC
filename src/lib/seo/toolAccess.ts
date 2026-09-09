export const SEO_TOOL_HREFS = [
  "/seo-tools/demand",
  "/seo-tools/competitors",
  "/seo-tools/cluster",
  "/seo-tools/geo",
  "/seo-tools/outline",
  "/seo-tools/landing",
  "/seo-tools/text",
  "/seo-tools/rewrite",
  "/seo-tools/humanize",
  "/seo-tools/analysis",
  "/seo-tools/googlebot",
  "/seo-tools/citations",
  "/seo-tools/links",
  "/seo-tools/policy",
  "/seo-tools/content-ops",
  "/seo-tools/history",
] as const;

export type SeoToolHref = typeof SEO_TOOL_HREFS[number];

export const TOP_NAV_ACCESS = [
  { href: "/striking", key: "menuStriking" },
  { href: "/cannibalization", key: "menuCannibalization" },
  { href: "/decay", key: "menuDecay" },
  { href: "/audits", key: "menuAudits" },
  { href: "/seo-tools", key: "seoNavTitle" },
  { href: "/indexer", key: "indexerNavTitle" },
  { href: "/crawler", key: "crawlerNavTitle" },
  { href: "/drops", key: "dropsNavTitle" },
  { href: "/digest", key: "digestNavTitle" },
] as const;

export const ALL_ROLE_TOOL_HREFS = [
  ...SEO_TOOL_HREFS,
  ...TOP_NAV_ACCESS.map(item => item.href),
] as const;
