"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export default function TiptapEditor({
  name,
  initialContent,
}: {
  name: string;
  initialContent?: JSONContent | null;
}) {
  const [json, setJson] = useState<JSONContent>(initialContent ?? EMPTY_DOC);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent ?? EMPTY_DOC,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setJson(editor.getJSON()),
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[300px] rounded-md border px-3 py-2 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded border ${editor.isActive("bold") ? "bg-brand text-bg" : ""}`}
        >
          굵게
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded border ${editor.isActive("italic") ? "bg-brand text-bg" : ""}`}
        >
          기울임
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded border ${editor.isActive("heading", { level: 2 }) ? "bg-brand text-bg" : ""}`}
        >
          제목
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded border ${editor.isActive("bulletList") ? "bg-brand text-bg" : ""}`}
        >
          목록
        </button>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={JSON.stringify(json)} />
    </div>
  );
}
