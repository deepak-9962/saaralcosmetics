import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";

interface BlogContentRendererProps {
  content: any; // Tiptap JSON
}

export default function BlogContentRenderer({ content }: BlogContentRendererProps) {
  const htmlContent = useMemo(() => {
    if (!content) return "";

    // If string HTML is passed accidentally
    if (typeof content === "string") return content;

    try {
      return generateHTML(content, [
        StarterKit.configure({ heading: { levels: [2, 3] } }),
        UnderlineExtension,
        ImageExtension.configure({
          HTMLAttributes: {
            class: "rounded-2xl border border-gold/15 my-6 max-w-full h-auto mx-auto shadow-md block",
          },
        }),
        LinkExtension.configure({
          HTMLAttributes: {
            class:
              "text-primary font-semibold underline underline-offset-4 decoration-gold/40 hover:text-secondary hover:decoration-secondary transition-colors",
          },
        }),
      ]);
    } catch (err) {
      console.error("Failed to render Tiptap JSON to HTML:", err);
      return "";
    }
  }, [content]);

  return (
    <div
      className="prose max-w-none font-body text-[16px] md:text-[17px] leading-[1.8] text-on-surface 
                 prose-headings:font-display prose-headings:text-primary prose-headings:font-bold
                 prose-h2:text-[24px] prose-h2:md:text-[30px] prose-h2:mt-8 prose-h2:mb-4
                 prose-h3:text-[20px] prose-h3:md:text-[24px] prose-h3:mt-6 prose-h3:mb-3
                 prose-p:mb-5 prose-p:text-on-surface/90
                 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-5 prose-ul:space-y-2
                 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-5 prose-ol:space-y-2
                 prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:pl-5 prose-blockquote:py-1 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-primary/90 prose-blockquote:bg-gold/5 prose-blockquote:rounded-r-xl"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
