import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "blog";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (err, res) => {
            if (err) reject(err);
            else if (res) resolve({ secure_url: res.secure_url!, public_id: res.public_id });
            else reject(new Error("No result"));
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (e) {
    console.error("Cloudinary upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
