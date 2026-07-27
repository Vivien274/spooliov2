"use client";

import { useEffect, useRef, useState } from "react";

interface WysiwygEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  theme?: "dark" | "light";
}

export function isMarkdownText(text: string): boolean {
  if (!text) return false;
  return (
    /^#{1,4}\s+/m.test(text) ||
    /\*\*.+?\*\*/.test(text) ||
    /__[^\s]+?__/.test(text) ||
    /^[-*•]\s+/m.test(text) ||
    /^\d+\.\s+/m.test(text)
  );
}

export function convertMarkdownToHtml(md: string): string {
  if (!md) return "";

  // Normalize lines
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Inline formatting: **bold**, *italic*
    let inline = rawLine
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>");

    const trimmedInline = inline.trim();

    // H3 / H4
    if (/^###+\s+/.test(trimmedInline)) {
      if (inList) { result.push("</ul>"); inList = false; }
      const content = trimmedInline.replace(/^###+\s+/, "");
      result.push(`<h3>${content}</h3>`);
      continue;
    }

    // H2 / H1
    if (/^#\s+|^##\s+/.test(trimmedInline)) {
      if (inList) { result.push("</ul>"); inList = false; }
      const content = trimmedInline.replace(/^#\s+|^##\s+/, "");
      result.push(`<h2>${content}</h2>`);
      continue;
    }

    // Unordered lists (- item, * item, • item)
    if (/^[-*•]\s+/.test(trimmedInline)) {
      if (!inList) {
        result.push("<ul class='list-disc pl-5 space-y-1'>");
        inList = true;
      }
      const content = trimmedInline.replace(/^[-*•]\s+/, "");
      result.push(`<li>${content}</li>`);
      continue;
    }

    // Ordered lists (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmedInline)) {
      if (inList) { result.push("</ul>"); inList = false; }
      const content = trimmedInline.replace(/^\d+\.\s+/, "");
      result.push(`<p>${content}</p>`);
      continue;
    }

    // Regular paragraph
    if (inList) { result.push("</ul>"); inList = false; }
    result.push(`<p>${inline}</p>`);
  }

  if (inList) {
    result.push("</ul>");
  }

  return result.join("");
}

export default function WysiwygEditor({
  value,
  onChange,
  placeholder = "Commencez à rédiger ici...",
  theme = "dark"
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync editor content with outer value on mount or change if value differs from DOM
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "<p><br></p>";
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Clean up empty tags to let placeholder show
      if (html === "<p><br></p>" || html === "<br>" || html === "") {
        onChange("");
      } else {
        onChange(html);
      }
    }
  };

  const execCmd = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleLink = () => {
    const url = prompt("Entrez l'URL du lien :");
    if (url) {
      execCmd("createLink", url);
    }
  };

  const handleImage = () => {
    const url = prompt("Entrez l'URL de l'image (ex: https://...) :");
    if (url) {
      execCmd("insertImage", url);
    }
  };

  const handleFormatMarkdown = () => {
    if (editorRef.current) {
      const currentText = editorRef.current.innerText || editorRef.current.textContent || "";
      if (currentText.trim()) {
        const formatted = convertMarkdownToHtml(currentText);
        editorRef.current.innerHTML = formatted;
        handleInput();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text/plain");
    if (pastedText && isMarkdownText(pastedText)) {
      e.preventDefault();
      const formattedHtml = convertMarkdownToHtml(pastedText);
      document.execCommand("insertHTML", false, formattedHtml);
      handleInput();
    }
  };

  // Styles dynamically adjusted to admin theme
  const containerBg = theme === "dark" ? "bg-[#0b0b0f] border-white/10" : "bg-gray-50 border-gray-200";
  const toolbarBg = theme === "dark" ? "bg-[#14141c] border-white/10" : "bg-gray-100 border-gray-200";
  const btnBg = theme === "dark" ? "hover:bg-white/5 text-gray-300 hover:text-white" : "hover:bg-gray-200 text-gray-700 hover:text-black";
  const editorText = theme === "dark" ? "text-white prose-invert" : "text-black prose-neutral";
  const inputBorder = isFocused ? "border-[#2F3CD9]/50" : theme === "dark" ? "border-white/10" : "border-gray-200";

  return (
    <div className={`flex flex-col rounded-2xl border ${inputBorder} overflow-hidden transition-all ${containerBg}`}>
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-1.5 p-2.5 border-b ${toolbarBg}`}>
        {/* Paragraph / Heading */}
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "p")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${btnBg}`}
          title="Texte Normal (P)"
        >
          P
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "h3")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${btnBg}`}
          title="Titre H3"
        >
          H3
        </button>

        {/* Separator */}
        <div className={`w-[1px] h-5 ${theme === "dark" ? "bg-white/10" : "bg-gray-300"}`} />

        {/* Inline styles */}
        <button
          type="button"
          onClick={() => execCmd("bold")}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${btnBg}`}
          title="Gras"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${btnBg}`}
          title="Italique"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m-4 0h4m-6 16h4" />
          </svg>
        </button>

        {/* Separator */}
        <div className={`w-[1px] h-5 ${theme === "dark" ? "bg-white/10" : "bg-gray-300"}`} />

        {/* List */}
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${btnBg}`}
          title="Liste à puces"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={handleLink}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${btnBg}`}
          title="Insérer un lien"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={handleImage}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${btnBg}`}
          title="Insérer une image"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Separator Line */}
        <button
          type="button"
          onClick={() => execCmd("insertHorizontalRule")}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${btnBg}`}
          title="Insérer une ligne de séparation"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12h16" />
          </svg>
        </button>

        {/* Separator */}
        <div className={`w-[1px] h-5 ${theme === "dark" ? "bg-white/10" : "bg-gray-300"}`} />

        {/* Format Gemini / Markdown */}
        <button
          type="button"
          onClick={handleFormatMarkdown}
          className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#2F3CD9]/20 hover:bg-[#2F3CD9]/40 text-[#2F3CD9] border border-[#2F3CD9]/30 transition-all cursor-pointer flex items-center gap-1"
          title="Convertir automatiquement le texte Gemini / Markdown en HTML propre"
        >
          <span>🪄 Formater Gemini / Markdown</span>
        </button>

        {/* Clear format */}
        <button
          type="button"
          onClick={() => execCmd("removeFormat")}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ml-auto ${btnBg}`}
          title="Effacer la mise en forme"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="relative min-h-[140px] p-4 flex flex-col">
        {/* Custom Placeholder */}
        {!value && (
          <div className="absolute inset-x-4 top-4 text-gray-400 text-sm pointer-events-none select-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full min-h-[140px] focus:outline-none text-sm leading-relaxed wysiwyg-editor-area ${editorText}`}
        />
      </div>
    </div>
  );
}
