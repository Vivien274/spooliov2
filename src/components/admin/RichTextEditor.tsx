"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  Sparkles,
  Code,
  Unlink,
  FileText,
  Clipboard,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  theme?: "dark" | "light";
}

export default function RichTextEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = "Rédigez votre article en toute liberté...",
  theme = "dark",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMarkdownModal, setShowMarkdownModal] = useState(false);
  const [markdownInput, setMarkdownInput] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#ff4f00] underline font-medium hover:text-[#e04500] transition-colors cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-2xl max-w-full h-auto my-6 border border-white/10 shadow-lg mx-auto block",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `prose ${
          theme === "dark" ? "prose-invert" : ""
        } max-w-none min-h-[350px] p-6 focus:outline-none leading-relaxed text-sm sm:text-base font-sans`,
      },
    },
  });

  // Keep editor content in sync if external value changes (e.g. initial load or reset)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const currentHTML = editor.getHTML();
      // Only update if significantly different to avoid cursor jumps
      if (content !== currentHTML) {
        editor.commands.setContent(content || "");
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="h-64 rounded-3xl bg-neutral-900/50 border border-white/10 flex items-center justify-center text-gray-500 animate-pulse text-xs font-bold">
        Chargement de l'éditeur WYSIWYG...
      </div>
    );
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Entrez l'URL du lien :", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    try {
      const url = await onImageUpload(file);
      if (url) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      }
    } catch (err) {
      console.error("Failed to upload image into editor:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertCallout = () => {
    const calloutHTML = `<div class="my-6 p-4 rounded-2xl bg-[#2F3CD9]/15 border border-[#2F3CD9]/30 text-blue-200 flex items-start gap-3">
      <span class="text-xl shrink-0">💡</span>
      <div><strong>Conseil Spoolio :</strong> Votre conseil ou astuce importante ici</div>
    </div><p></p>`;
    editor.chain().focus().insertContent(calloutHTML).run();
  };

  const insertQuote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  const btnCls = (isActive: boolean) =>
    `p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
      isActive
        ? "bg-[#ff4f00] text-white shadow-md scale-105"
        : theme === "dark"
        ? "text-gray-300 hover:bg-white/10 hover:text-white"
        : "text-gray-600 hover:bg-gray-200 hover:text-black"
    }`;

  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-3xl border ${
        isDark ? "bg-[#121319] border-white/10" : "bg-white border-gray-200"
      } shadow-xl overflow-hidden flex flex-col transition-all`}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Rich Text Toolbar */}
      <div
        className={`p-3 border-b ${
          isDark ? "bg-[#1a1c24] border-white/10" : "bg-gray-50 border-gray-200"
        } flex flex-wrap items-center gap-1 sm:gap-1.5 sticky top-0 z-20 backdrop-blur-md select-none`}
      >
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r pr-2 border-gray-700/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`${btnCls(false)} ${!editor.can().undo() ? "opacity-30 cursor-not-allowed" : ""}`}
            title="Annuler (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`${btnCls(false)} ${!editor.can().redo() ? "opacity-30 cursor-not-allowed" : ""}`}
            title="Rétablir (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r pr-2 border-gray-700/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={btnCls(editor.isActive("heading", { level: 2 }))}
            title="Grand Titre H2"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={btnCls(editor.isActive("heading", { level: 3 }))}
            title="Moyen Titre H3"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={btnCls(editor.isActive("heading", { level: 4 }))}
            title="Petit Titre H4"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 border-r pr-2 border-gray-700/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnCls(editor.isActive("bold"))}
            title="Gras (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnCls(editor.isActive("italic"))}
            title="Italique (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={btnCls(editor.isActive("underline"))}
            title="Souligné (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btnCls(editor.isActive("strike"))}
            title="Barré"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={btnCls(editor.isActive("code"))}
            title="Code en ligne"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r pr-2 border-gray-700/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnCls(editor.isActive("bulletList"))}
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnCls(editor.isActive("orderedList"))}
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r pr-2 border-gray-700/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={btnCls(editor.isActive({ textAlign: "left" }))}
            title="Aligner à gauche"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={btnCls(editor.isActive({ textAlign: "center" }))}
            title="Centrer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={btnCls(editor.isActive({ textAlign: "right" }))}
            title="Aligner à droite"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={btnCls(editor.isActive({ textAlign: "justify" }))}
            title="Justifier"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Special Inserts */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={addLink}
            className={btnCls(editor.isActive("link"))}
            title="Insérer / Modifier un lien web"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className={btnCls(false)}
              title="Supprimer le lien"
            >
              <Unlink className="w-4 h-4 text-red-400" />
            </button>
          )}

          {onImageUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={btnCls(false)}
              title="Insérer une image dans l'article"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          <button
            type="button"
            onClick={insertQuote}
            className={btnCls(editor.isActive("blockquote"))}
            title="Insérer une citation"
          >
            <Quote className="w-4 h-4 text-purple-400" />
          </button>

          <button
            type="button"
            onClick={insertCallout}
            className={btnCls(false)}
            title="Insérer un encadré Conseil Spoolio 💡"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={btnCls(false)}
            title="Insérer une ligne de séparation"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Gemini Markdown Importer Button */}
          <button
            type="button"
            onClick={() => setShowMarkdownModal(true)}
            className="ml-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Coller du texte généré par Gemini pour garder toute la mise en forme"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: "3s" }} />
            <span>Coller Gemini (Markdown)</span>
          </button>
        </div>
      </div>

      {/* Editor Content editable canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <EditorContent editor={editor} />
      </div>

      {/* Footer Word/Character Counter & Status Bar */}
      <div
        className={`px-6 py-2.5 border-t ${
          isDark ? "bg-[#161820] border-white/10 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-600"
        } text-xs font-semibold flex items-center justify-between select-none`}
      >
        <div className="flex items-center gap-4">
          <span>
            💬 {editor.state.doc.textContent ? editor.state.doc.textContent.split(/\s+/).filter(Boolean).length : 0} mots
          </span>
          <span>
            🔤 {editor.state.doc.textContent.length} caractères
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>WYSIWYG + Auto-Markdown Actif</span>
        </div>
      </div>

      {/* Modal for Pasting Gemini Markdown */}
      {showMarkdownModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#181a24] border border-purple-500/30 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="font-extrabold text-white text-base">
                  Importer du texte Gemini / AI (Markdown)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMarkdownModal(false)}
                className="text-gray-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Collez ci-dessous le texte brut généré par Gemini (avec les <code>## Titres</code>, <code>**Gras**</code>, <code>- Listes</code>). L'éditeur va instantanément tout convertir en HTML structuré !
            </p>

            <textarea
              rows={10}
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              placeholder="Collez ici votre réponse Gemini / ChatGPT..."
              className="w-full p-4 rounded-2xl bg-[#0e0f15] text-white text-xs font-mono border border-white/10 focus:outline-none focus:border-purple-500 shadow-inner"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMarkdownModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (markdownInput.trim()) {
                    editor.commands.setContent(markdownInput.trim());
                    setShowMarkdownModal(false);
                    setMarkdownInput("");
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>✨ Convertir & Importer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
