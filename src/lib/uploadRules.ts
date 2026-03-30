export const MAX_IMAGE_BYTES = 60 * 1024;
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
export const TARGET_VIDEO_BYTES = 10 * 1024 * 1024;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_SHORT_VIDEO_SECONDS = 60;

export function isImageContentType(contentType: string) {
  return contentType.startsWith("image/");
}

export function isVideoContentType(contentType: string) {
  return contentType.startsWith("video/");
}

export function getMaxUploadBytes(contentType: string) {
  if (isImageContentType(contentType)) return MAX_IMAGE_BYTES;
  if (isVideoContentType(contentType)) return MAX_VIDEO_BYTES;
  return MAX_FILE_BYTES;
}

export function getUploadRuleMessage(contentType: string) {
  if (isImageContentType(contentType)) return "Images are compressed to a maximum of 60KB.";
  if (isVideoContentType(contentType)) {
    return `Only short videos are allowed. Videos must be ${MAX_SHORT_VIDEO_SECONDS} seconds or less and 15MB or less.`;
  }
  return "Apps, books, music, and other files must be 8MB or less.";
}
