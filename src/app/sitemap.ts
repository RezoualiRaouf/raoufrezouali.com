import routesData from "@/data/routes.json";
import { getPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getPosts()).filter((post) => !post.draft);

  const pages = routesData.routes
    .filter((route) => route.path !== "/blog" || posts.length > 0)
    .map((route) => ({
      url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
      changeFrequency: "monthly" as const,
      priority: route.path === "/" ? 1 : 0.7,
    }));

  const postPages = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...pages, ...postPages];
}
