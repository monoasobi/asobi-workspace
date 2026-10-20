"use client";

import { fontAtom } from "@atoms/font.atom";
import { useAtomValue } from "jotai";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import styles from "./NovelMarkdown.module.css";

// Preserve the original reading scale rather than the general UI title roles.
const heading = "[font-family:'Pretendard_JP_Variable'] font-bold not-italic";
const emphasis = "text-[var(--red-a11)] font-bold leading-[1.5]";

interface NovelMarkdownProps {
  children: string;
  className?: string;
}

export const NovelMarkdown = ({ children, className }: NovelMarkdownProps) => {
  const font = useAtomValue(fontAtom);

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          h1: ({ children }) => (
            <h1
              className={`${heading} my-[32px] text-[28px] leading-[36px] tracking-[-0.0075em]`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`${heading} my-[32px] text-center text-[24px] leading-[30px] tracking-[-0.00625em]`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`${heading} my-[8px] text-center text-[24px] leading-[30px] tracking-[-0.00625em]`}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h3
              className={`${heading} my-[32px] text-center text-[18px] leading-[24px] tracking-[-0.0025em]`}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`${styles.paragraph} leading-[1.5]`} data-font={font}>
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className={styles.quote}>{children}</blockquote>
          ),
          hr: (props) => <hr className={styles.hr} {...props} />,
          ul: (props) => <ul className={styles.ul} {...props} />,
          li: (props) => {
            const { children } = props;
            const text = children?.toString();
            const match = text?.match(/^(.+?)\s*(「.*」)$/);

            if (!match) {
              return (
                <li className={styles.li} data-font={font} {...props}>
                  {children}
                </li>
              );
            }

            const [, speaker, dialogue] = match;
            return (
              <li className={styles.li} data-font={font}>
                <span className={`${emphasis} mr-[8px]`}>{speaker}</span>
                <span className="leading-[1.5]">{dialogue}</span>
              </li>
            );
          },
          strong: ({ children }) => (
            <span className={emphasis}>{children}</span>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
