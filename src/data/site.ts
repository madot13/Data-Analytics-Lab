import { z } from "astro/zod";

// Add verified lab profiles here; leave the list empty until confirmed.
export const socialLinks = z.array(z.object({
  label: z.string().min(1),
  url: z.url().refine((value) => new URL(value).protocol === "https:", "Use HTTPS"),
  icon: z.enum(["github", "linkedin"]).optional(),
})).parse([
  { label: "GitHub", url: "https://github.com/SDU-Data-Analytics-Lab", icon: "github" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/data-analytics-lab-661a07437", icon: "linkedin" },
]);

export const lab = {
  name: "MADRID Lab",
  email: "datalab@sdu.edu.kz",
  description:
    "Machine learning, Analytics, Data Research & Intelligent Decisions. A university research lab working on methods that turn data into well-grounded decisions.",
  address: [
    "SDU University",
    "Abylai Khan Street 1/1",
    "Kaskelen, 040900",
    "Almaty Region, Kazakhstan",
  ],
} as const;

export const navigation = [
  { id: "home", label: "Home" },
  { id: "members", label: "Members" },
  { id: "research", label: "Research" },
  { id: "publications", label: "Publications" },
  { id: "projects", label: "Projects" },
  { id: "openings", label: "Openings" },
  { id: "blog", label: "Blog" },
  { id: "news", label: "News" },
] as const;
