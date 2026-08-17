export type ContentType = "blog" | "social" | "email" | "code";

export const CONTENT_TYPES: Record<
  ContentType,
  { label: string; blurb: string; icon: string }
> = {
  blog: { label: "Blog", blurb: "SEO-ready long-form articles", icon: "FileText" },
  social: { label: "Social Post", blurb: "Platform-native posts & hooks", icon: "Share2" },
  email: { label: "Email", blurb: "Emails that get replies", icon: "Mail" },
  code: { label: "Code", blurb: "Generate, explain, debug, improve", icon: "Code2" },
};

export const isContentType = (v: string): v is ContentType => v in CONTENT_TYPES;

export const TONES = [
  "Professional",
  "Conversational",
  "Authoritative",
  "Friendly",
  "Bold",
  "Empathetic",
  "Witty",
  "Inspirational",
];

export const LANGUAGES = [
  "English",
  "Afrikaans",
  "isiZulu",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "Dutch",
];

export const PLATFORMS = ["LinkedIn", "Instagram", "TikTok", "Facebook", "X"];

export const EMAIL_TYPES = [
  "Professional",
  "Job application",
  "Internship request",
  "Follow-up",
  "Networking",
  "Client communication",
  "Marketing",
  "Thank-you",
  "Meeting request",
  "Custom",
];

export const CODE_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "React",
  "HTML",
  "CSS",
  "Python",
  "PHP",
  "Java",
  "SQL",
  "Node.js",
];

export const CODE_MODES = ["Generate Code", "Explain Code", "Debug Code", "Improve Code"] as const;

export const PROMPT_CATEGORIES = [
  "Blog",
  "Social Media",
  "Email",
  "Image",
  "Video",
  "Code",
  "Marketing",
  "Career",
  "Education",
  "General",
];

export const REFINE_ACTIONS = [
  { id: "improve", label: "Improve" },
  { id: "rewrite", label: "Rewrite" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
  { id: "simplify", label: "Simplify" },
  { id: "grammar", label: "Fix grammar" },
  { id: "engaging", label: "More engaging" },
  { id: "professional", label: "More professional" },
] as const;

export type RefineAction = (typeof REFINE_ACTIONS)[number]["id"] | "tone" | "translate";

export const PROJECT_STATUSES = ["draft", "in_progress", "completed", "archived"] as const;
export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
};
