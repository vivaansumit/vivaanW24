import { db } from "./index";
import { users, posts, reels, portfolio, socialLinks, mediaAssets, comments, inquiries, storyHighlights } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const passwordHash = bcrypt.hashSync("Vivaan@Secure2026", 10);

    const existingUsers = await db.select().from(users).where(eq(users.handle, "vivaan"));
    if (existingUsers.length > 0) {
      // Ensure password hash is updated to Vivaan@Secure2026
      await db.update(users).set({ passwordHash }).where(eq(users.id, existingUsers[0].id));

      // One-time migration: strip placeholder/demo image URLs from homepageConfig
      // so the homepage falls back to the user's real avatar + cover.
      const PLACEHOLDER_IDS = [
        "photo-1534528741775-53994a69daeb",
        "photo-1618005182384-a83a8bd57fbe",
      ];
      const isPlaceholder = (u: string | undefined | null) =>
        !u ? true : PLACEHOLDER_IDS.some((id) => u.includes(id));
      const current = existingUsers[0].homepageConfig as any;
      const newPhoto = isPlaceholder(current?.heroPhotoUrl) ? "" : current?.heroPhotoUrl;
      const newCover = isPlaceholder(current?.heroCoverUrl) ? "" : current?.heroCoverUrl;
      if (newPhoto !== (current?.heroPhotoUrl ?? "") || newCover !== (current?.heroCoverUrl ?? "")) {
        await db
          .update(users)
          .set({
            homepageConfig: { ...(current || {}), heroPhotoUrl: newPhoto, heroCoverUrl: newCover },
          })
          .where(eq(users.id, existingUsers[0].id));
      }

      return existingUsers[0];
    }

    console.log("Seeding Vivaan creator portfolio data...");

    // Primary Creator: Vivaan
    const [vivaan] = await db.insert(users).values({
      email: "admin@vivaan.com",
      phone: "+1 (555) 848-2260",
      phoneVisibility: true,
      passwordHash,
      handle: "vivaan",
      name: "Vivaan",
      title: "Creative Director & Visual Artist",
      pageTitle: "Vivaan | Official Creative Director & Portfolio Platform",
      bio: "Welcome to my official portfolio platform. Crafting high-concept 3D motion design, luxury brand experiences, generative visual art, and interactive digital interfaces for global brands and creative studios.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
      location: "New York • Los Angeles • Global",
      isVerified: true,
      isHireable: true,
      websiteUrl: "https://vivaan.art",
      themeConfig: {
        themePreset: "gold",
        primaryColor: "#f59e0b",
        fontFamily: "inter",
        cardStyle: "glass",
        bgPattern: "dots",
        activeTabs: ["feed", "reels", "portfolio", "links", "about"]
      },
      publishStatus: "published",
      viewsCount: 18950,
    }).returning();

    // Story Highlights for Vivaan
    await db.insert(storyHighlights).values([
      {
        userId: vivaan.id,
        title: "About Vivaan",
        coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        displayOrder: 1,
        items: [
          {
            id: "1",
            title: "Creative Studio",
            mediaUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
            mediaType: "image",
            caption: "Inside Vivaan's 3D render suite & sound studio ✨"
          },
          {
            id: "2",
            title: "Tools & Stack",
            mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
            mediaType: "image",
            caption: "Cinema 4D, Octane, Unreal Engine 5, Houdini & Next.js."
          }
        ]
      },
      {
        userId: vivaan.id,
        title: "Gold Series",
        coverUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80",
        displayOrder: 2,
        items: [
          {
            id: "3",
            title: "Aura Gold Fluid Motion",
            mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            mediaType: "image",
            caption: "Abstract liquid gold shader dynamics."
          }
        ]
      },
      {
        userId: vivaan.id,
        title: "Client Praise",
        coverUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80",
        displayOrder: 3,
        items: [
          {
            id: "4",
            title: "Testimonials",
            mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
            mediaType: "image",
            caption: "'Vivaan transformed our product launch into an award-winning visual masterpiece.' - VP Creative"
          }
        ]
      }
    ]);

    // Feed Posts for Vivaan
    const [post1] = await db.insert(posts).values([
      {
        userId: vivaan.id,
        type: "carousel",
        title: "Aura Noir 2025 - Gold Glass & Volumetric Light",
        caption: "Exploring procedural metallic shaders, liquid gold physics, and soft caustics inside Cinema 4D & Octane. Which render frame stands out to you?",
        mediaUrls: [
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=1200&q=80"
        ],
        hashtags: ["3d", "vivaan", "gold", "motiongraphics", "octanerender", "visualart"],
        isPinned: true,
        privacy: "public",
        likesCount: 2840,
        viewsCount: 14200,
        commentsEnabled: true
      },
      {
        userId: vivaan.id,
        type: "image",
        title: "Studio Workspace & Gold Key Lighting",
        caption: "Upgraded the main editing suite with warm ambient gold lights and dual OLED reference monitors. Ready for the next wave of brand keynotes!",
        mediaUrls: [
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80"
        ],
        hashtags: ["studiovibes", "vivaan", "creativeworkspace", "3dartist"],
        isPinned: false,
        privacy: "public",
        likesCount: 1420,
        viewsCount: 6800,
        commentsEnabled: true
      },
      {
        userId: vivaan.id,
        type: "image",
        title: "Metallic Liquid Sculpture Study",
        caption: "High-density fluid particle simulation rendered in 8K resolution. Turning static product ideas into living motion art.",
        mediaUrls: [
          "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80"
        ],
        hashtags: ["abstractart", "vivaanart", "render", "3d motion"],
        isPinned: false,
        privacy: "public",
        likesCount: 980,
        viewsCount: 4200,
        commentsEnabled: true
      }
    ]).returning();

    // Comments
    await db.insert(comments).values([
      {
        postId: post1.id,
        authorName: "Sarah Connor",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        content: "Vivaan, this gold shader refraction is beyond stunning! Phenomenal work.",
        isApproved: true
      },
      {
        postId: post1.id,
        authorName: "David K.",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "Clean, elegant, and super premium as always!",
        isApproved: true
      }
    ]);

    // Reels / Shorts
    await db.insert(reels).values([
      {
        userId: vivaan.id,
        title: "Gold Silk Cloth Simulation in 15 seconds",
        caption: "A quick breakdown on setting up Satin Gold fabric friction and specular maps in C4D.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        soundTrack: "Original Sound - Vivaan Gold Beats",
        duration: 15,
        likesCount: 4890,
        viewsCount: 24100,
        isPinned: true,
        privacy: "public"
      },
      {
        userId: vivaan.id,
        title: "Unreal Engine 5 Real-Time Hologram UI",
        caption: "Designing gold-infused HUD shaders for next-gen interactive stage loops.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        soundTrack: "Cyber Gold Soundscape - Vivaan",
        duration: 28,
        likesCount: 3120,
        viewsCount: 16800,
        isPinned: false,
        privacy: "public"
      }
    ]);

    // Portfolio
    await db.insert(portfolio).values([
      {
        userId: vivaan.id,
        title: "Chronos Lux - Gold Edition Watch Teaser",
        slug: "chronos-lux-gold-watch",
        category: "3D Motion & Commercial",
        clientName: "Chronos Luxury",
        completionDate: "Q4 2024",
        summary: "A high-octane 3D product launch commercial teaser video and WebGL interactive showcase for a luxury timepiece.",
        content: "Designed and animated the hero reveal video for Chronos Lux. Focused on metallic precision, gold brushed titanium texture maps, and cinema-grade lighting setup.",
        liveUrl: "https://chronoslux.example.com",
        githubUrl: "https://github.com/vivaan/chronos-lux-3d",
        thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80"
        ],
        tags: ["3D Motion", "Product Design", "Octane Render", "Luxury Branding"],
        isFeatured: true,
        privacy: "public"
      },
      {
        userId: vivaan.id,
        title: "Aura Summit Stage Visuals",
        slug: "aura-summit-stage-graphics",
        category: "Live VJ & Visual Direction",
        clientName: "Aura Global Summit",
        completionDate: "Summer 2024",
        summary: "LED screen stage loop graphics, gold audio-reactive animations, and visual direction for a 25,000 attendee conference.",
        content: "Built audio-reactive loops in TouchDesigner and Unreal Engine 5. Rendered 8K ultra-wide displays for main stage backdrop.",
        liveUrl: "https://aurasummit.example.com",
        thumbnailUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80"
        ],
        tags: ["Stage Graphics", "Unreal Engine 5", "Branding"],
        isFeatured: true,
        privacy: "public"
      },
      {
        userId: vivaan.id,
        title: "Vivaan Gold Design System & Canvas UI",
        slug: "vivaan-gold-design-system",
        category: "UI/UX & Creative Tech",
        clientName: "Vivaan Studios",
        completionDate: "January 2025",
        summary: "Interactive WebGL canvas UI with real-time shader generation, gold-glassmorphism dashboard, and instant export.",
        content: "Designed dark obsidian and brushed gold design tokens, custom iconography, and responsive layouts.",
        liveUrl: "https://vivaan.art",
        githubUrl: "https://github.com/vivaan/vivaan-design-system",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
        ],
        tags: ["Next.js", "Tailwind CSS", "UI/UX", "WebGL"],
        isFeatured: false,
        privacy: "public"
      }
    ]);

    // Social Links
    await db.insert(socialLinks).values([
      {
        userId: vivaan.id,
        platform: "youtube",
        title: "YouTube - 3D Masterclasses & Vlogs",
        url: "https://youtube.com/@vivaanart",
        icon: "youtube",
        color: "#d97706",
        displayOrder: 1,
        isEnabled: true,
        clicksCount: 2450
      },
      {
        userId: vivaan.id,
        platform: "instagram",
        title: "Instagram Art Feed (@vivaan)",
        url: "https://instagram.com/vivaan",
        icon: "instagram",
        color: "#e1306c",
        displayOrder: 2,
        isEnabled: true,
        clicksCount: 5120
      },
      {
        userId: vivaan.id,
        platform: "github",
        title: "GitHub - Creative Tech & WebGL Repos",
        url: "https://github.com/vivaan",
        icon: "github",
        color: "#333333",
        displayOrder: 3,
        isEnabled: true,
        clicksCount: 1280
      },
      {
        userId: vivaan.id,
        platform: "behance",
        title: "Behance Case Studies & Visual Works",
        url: "https://behance.net/vivaan",
        icon: "globe",
        color: "#1769ff",
        displayOrder: 4,
        isEnabled: true,
        clicksCount: 2190
      },
      {
        userId: vivaan.id,
        platform: "custom",
        title: "Book a Creative Direction Consultation",
        url: "https://cal.com/vivaan",
        icon: "calendar",
        color: "#f59e0b",
        displayOrder: 5,
        isEnabled: true,
        clicksCount: 890
      }
    ]);

    // Media Assets
    await db.insert(mediaAssets).values([
      {
        userId: vivaan.id,
        fileName: "Chronos_Gold_Watch_4K.jpg",
        fileUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
        fileType: "image",
        fileSize: "3.8 MB",
        tags: ["hero", "gold", "watch"]
      },
      {
        userId: vivaan.id,
        fileName: "Gold_Fluid_Abstract_01.png",
        fileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        fileType: "image",
        fileSize: "5.4 MB",
        tags: ["render", "3d", "liquid"]
      },
      {
        userId: vivaan.id,
        fileName: "Vivaan_Editing_Suite.jpg",
        fileUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
        fileType: "image",
        fileSize: "2.9 MB",
        tags: ["studio", "workspace"]
      }
    ]);

    // Inquiries
    await db.insert(inquiries).values([
      {
        userId: vivaan.id,
        senderName: "Elena Rostova",
        senderEmail: "elena@vertexmedia.com",
        subject: "3D Motion Lead for Luxury Brand Keynote",
        message: "Hi Vivaan! We loved your Chronos Lux watch commercial. We are looking for a creative director to lead a 45s product reveal animation and high-res promotional stills for our upcoming luxury wearable line. Budget is $12,000 - $18,000.",
        budget: "$12,000 - $18,000",
        status: "new"
      },
      {
        userId: vivaan.id,
        senderName: "Marcus Vance",
        senderEmail: "marcus@hypebrand.co",
        subject: "Keynote Stage Visual Loops & Graphics",
        message: "Hey Vivaan! Need 6 animated background loops for our annual summit in New York. Let us know if you have availability this month.",
        budget: "$5,000 - $8,000",
        status: "read"
      }
    ]);

    console.log("Vivaan creator data seeded successfully!");
    return vivaan;
  } catch (error) {
    console.error("Error seeding Vivaan database:", error);
  }
}
