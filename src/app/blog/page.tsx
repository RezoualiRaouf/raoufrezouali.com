import PostsSkeleton from "@/components/PostsSkeleton";
import PostsWithSearch from "@/components/PostsWithSearch";
import RevealText from "@/components/RevealText";
import { getPosts } from "@/lib/posts";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes and write-ups by Raouf Rezouali.",
};

export const revalidate = 600;

async function BlogPosts() {
  const posts = await getPosts();
  // Nothing written yet: say so instead of showing empty search controls.
  if (posts.length === 0) {
    return <p className="text-lg text-muted-foreground">No posts yet. Check back soon.</p>;
  }
  return <PostsWithSearch posts={posts} />;
}

export default function BlogPage() {
  return (
    <article className="flex flex-col gap-14 py-16 sm:py-24">
      <RevealText
        as="h1"
        trigger="load"
        text="All writing."
        accent={["writing."]}
        className="display text-[clamp(3rem,8vw,6rem)]"
      />

      <Suspense fallback={<PostsSkeleton rows={6} showControls />}>
        <BlogPosts />
      </Suspense>
    </article>
  );
}
