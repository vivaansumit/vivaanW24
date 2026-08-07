"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

/**
 * Premium motion primitives — tasteful, fast, elegant.
 *
 * - Always respects `prefers-reduced-motion`
 * - Short durations (0.35–0.7s) with smooth cubic-bezier easing
 * - Used across homepage, profile, admin, and modals
 */

interface MotionContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const heroVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/** Container that fades-in its children with a slight upward motion. */
export function FadeIn({ children, className, style, delay = 0 }: MotionContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** Stagger grid — wrap your cards in this, and use `FadeItem` for each card. */
export function StaggerGrid({ children, className }: MotionContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** A single item inside a StaggerGrid. */
export function FadeItem({ children, className, style }: MotionContainerProps) {
  return (
    <motion.div variants={itemVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}

/** Hero-style entrance — bigger, slower, more deliberate. */
export function HeroEntrance({ children, className }: MotionContainerProps) {
  return (
    <motion.div
      variants={heroVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Section entrance — subtle fade-up for page sections. */
export function SectionEntrance({ children, className, delay = 0.1 }: MotionContainerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
