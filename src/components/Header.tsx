import NavBar, { type NavLink } from "./NavBar";

import routesData from "@/data/routes.json";
import { getPosts } from "@/lib/posts";

export default async function Header() {
  // The blog link stays hidden until at least one post is published.
  const hasPosts = (await getPosts()).some((post) => !post.draft);

  // Two sections of the home page, then the pages from routes.json.
  // Contact has its own button in the bar, so it is not repeated here.
  const links: NavLink[] = [
    { name: "About", href: "/#about" },
    { name: "Experience", href: "/#experience" },
    ...routesData.routes
      .filter((route) => route.showInNav && route.path !== "/" && route.path !== "/contact")
      .filter((route) => route.path !== "/blog" || hasPosts)
      .map((route) => ({
        name: route.name.charAt(0).toUpperCase() + route.name.slice(1),
        href: route.path,
        title: route.description,
      })),
  ];

  return <NavBar links={links} />;
}
