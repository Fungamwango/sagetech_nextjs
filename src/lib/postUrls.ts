function pickPostHeadline(post: {
  slug?: string | null;
  blogTitle?: string | null;
  productName?: string | null;
  singer?: string | null;
  filename?: string | null;
  bookTitle?: string | null;
  generalPost?: string | null;
  postDescription?: string | null;
  advertTitle?: string | null;
  linkTitle?: string | null;
}) {
  return (
    post.blogTitle ||
    post.productName ||
    post.filename ||
    post.singer ||
    post.bookTitle ||
    post.advertTitle ||
    post.linkTitle ||
    post.generalPost ||
    post.postDescription ||
    "post"
  );
}

export function slugifyPostText(value: string) {
  return value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

export function getPostSlug(post: Parameters<typeof pickPostHeadline>[0]) {
  if (post.slug?.trim()) return post.slug.trim();
  return slugifyPostText(pickPostHeadline(post));
}

export function getPostPath(post: { id: string } & Parameters<typeof pickPostHeadline>[0]) {
  return `/posts/${getPostSlug(post)}/${post.id}`;
}
