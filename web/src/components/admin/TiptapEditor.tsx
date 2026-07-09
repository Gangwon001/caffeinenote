"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style";
import { marked } from "marked";
import { useRef, useState } from "react";
import { uploadBlogImage } from "@/lib/upload-blog-image";

const FONT_FAMILIES = [
  { label: "기본", value: "" },
  { label: "고딕체", value: "var(--font-sans)" },
  { label: "명조체", value: "var(--font-display)" },
  { label: "고정폭", value: "monospace" },
];

const FONT_SIZES = [
  { label: "기본", value: "" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "32px", value: "32px" },
];

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`px-2 py-1 rounded border text-sm disabled:opacity-50 ${
        active ? "bg-brand text-bg border-brand" : "hover:bg-brand-soft"
      }`}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({
  name,
  initialContent,
  folderId,
}: {
  name: string;
  initialContent?: JSONContent | null;
  folderId?: string;
}) {
  const [json, setJson] = useState<JSONContent>(initialContent ?? EMPTY_DOC);
  const [draftId] = useState(() => folderId ?? crypto.randomUUID());
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ controls: true, nocookie: true }),
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: initialContent ?? EMPTY_DOC,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setJson(editor.getJSON()),
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[300px] rounded-md border px-3 py-2 focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        const html = event.clipboardData?.getData("text/html");
        if (text && !html && /^(#{1,3}\s|[-*]\s|\d+\.\s|\*\*)/m.test(text)) {
          const parsedHtml = marked.parse(text, { async: false }) as string;
          editor?.commands.insertContent(parsedHtml);
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  async function handleImageButtonClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadBlogImage(file, draftId);
      editor!.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  function applyLink() {
    if (linkValue) {
      editor!.chain().focus().extendMarkRange("link").setLink({ href: linkValue }).run();
    } else {
      editor!.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkValue("");
  }

  function insertYoutube() {
    const url = prompt("유튜브 영상 URL을 입력하세요");
    if (url) editor!.chain().focus().setYoutubeVideo({ src: url }).run();
  }

  function toggleSourceMode() {
    if (!sourceMode) {
      setSourceValue(editor!.getHTML());
      setSourceMode(true);
    } else {
      editor!.commands.setContent(sourceValue);
      setJson(editor!.getJSON());
      setSourceMode(false);
    }
  }

  const currentFontFamily = editor.getAttributes("textStyle").fontFamily ?? "";
  const currentFontSize = editor.getAttributes("textStyle").fontSize ?? "";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5 sticky top-0 bg-bg z-10 py-1">
        <select
          title="글꼴"
          value={currentFontFamily}
          onChange={(e) => {
            const value = e.target.value;
            if (value) editor.chain().focus().setFontFamily(value).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
          className="rounded border px-1.5 py-1 text-sm bg-bg"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          title="글자 크기"
          value={currentFontSize}
          onChange={(e) => {
            const value = e.target.value;
            if (value) editor.chain().focus().setFontSize(value).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
          className="rounded border px-1.5 py-1 text-sm bg-bg"
        >
          {FONT_SIZES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <ToolbarButton
          title="굵게"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="기울임"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          title="밑줄"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </ToolbarButton>
        <ToolbarButton
          title="취소선"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </ToolbarButton>

        <ToolbarButton
          title="제목1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          title="제목2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="제목3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>

        <ToolbarButton
          title="글머리 목록"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          목록
        </ToolbarButton>
        <ToolbarButton
          title="번호 목록"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          번호
        </ToolbarButton>
        <ToolbarButton
          title="인용구"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          인용
        </ToolbarButton>
        <ToolbarButton title="구분선" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          ―
        </ToolbarButton>
        <ToolbarButton
          title="코드 블록"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"</>"}
        </ToolbarButton>

        <ToolbarButton
          title="왼쪽 정렬"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          좌
        </ToolbarButton>
        <ToolbarButton
          title="가운데 정렬"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          중
        </ToolbarButton>
        <ToolbarButton
          title="오른쪽 정렬"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          우
        </ToolbarButton>

        <ToolbarButton
          title="링크"
          active={editor.isActive("link")}
          onClick={() => {
            setLinkValue(editor.getAttributes("link").href ?? "");
            setShowLinkInput((v) => !v);
          }}
        >
          링크
        </ToolbarButton>
        <ToolbarButton title="이미지 삽입" disabled={uploading} onClick={handleImageButtonClick}>
          {uploading ? "업로드중…" : "이미지"}
        </ToolbarButton>
        <ToolbarButton
          title="표 삽입"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          표
        </ToolbarButton>
        <ToolbarButton title="유튜브 삽입" onClick={insertYoutube}>
          유튜브
        </ToolbarButton>
        <ToolbarButton title="HTML 소스 보기" active={sourceMode} onClick={toggleSourceMode}>
          HTML
        </ToolbarButton>
      </div>

      {showLinkInput && (
        <div className="flex gap-2 items-center bg-brand-soft/30 rounded-md p-2">
          <input
            type="text"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-md border border-ink/15 bg-bg px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-md bg-brand text-bg px-3 py-1 text-sm"
          >
            적용
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {sourceMode ? (
        <textarea
          value={sourceValue}
          onChange={(e) => setSourceValue(e.target.value)}
          className="min-h-[300px] rounded-md border px-3 py-2 font-mono text-sm"
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      <input type="hidden" name={name} value={JSON.stringify(json)} />
    </div>
  );
}
