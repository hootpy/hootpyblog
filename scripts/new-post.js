#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import fs from "node:fs";
import { normalizeSlug, normalizeTag } from "../src/lib/slug.js";

const rl = createInterface({ input, output });

function normalizeTags(tags) {
  return [...new Set(tags.map(normalizeTag).filter(Boolean))];
}

function escapeYamlString(str) {
  return JSON.stringify(str);
}

async function main() {
  const title = (await rl.question("Title: ")).trim();
  if (!title.trim()) {
    throw new Error("Title is required.");
  }

  const suggestedSlug = normalizeSlug(title);
  const slugInput = await rl.question(`Slug (default: ${suggestedSlug}): `);
  const slug = slugInput.trim() ? normalizeSlug(slugInput) : suggestedSlug;
  if (!slug) {
    throw new Error("Slug cannot be empty.");
  }

  const description = (await rl.question("Description: ")).trim();
  if (!description.trim()) {
    throw new Error("Description is required.");
  }

  const dateInput = (await rl.question("Date (ISO, default: now): ")).trim();
  const tagsInput = await rl.question(
    "Tags (comma-separated, default: none): ",
  );
  const imageDir = path.join(process.cwd(), "public", "images", slug);
  const publicImageDir = `images/${slug}/`;
  const coverInput = await rl.question(
    `Cover image path (relative to public; folder: ${publicImageDir}; default: none): `,
  );

  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) {
    throw new Error(
      "Invalid date. Use ISO format (for example, 2022-05-25T09:01:57.213Z).",
    );
  }

  const tags = normalizeTags(tagsInput.split(","));
  const coverImage = coverInput.trim() || undefined;

  const mdPath = path.join(process.cwd(), "md", `${slug}.md`);
  if (fs.existsSync(mdPath)) {
    throw new Error(`Post with slug "${slug}" already exists.`);
  }

  const frontmatter = `---
title: ${escapeYamlString(title)}
description: ${escapeYamlString(description)}
${coverImage ? `coverImage: ${escapeYamlString(coverImage)}\n` : ""}date: "${date.toISOString()}"
tags: ${JSON.stringify(tags)}
---`;

  fs.mkdirSync(imageDir, { recursive: true });
  fs.writeFileSync(mdPath, frontmatter + "\n\n", "utf8");
  console.log(`Created post: ${mdPath}`);
  console.log(`Created image directory: ${imageDir}`);
}

try {
  await main();
} catch (error) {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  rl.close();
}
