"use client";

import { useState } from "react";
import { uploadBlogImage } from "@/lib/upload-blog-image";

export default function CoverImageInput({
  name,
  defaultValue,
  folderId,
}: {
  name: string;
  defaultValue?: string | null;
  folderId: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadBlogImage(file, folderId);
      setUrl(uploaded);
    } catch (err) {
      alert(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {url && (
        <div className="relative w-full max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="커버 이미지 미리보기"
            className="rounded-md border w-full h-32 object-cover"
          />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-1 right-1 text-xs bg-bg/90 rounded px-2 py-0.5 border"
          >
            제거
          </button>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={uploading}
        className="text-sm"
      />
      {uploading && <p className="text-xs text-ink/50">업로드 중…</p>}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
