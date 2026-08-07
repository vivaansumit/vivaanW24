import { pgTable, text, timestamp, boolean, integer, json, uuid } from "drizzle-orm/pg-core";

// Creator / Admin Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  phoneVisibility: boolean("phone_visibility").default(false).notNull(),
  passwordHash: text("password_hash").notNull(),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull(), // e.g. "Creative Director & Visual Artist"
  pageTitle: text("page_title").default("Vivaan | Official Creative Portfolio"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  location: text("location"),
  isVerified: boolean("is_verified").default(true).notNull(),
  isHireable: boolean("is_hireable").default(true).notNull(),
  websiteUrl: text("website_url"),
  
  // Theme & Appearance Customization (JSON)
  themeConfig: json("theme_config").$type<{
    themePreset: string; // 'gold' | 'dark' | 'cyberpunk' | 'light' | 'minimal'
    primaryColor: string; // e.g. '#f59e0b'
    fontFamily: string;
    cardStyle: string;
    bgPattern: string;
    customCss?: string;
    activeTabs: string[];
  }>().default({
    themePreset: "gold",
    primaryColor: "#f59e0b",
    fontFamily: "inter",
    cardStyle: "glass",
    bgPattern: "dots",
    activeTabs: ["feed", "reels", "portfolio", "links", "about"]
  }).notNull(),

  // Homepage content (editable from Admin → Homepage)
  homepageConfig: json("homepage_config").$type<{
    logoText: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroPhotoUrl: string;
    heroCoverUrl: string;
    button1Text: string;
    button1Link: string;
    button2Text: string;
    button2Link: string;
    showFeatureCards: boolean;
    footerText: string;
  }>().default({
    logoText: "VIVAAN",
    heroTitle: "Creative Director & Visual Artist",
    heroSubtitle: "Crafting cinematic 3D motion, luxury brand experiences, and generative visual art.",
    heroDescription: "Welcome. This is the official homepage of Vivaan — a creative studio producing award-winning visual direction for global brands. Explore my portfolio for full case studies and reels.",
    heroPhotoUrl: "",
    heroCoverUrl: "",
    button1Text: "View Public Profile",
    button1Link: "/profile/vivaan",
    button2Text: "",
    button2Link: "",
    showFeatureCards: false,
    footerText: "© 2025 Vivaan. All rights reserved.",
  }).notNull(),

  // Profile Privacy & Status
  publishStatus: text("publish_status").default("published").notNull(), // 'published', 'draft', 'maintenance'
  privacyPassword: text("privacy_password"), // Optional password lock for profile
  viewsCount: integer("views_count").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Posts (Feed / Instagram style)
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").default("image").notNull(), // 'image', 'carousel', 'text'
  title: text("title"),
  caption: text("caption").notNull(),
  mediaUrls: json("media_urls").$type<string[]>().default([]).notNull(),
  hashtags: json("hashtags").$type<string[]>().default([]).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  privacy: text("privacy").default("public").notNull(), // 'public', 'draft', 'unlisted'
  likesCount: integer("likes_count").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  commentsEnabled: boolean("comments_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reels / Shorts (TikTok / IG Reels style vertical video)
export const reels = pgTable("reels", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  title: text("title").notNull(),
  caption: text("caption"),
  soundTrack: text("sound_track").default("Original Sound - Vivaan").notNull(),
  duration: integer("duration").default(15).notNull(), // in seconds
  likesCount: integer("likes_count").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  privacy: text("privacy").default("public").notNull(), // 'public', 'draft', 'unlisted'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Portfolio Projects (Behance / Dribbble style case studies)
export const portfolio = pgTable("portfolio", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  summary: text("summary").notNull(),
  content: text("content"), // Detailed case study text
  category: text("category").notNull(), // e.g. '3D Design', 'Motion Direction', 'Branding', 'Photography'
  clientName: text("client_name"),
  completionDate: text("completion_date"),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  galleryUrls: json("gallery_urls").$type<string[]>().default([]).notNull(),
  tags: json("tags").$type<string[]>().default([]).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  privacy: text("privacy").default("public").notNull(), // 'public', 'draft', 'unlisted'
  viewsCount: integer("views_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Social Links (Bio buttons)
export const socialLinks = pgTable("social_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  platform: text("platform").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon").default("globe").notNull(),
  color: text("color").default("#f59e0b").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  clicksCount: integer("clicks_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Media Assets / Cloud Gallery
export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").default("image").notNull(), // 'image', 'video'
  fileSize: text("file_size").default("1.2 MB").notNull(),
  tags: json("tags").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments on Posts or Reels
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  reelId: uuid("reel_id").references(() => reels.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inquiries / Hire Me Messages
export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  budget: text("budget"),
  status: text("status").default("new").notNull(), // 'new', 'read', 'replied', 'archived'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Story Highlights
export const storyHighlights = pgTable("story_highlights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  coverUrl: text("cover_url").notNull(),
  items: json("items").$type<Array<{
    id: string;
    title: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
  }>>().default([]).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
