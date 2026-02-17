/**
 * Cloudinary helpers: build optimized image URLs with transformations.
 * Use w_auto, q_auto, f_auto for responsive, quality, and format optimization.
 */
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: string; fetchFormat?: string } = {}
): string {
  if (!CLOUDINARY_CLOUD_NAME) return "";
  const { width, height, crop = "fill", quality = "auto", fetchFormat = "auto" } = options;
  const parts = ["w_auto", "q_auto", "f_auto"];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);
  const tr = parts.join(",");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${tr}/${publicId}`;
}

/** Featured image: 1200x630 for OG, or responsive for display. */
export function getFeaturedImageUrl(publicId: string, size: "og" | "card" | "wide" = "wide"): string {
  if (!CLOUDINARY_CLOUD_NAME) return "";
  const transforms =
    size === "og"
      ? "w_1200,h_630,c_fill,q_auto,f_auto"
      : size === "card"
        ? "w_400,h_250,c_fill,q_auto,f_auto"
        : "w_auto,h_400,c_fill,q_auto,f_auto";
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}
