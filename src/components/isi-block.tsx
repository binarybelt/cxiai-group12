"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface ISIBlockProps {
  content: React.ReactNode;
  expandable?: boolean;
}

export function ISIBlock({ content, expandable = false }: ISIBlockProps) {
  const contentId = useId();
  const headingId = useId();
  const [expanded, setExpanded] = useState(!expandable);

  const truncatedBody =
    expandable && typeof content === "string"
      ? `${content.slice(0, 260)}...`
      : null;

  return (
    <section className="rounded-[1.5rem] border border-amber-300/70 bg-amber-300/15 p-token-lg shadow-token-sm">
      <div
        className="border-l-4 border-amber-300 pl-token-md"
        role="region"
        aria-labelledby={headingId}
      >
        <p
          id={headingId}
          className="text-caption font-semibold uppercase tracking-[0.26em] text-gray-900"
        >
          Important Safety Information
        </p>
        <div id={contentId} className="mt-token-md text-body-sm text-gray-900">
          {expandable ? (
            <>
              {!expanded && truncatedBody}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {content}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            content
          )}
        </div>
        {expandable ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-controls={contentId}
            aria-expanded={expanded}
            className="mt-token-md inline-flex items-center rounded-token-full border border-gray-300 px-4 py-2 text-body-sm font-semibold text-gray-900 transition hover:border-gray-500"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default ISIBlock;
