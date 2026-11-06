import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/terms", "/privacy", "/login", "/register"],
      disallow: [
        "/dashboard/",
        "/transaction/",
        "/wallet/",
        "/profile/",
        "/disputes/",
        "/admin/",
        "/api/",
      ],
    },
    sitemap: "https://peltapay.com/sitemap.xml",
  };
}

