import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function fileToWebp(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("캔버스를 생성할 수 없습니다."));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) resolve(blob);
          else reject(new Error("이미지 변환에 실패했습니다."));
        },
        "image/webp",
        0.85,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러올 수 없습니다."));
    };
    img.src = objectUrl;
  });
}

export async function uploadBlogImage(file: File, folderId: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("이미지 용량은 5MB를 넘을 수 없습니다.");
  }

  const webpBlob = await fileToWebp(file);
  const path = `blog/${folderId}/${crypto.randomUUID()}.webp`;

  const supabase = createClient();
  const { error } = await supabase.storage.from("blog-images").upload(path, webpBlob, {
    contentType: "image/webp",
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}
