import type { CollectionEntry } from "astro:content";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_COVER } from "./constants";
import { normalizeTag } from "./slug.js";

export { normalizeTag };

export type Post = CollectionEntry<"posts">;

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export function getPostTags(post: Post): string[] {
  return [...new Set(post.data.tags.map(normalizeTag).filter(Boolean))];
}

export function getAllTags(posts: Post[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of getPostTags(post)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return new Map([...counts].sort(([a], [b]) => a.localeCompare(b, "en")));
}

export function postUrl(post: Post): string {
  const path = post.id.split("/").map(encodeURIComponent).join("/");
  return `/posts/${path}/`;
}

export function tagUrl(tag: string): string {
  return `/tags/${encodeURIComponent(normalizeTag(tag))}/`;
}

export function getCoverUrl(coverImage?: string): string {
  if (!coverImage) return DEFAULT_COVER;

  try {
    const url = new URL(coverImage);
    if (url.protocol === "http:" || url.protocol === "https:")
      return url.toString();
    return DEFAULT_COVER;
  } catch {
    // Local public assets are URL paths, not absolute URLs.
  }

  const publicPath = `/${coverImage.replace(/^\/+/, "")}`;
  const diskPath = resolve("public", `.${publicPath}`);
  const publicRoot = `${resolve("public")}/`;

  return diskPath.startsWith(publicRoot) && existsSync(diskPath)
    ? publicPath
    : DEFAULT_COVER;
}

export function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCompactDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replaceAll("/", "-");
}
