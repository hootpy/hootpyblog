import slugify from "slugify";

const options = {
  lower: true,
  strict: true,
  trim: true,
  locale: "vi",
};

export function normalizeSlug(input) {
  return slugify(input.trim(), options);
}

export const normalizeTag = normalizeSlug;
