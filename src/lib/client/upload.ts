"use client";

import {
  MAX_FILE_BYTES,
  MAX_IMAGE_BYTES,
  MAX_SHORT_VIDEO_SECONDS,
  MAX_VIDEO_BYTES,
  TARGET_VIDEO_BYTES,
  getUploadRuleMessage,
  isImageContentType,
  isVideoContentType,
} from "@/lib/uploadRules";

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image"));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

function loadVideoDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read video metadata."));
    };
    video.src = url;
  });
}

export async function compressImageToMaxSize(file: File, maxBytes = MAX_IMAGE_BYTES) {
  const image = await loadImage(file);
  let width = image.width;
  let height = image.height;
  const maxDimension = 1200;

  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.86;
  let output = await canvasToBlob(canvas, quality);

  while (output && output.size > maxBytes && quality > 0.35) {
    quality -= 0.08;
    output = await canvasToBlob(canvas, quality);
  }

  while (output && output.size > maxBytes && canvas.width > 280 && canvas.height > 280) {
    canvas.width = Math.round(canvas.width * 0.88);
    canvas.height = Math.round(canvas.height * 0.88);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    output = await canvasToBlob(canvas, quality);
  }

  if (!output) throw new Error("Image compression failed");
  if (output.size > maxBytes) throw new Error("Unable to compress the image below 60KB. Please choose a smaller image.");

  const nextName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([output], `${nextName}.jpg`, { type: "image/jpeg" });
}

export async function prepareUploadFile(file: File) {
  if (isImageContentType(file.type)) {
    return {
      file: await compressImageToMaxSize(file, MAX_IMAGE_BYTES),
      notice: getUploadRuleMessage(file.type),
    };
  }

  if (isVideoContentType(file.type)) {
    const duration = await loadVideoDuration(file);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Unable to verify video duration.");
    }
    if (duration > MAX_SHORT_VIDEO_SECONDS) {
      throw new Error(`Only short videos are allowed. Please keep videos ${MAX_SHORT_VIDEO_SECONDS} seconds or less.`);
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Videos must be 15MB or less.");
    }

    return {
      file,
      notice: file.size > TARGET_VIDEO_BYTES ? getUploadRuleMessage(file.type) : "",
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Apps, books, music, and other files must be 8MB or less.");
  }

  return {
    file,
    notice: getUploadRuleMessage(file.type),
  };
}
