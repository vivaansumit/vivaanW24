import {
  Grid,
  Play,
  Briefcase,
  Link as LinkIcon,
  Palette,
  Inbox,
} from "lucide-react";
import { StaggerGrid, FadeItem } from "./Motion";

/**
 * Optional "platform features" grid — off by default.
 * Only renders when `showFeatureCards` is enabled in the CMS.
 */
export function HomePageFeatureCards() {
  const cards = [
    {
      Icon: Grid,
      title: "Feed Posts",
      description: "Single photos and multi-image carousels with rich captions and hashtags.",
    },
    {
      Icon: Play,
      title: "Video Reels",
      description: "Short vertical motion clips with soundtracks and view counters.",
    },
    {
      Icon: Briefcase,
      title: "Portfolio Studies",
      description: "Client projects with galleries, categories, and live demo links.",
    },
    {
      Icon: LinkIcon,
      title: "Bio Links",
      description: "Customizable link buttons with order, colors, and click analytics.",
    },
    {
      Icon: Palette,
      title: "Theme Studio",
      description: "Black & Gold presets with customizable accent colors and card styles.",
    },
    {
      Icon: Inbox,
      title: "Inquiries Inbox",
      description: "Project proposals and hire requests land straight in your CMS.",
    },
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-[#C9A227] uppercase">
          Platform
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-[#f5f5f5]">
          Everything in the studio
        </h2>
      </div>

      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ Icon, title, description }) => (
          <FadeItem key={title}>
            <div className="card-lift bg-[#111111] border border-[#222222] rounded-2xl p-6 h-full">
              <Icon className="w-6 h-6 text-[#C9A227]/80 mb-4" />
              <h3 className="font-medium text-[#f5f5f5] mb-2 text-[15px] tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-[#a3a3a3] leading-relaxed">{description}</p>
            </div>
          </FadeItem>
        ))}
      </StaggerGrid>
    </div>
  );
}
