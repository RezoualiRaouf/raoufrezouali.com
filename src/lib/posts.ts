export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  tags: string[];
  readingTime: string;
  draft: boolean;
  coAuthors?: string[];
  views?: number;
};

export type PostDetail = PostSummary & {
  content: string;
};

export async function getPosts(limit?: number): Promise<PostSummary[]> {
  return [];
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return null;
}