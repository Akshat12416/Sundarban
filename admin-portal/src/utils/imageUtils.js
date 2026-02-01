// src/utils/imageUtils.js
export const getImageSrc = (base64) => {
  if (!base64) return null;

  // If already formatted, return as is
  if (base64.startsWith("data:image")) return base64;

  // Default to jpeg (safe for camera images)
  return `data:image/jpeg;base64,${base64}`;
};
