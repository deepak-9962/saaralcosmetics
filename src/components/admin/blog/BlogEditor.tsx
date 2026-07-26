"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";
import ImageModal from "./ImageModal";
import LinkModal from "./LinkModal";

interface BlogEditorProps {
  content?: any;
  onChange: (contentJson: any) => void;
}

export default function BlogEditor({ content, onChange }: BlogEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      UnderlineExtension,
      ImageExtension.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded-xl border border-outline-variant/30 my-4 max-w-full h-auto mx-auto shadow-sm",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary font-medium underline hover:text-primary-hover transition-colors cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[350px] p-4 font-body text-[15px] leading-[1.7] text-on-surface",
      },
    },
  });

  // Sync content when external content changes (e.g. edit mode loaded)
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!isMounted || !editor) {
    return (
      <div className="border border-outline-variant/60 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-surface min-h-[350px]">
        <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
          progress_activity
        </span>
        <p className="text-[14px] text-on-surface-variant font-medium">
          Loading Rich Text Editor...
        </p>
      </div>
    );
  }

  const isLinkActive = editor.isActive("link");
  const currentLinkUrl = editor.getAttributes("link").href || "";
  const { from, to } = editor.state.selection;
  const hasSelection = from !== to;

  const handleApplyLink = (url: string, linkText?: string) => {
    if (!url) return;

    if (!hasSelection && linkText) {
      editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleInsertImage = (url: string, alt?: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: alt || "Blog image" }).run();
    }
  };

  return (
    <div className="border border-outline-variant/60 rounded-xl overflow-hidden bg-surface shadow-sm focus-within:border-primary transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-surface-container border-b border-outline-variant/30 text-on-surface">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-[18px] transition-colors ${
            editor.isActive("bold")
              ? "bg-primary text-on-primary font-bold shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Bold"
        >
          <span className="material-symbols-outlined text-[18px]">format_bold</span>
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-[18px] transition-colors ${
            editor.isActive("italic")
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Italic"
        >
          <span className="material-symbols-outlined text-[18px]">format_italic</span>
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg text-[18px] transition-colors ${
            editor.isActive("underline")
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Underline"
        >
          <span className="material-symbols-outlined text-[18px]">format_underlined</span>
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg text-[18px] transition-colors ${
            editor.isActive("strike")
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Strikethrough"
        >
          <span className="material-symbols-outlined text-[18px]">strikethrough_s</span>
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/40 mx-1" />

        {/* H2 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 py-1 rounded-lg text-[13px] font-bold transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Heading 2"
        >
          H2
        </button>

        {/* H3 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2.5 py-1 rounded-lg text-[13px] font-bold transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Heading 3"
        >
          H3
        </button>

        {/* Paragraph */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2.5 py-1 rounded-lg text-[13px] font-medium transition-colors ${
            editor.isActive("paragraph")
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Paragraph"
        >
          P
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/40 mx-1" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg text-[18px] transition-colors ${
            editor.isActive("bulletList")
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Bullet List"
        >
          <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg text-[18px] transition-colors ${
            editor.isActive("orderedList")
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Numbered List"
        >
          <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg text-[18px] transition-colors ${
            editor.isActive("blockquote")
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title="Blockquote"
        >
          <span className="material-symbols-outlined text-[18px]">format_quote</span>
        </button>

        <div className="w-[1px] h-5 bg-outline-variant/40 mx-1" />

        {/* Image Insert Button */}
        <button
          type="button"
          onClick={() => setImageModalOpen(true)}
          className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          title="Insert Image"
        >
          <span className="material-symbols-outlined text-[18px]">image</span>
        </button>

        {/* Link Insert / Edit Button */}
        <button
          type="button"
          onClick={() => setLinkModalOpen(true)}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
            isLinkActive
              ? "bg-primary text-on-primary shadow-sm"
              : "hover:bg-surface-container-high text-on-surface-variant"
          }`}
          title={isLinkActive ? "Edit or Remove Link" : "Insert Link or Product Link"}
        >
          <span className="material-symbols-outlined text-[18px]">link</span>
          {isLinkActive && <span className="text-[11px] font-bold uppercase">Active</span>}
        </button>
      </div>

      {/* Editor Body */}
      <EditorContent editor={editor} />

      {/* Modals */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsertImage={handleInsertImage}
      />

      <LinkModal
        isOpen={linkModalOpen}
        initialUrl={currentLinkUrl}
        onClose={() => setLinkModalOpen(false)}
        onApplyLink={handleApplyLink}
        onUnlink={handleUnlink}
        hasSelection={hasSelection}
      />
    </div>
  );
}
