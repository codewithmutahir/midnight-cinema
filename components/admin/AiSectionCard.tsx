"use client";

import { motion } from "framer-motion";

interface AiSectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isGenerating?: boolean;
}

export function AiSectionCard({ title, description, children, isGenerating }: AiSectionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">{title}</span>
        {isGenerating && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[var(--accent)]"
          >
            Generating…
          </motion.span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
      )}
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}
