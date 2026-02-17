"use client";

import dynamic from "next/dynamic";
import { useMemo, useEffect, useRef } from "react";

// Quill CSS (Snow theme) – loaded only when editor mounts
import "react-quill-new/dist/quill.snow.css";
import "./quill-admin.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

/** Map Quill toolbar button classes/attributes to tooltip labels */
function addToolbarTooltips(container: HTMLElement) {
  const toolbar = container.querySelector(".ql-toolbar");
  if (!toolbar) return;
  toolbar.querySelectorAll<HTMLButtonElement>("button").forEach((btn) => {
    const cls = btn.className;
    if (cls.includes("ql-bold")) btn.title = "Bold";
    else if (cls.includes("ql-italic")) btn.title = "Italic";
    else if (cls.includes("ql-underline")) btn.title = "Underline";
    else if (cls.includes("ql-strike")) btn.title = "Strikethrough";
    else if (cls.includes("ql-list") && btn.getAttribute("value") === "ordered") btn.title = "Numbered list";
    else if (cls.includes("ql-list") && btn.getAttribute("value") === "bullet") btn.title = "Bullet list";
    else if (cls.includes("ql-indent") && btn.getAttribute("value") === "-1") btn.title = "Decrease indent";
    else if (cls.includes("ql-indent") && btn.getAttribute("value") === "+1") btn.title = "Increase indent";
    else if (cls.includes("ql-blockquote")) btn.title = "Blockquote";
    else if (cls.includes("ql-code-block")) btn.title = "Code block";
    else if (cls.includes("ql-link")) btn.title = "Insert link";
    else if (cls.includes("ql-clean")) btn.title = "Clear formatting";
  });
  toolbar.querySelectorAll<HTMLElement>(".ql-picker").forEach((picker) => {
    const label = picker.querySelector(".ql-picker-label");
    if (label && !picker.getAttribute("title")) {
      if (picker.classList.contains("ql-header")) picker.setAttribute("title", "Text style");
      else picker.setAttribute("title", "Format");
    }
  });
}

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "indent",
  "blockquote", "code-block",
  "link",
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your post content…",
  disabled = false,
  className = "",
}: RichTextEditorProps) {
  const modules = useMemo(() => QUILL_MODULES, []);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const id = setTimeout(() => addToolbarTooltips(el), 150);
    return () => clearTimeout(id);
  }, []);

  return (
    <div ref={containerRef} className={`quill-admin ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={QUILL_FORMATS}
        placeholder={placeholder}
        readOnly={disabled}
      />
    </div>
  );
}
