import { redirect } from "next/navigation";

/** Short link: /vivaan → canonical public profile URL. */
export default function VivaanShortLinkPage() {
  redirect("/profile/vivaan");
}
