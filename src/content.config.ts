import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { researchTopicIds } from "./data/research-topics";

const httpsUrl = z.url().refine((value) => new URL(value).protocol === "https:", {
  message: "URL must use HTTPS",
});

const localAssetPath = z.string().refine(
  (value) => value.startsWith("/") && !value.startsWith("//") && !value.includes(".."),
  { message: "Photo must be a local path inside the public directory" },
);

const members = defineCollection({
  loader: file("src/data/members.json"),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    group: z.enum(["lead", "researchers", "members", "students", "alumni"]),
    photo: localAssetPath.nullable().optional(),
    linkedin: httpsUrl.refine((value) => {
      const url = new URL(value);
      return ["linkedin.com", "www.linkedin.com"].includes(url.hostname) && url.pathname.startsWith("/in/") && url.pathname.length > 4 && !url.username && !url.password;
    }, { message: "Use a personal LinkedIn URL: https://www.linkedin.com/in/your-profile/" }).nullable().optional(),
    email: z.email().nullable().optional(),
    status: z.enum(["founder", "new", "current", "former"]),
    order: z.number().int().nonnegative(),
  }),
});

const publications = defineCollection({
  loader: file("src/data/publications.json"),
  schema: z.object({
    year: z.number().int(),
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    paper: httpsUrl.nullable().optional(),
    code: httpsUrl.nullable().optional(),
    topics: z.array(z.enum(researchTopicIds)).min(1),
  }),
});

const projects = defineCollection({
  loader: file("src/data/projects.json"),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(["ongoing", "completed"]).optional(),
    year: z.number().int().optional(),
    tags: z.array(z.string()).default([]),
    team: z.array(z.string()).default([]),
    repo: httpsUrl.nullable().optional(),
    demo: httpsUrl.nullable().optional(),
    paper: httpsUrl.nullable().optional(),
    order: z.number().int().nonnegative(),
  }),
});

const openings = defineCollection({
  loader: file("src/data/openings.json"),
  schema: z.object({
    title: z.string(),
    kind: z.string(),
    text: z.string(),
    requirements: z.array(z.string()).default([]),
    order: z.number().int().nonnegative(),
  }),
});

const news = defineCollection({
  loader: file("src/data/news.json"),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
    text: z.string(),
    category: z.enum(["lab", "world"]).default("lab"),
    source: z.object({ name: z.string(), url: httpsUrl }).optional(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/blog" }),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
    excerpt: z.string(),
    cover: z.object({
      src: localAssetPath,
      srcSmall: localAssetPath.optional(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: z.string(),
      credit: z.string().optional(),
      creditUrl: httpsUrl.optional(),
      license: z.string().optional(),
      licenseUrl: httpsUrl.optional(),
    }).optional(),
  }),
});

export const collections = { members, publications, projects, openings, news, posts };
