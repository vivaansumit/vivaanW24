import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  serial,
} from "drizzle-orm/pg-core";

// IMPORTANT: id = serial (number) to match Supabase DB (id = 1)
// passwordHash maps to column password_hash

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  phoneVisibility: boolean("phone_visibility").default(false).notNull(),
  passwordHash: text("password_hash").notNull(),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").default("").notNull(),
  pageTitle: text("page_title").default("Vivaan | Official Creative Portfolio"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  location: text("location"),
  isVerified: boolean("is_verified").default(true).notNull(),
  isHireable: boolean("is_hireable").default(true).notNull(),
  websiteUrl: text("website_url"),

  themeConfig: json("theme_config").$type<{
    themePreset?: string;
    primaryColor?: string;
    fontFamily?: string;
    cardStyle?: string;
    bgPattern?: string;
    customCss?: string;
    activeTabs?: string[];
  }>(),

  homepageConfig: json("homepage_config").$type<{
    logoText?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroDescription?: string;
    heroPhotoUrl?: string;
    heroCoverUrl?: string;
    button1Text?: string;
    button1Link?: string;
    button2Text?: string;
    button2Link?: string;
    showFeatureCards?: boolean;
    footerText?: string;
  }>(),

  publishStatus: text("publish_status").default("published").notNull(),
  privacyPassword: text("privacy_password"),
  viewsCount: integer("views_count").default(0).notNull(),

  showEmail: boolean("show_email").default(false),
  showPhone: boolean("show_phone").default(false),
  isPublic: boolean("is_public").default(true),
  isEnabled: boolean("is_enabled").default(true),
  privacy: text("privacy").default("public"),
  slug: text("slug"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").default("image"),
  title: text("title"),
  caption: text("caption"),
  content: text("content"),
  imageUrl: text("image_url"),
  mediaUrls: json("media_urls").$type<string[]>().default([]),
  images: json("images").$type<string[]>().default([]),
  hashtags: json("hashtags").$type<string[]>().default([]),
  isPinned: boolean("is_pinned").default(false),
  privacy: text("privacy").default("public"),
  status: text("status").default("published"),
  likesCount: integer("likes_count").default(0),
  viewsCount: integer("views_count").default(0),
  displayOrder: integer("display_order").default(0),
  commentsEnabled: boolean("comments_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reels = pgTable("reels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  title: text("title"),
  caption: text("caption"),
  description: text("description"),
  soundTrack: text("sound_track"),
  duration: integer("duration").default(15),
  likesCount: integer("likes_count").default(0),
  viewsCount: integer("views_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  privacy: text("privacy").default("public"),
  status: text("status").default("published"),
  isEnabled: boolean("is_enabled").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  slug: text("slug"),
  summary: text("summary"),
  description: text("description"),
  content: text("content"),
  category: text("category"),
  clientName: text("client_name"),
  completionDate: text("completion_date"),
  liveUrl: text("live_url"),
  projectUrl: text("project_url"),
  githubUrl: text("github_url"),
  thumbnailUrl: text("thumbnail_url"),
  imageUrl: text("image_url"),
  galleryUrls: json("gallery_urls").$type<string[]>().default([]),
  images: json("images").$type<string[]>().default([]),
  tags: json("tags").$type<string[]>().default([]),
  isFeatured: boolean("is_featured").default(false),
  privacy: text("privacy").default("public"),
  status: text("status").default("published"),
  isEnabled: boolean("is_enabled").default(true),
  displayOrder: integer("display_order").default(0),
  viewsCount: integer("views_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform"),
  title: text("title"),
  url: text("url"),
  icon: text("icon").default("globe"),
  color: text("color"),
  label: text("label"),
  displayOrder: integer("display_order").default(0),
  isEnabled: boolean("is_enabled").default(true),
  clicksCount: integer("clicks_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name"),
  fileUrl: text("file_url"),
  fileType: text("file_type").default("image"),
  fileSize: text("file_size"),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id"),
  reelId: integer("reel_id"),
  authorName: text("author_name"),
  authorAvatar: text("author_avatar"),
  content: text("content"),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  senderName: text("sender_name"),
  senderEmail: text("sender_email"),
  subject: text("subject"),
  message: text("message"),
  budget: text("budget"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storyHighlights = pgTable("story_highlights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  coverUrl: text("cover_url"),
  items: json("items").$type<
    Array<{
      id?: string;
      title?: string;
      mediaUrl?: string;
      mediaType?: "image" | "video";
      caption?: string;
    }>
  >().default([]),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// aliases some code may import
export const videos = reels;
export const shorts = reels;
export const gallery = mediaAssets;
export const links = socialLinks;