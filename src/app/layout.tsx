import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vivaan | Official Creative Director & Portfolio Platform",
  description:
    "The official portfolio of Vivaan — 3D motion design, luxury brand experiences, generative visual art, and interactive digital interfaces.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-[#f5f5f5] antialiased">{children}</body>
    </html>
  );
}
