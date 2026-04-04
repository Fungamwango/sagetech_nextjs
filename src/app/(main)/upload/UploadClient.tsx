"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { prepareUploadFile } from "@/lib/client/upload";
import { getUploadRuleMessage, isImageContentType, isVideoContentType } from "@/lib/uploadRules";
import { useBackClosable } from "@/hooks/useBackClosable";

interface UploadUser {
  id: string;
  username: string;
  points?: string | number | null;
}

type UploadType = "general" | "song" | "video" | "document" | "product" | "advert";
type UploadItemStatus = "queued" | "preparing" | "uploading" | "done" | "error";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string | null;
  progress: number;
  status: UploadItemStatus;
  notice: string;
  error: string;
  uploadedUrl?: string;
  key?: string;
  resourceType?: string;
};

type UploadJob = {
  id: string;
  title: string;
  progress: number;
  status: "uploading" | "done" | "error";
  detail: string;
};

const POST_TYPES: Array<{ type: UploadType; label: string; icon: string; cost: number; description: string }> = [
  { type: "general", label: "General Post", icon: "fas fa-pen", cost: 0, description: "Share text, multiple images, or one video" },
  { type: "song", label: "Song / Music", icon: "fas fa-music", cost: 80, description: "Upload your music with cover art" },
  { type: "video", label: "Video", icon: "fas fa-video", cost: 5, description: "Share a short video" },
  { type: "document", label: "Document", icon: "fas fa-file-alt", cost: 40, description: "Share PDFs, docs, ebooks, and other files" },
  { type: "product", label: "Product", icon: "fas fa-store", cost: 40, description: "Sell products with a clean card preview" },
  { type: "advert", label: "Advertisement", icon: "fas fa-ad", cost: 100, description: "Run an advert with image or video media" },
];

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Phones & Tablets",
  "Computers",
  "Fashion",
  "Shoes",
  "Beauty",
  "Health",
  "Home & Kitchen",
  "Furniture",
  "Groceries",
  "Baby Products",
  "Books & Stationery",
  "Sports & Outdoors",
  "Automotive",
  "Tools & Hardware",
  "Agriculture",
  "Services",
  "Other",
] as const;

const FILE_INPUT_CLASS = "hidden";

function hasValue(value?: string) {
  return Boolean(value?.trim());
}

function validatePostDraft({
  postType,
  formData,
  uploadItems,
  coverFile,
}: {
  postType: UploadType;
  formData: Record<string, string>;
  uploadItems: UploadItem[];
  coverFile?: File | null;
}) {
  switch (postType) {
    case "general":
      if (!hasValue(formData.generalPost) && uploadItems.length === 0) {
        return "General posts must include text, image(s), or one video.";
      }
      return null;
    case "song":
      if (uploadItems.length === 0) return "Please choose an audio file before submitting this post.";
      if (!hasValue(formData.filename)) return "Please enter the song title.";
      if (!hasValue(formData.singer)) return "Please enter the artist / singer name.";
      if (!coverFile) return "Please choose cover art for this song.";
      if ((formData.postDescription ?? "").trim().length < 20) return "Description must be at least 20 characters.";
      return null;
    case "video":
      if (uploadItems.length === 0) return "Please choose a video before submitting this post.";
      if ((formData.postDescription ?? "").trim().length < 20) return "Description must be at least 20 characters.";
      return null;
    case "document":
      if (uploadItems.length === 0) return "Please choose a document before submitting this post.";
      if (!hasValue(formData.filename)) return "Please enter the document title.";
      return null;
    case "product":
      if (uploadItems.length === 0) return "Please choose at least one product image before submitting this post.";
      if (!hasValue(formData.productName)) return "Please enter the product name.";
      if (!hasValue(formData.productPrice)) return "Please enter the product price.";
      if (formData.syncToStock === "1") {
        if (!hasValue(formData.stockQuantity)) return "Please enter the stock quantity.";
        if (!hasValue(formData.stockCostPrice)) return "Please enter the stock cost price.";
      }
      return null;
    case "advert":
      if (!hasValue(formData.advertTitle)) return "Please enter the advert title.";
      if (!hasValue(formData.advertUrl)) return "Please enter the destination URL.";
      if (uploadItems.length === 0 && !hasValue(formData.postDescription)) return "Please add advert media or a short description.";
      return null;
    default:
      return null;
  }
}

export default function UploadClient({
  user,
  initialType,
  onSuccess,
}: {
  user: UploadUser;
  initialType?: string;
  onSuccess?: () => void;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const uploadItemsRef = useRef<UploadItem[]>([]);
  const coverPreviewRef = useRef<string | null>(null);

  const [selectedType, setSelectedType] = useState<UploadType | null>((initialType as UploadType) ?? null);
  const [formData, setFormData] = useState<Record<string, string>>({ privacy: "public" });
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [backgroundJobs, setBackgroundJobs] = useState<UploadJob[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [galleryPreviewOpen, setGalleryPreviewOpen] = useState(false);
  const closeGalleryPreview = useBackClosable(galleryPreviewOpen, () => setGalleryPreviewOpen(false));
  const userPoints = parseFloat(String(user.points ?? 0));

  useEffect(() => {
    uploadItemsRef.current = uploadItems;
  }, [uploadItems]);

  useEffect(() => {
    coverPreviewRef.current = coverPreviewUrl;
  }, [coverPreviewUrl]);

  useEffect(() => {
    if (uploadItems.length === 0 && galleryPreviewOpen) {
      setGalleryPreviewOpen(false);
    }
  }, [uploadItems.length, galleryPreviewOpen]);

  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(() => setError(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    return () => {
      uploadItemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current);
    };
  }, []);

  const currentTypeConfig = selectedType ? POST_TYPES.find((item) => item.type === selectedType) ?? null : null;
  const overallProgress = useMemo(() => {
    if (!uploadItems.length) return 0;
    return Math.round(uploadItems.reduce((sum, item) => sum + item.progress, 0) / uploadItems.length);
  }, [uploadItems]);
  const generalImageCount = useMemo(
    () => uploadItems.filter((item) => isImageContentType(item.file.type)).length,
    [uploadItems]
  );
  const generalVideoCount = useMemo(
    () => uploadItems.filter((item) => isVideoContentType(item.file.type)).length,
    [uploadItems]
  );

  const canUseMultipleImages = selectedType === "general" || selectedType === "product";

  const updateJob = (jobId: string, patch: Partial<UploadJob>) => {
    setBackgroundJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, ...patch } : job))
    );
  };

  const set = (key: string, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));

  const resetUploadSurface = () => {
    setFormData({ privacy: "public" });
    setSelectedType(null);
    setError("");
    setSuccess("");
    setSubmitting(false);
    setUploadItems((current) => {
      current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
    setCoverFile(null);
    setCoverPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  const applySelectedFiles = (nextFiles: FileList | null) => {
    if (!nextFiles || !selectedType) return;

    const incoming = Array.from(nextFiles);
    if (!incoming.length) return;

    let files = canUseMultipleImages ? incoming : [incoming[0]];

    if (selectedType === "general") {
      const incomingVideos = files.filter((file) => isVideoContentType(file.type));
      const incomingImages = files.filter((file) => isImageContentType(file.type));

      if (incomingVideos.length > 0) {
        files = [incomingVideos[0]];
        if (incomingVideos.length > 1 || incomingImages.length > 0 || files.length !== incoming.length) {
          showToast({
            type: "error",
            message: "General posts support multiple images or one video only.",
          });
        }
      } else {
        const existingHasVideo = uploadItemsRef.current.some((item) => isVideoContentType(item.file.type));
        if (existingHasVideo) {
          showToast({
            type: "error",
            message: "Remove the current video first, or upload images instead.",
          });
          return;
        }
      }
    } else if (selectedType === "product") {
        files = files.filter((file) => isImageContentType(file.type));
        if (!files.length) {
          showToast({ type: "error", message: "Product listings support images only." });
          return;
        }
      }

      const nextItems = files.map<UploadItem>((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: (isImageContentType(file.type) || isVideoContentType(file.type) || file.type.startsWith("audio/")) ? URL.createObjectURL(file) : null,
        progress: 0,
        status: "queued",
        notice: getUploadRuleMessage(file.type),
        error: "",
      }));

    setUploadItems((current) => {
      current.forEach((item) => {
        if (!canUseMultipleImages && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      if (selectedType === "general") {
        const hasVideo = nextItems.some((item) => isVideoContentType(item.file.type));
        if (hasVideo) {
          current.forEach((item) => {
            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
          });
          return nextItems;
        }
      }
      return canUseMultipleImages ? [...current, ...nextItems] : nextItems;
    });
    if (selectedType === "song" && !hasValue(formData.filename) && nextItems[0]) {
      const baseName = nextItems[0].file.name.replace(/\.[^.]+$/, "").trim();
      if (baseName) {
        set("filename", baseName);
      }
    }
    setError("");
  };

  const handleCoverChange = (nextFiles: FileList | null) => {
    const nextCover = nextFiles?.[0] ?? null;
    setCoverFile(nextCover);
    setCoverPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextCover && isImageContentType(nextCover.type) ? URL.createObjectURL(nextCover) : null;
    });
  };

  const removeUploadItem = (id: string) => {
    setUploadItems((current) =>
      current.filter((item) => {
        if (item.id === id && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        return item.id !== id;
      })
    );
  };

  const uploadWithProgress = async (
    item: UploadItem,
    onProgress: (progress: number) => void,
    onNotice: (notice: string) => void
  ) => {
    onProgress(3);
    const { file: preparedFile, notice } = await prepareUploadFile(item.file);
    if (notice) onNotice(notice);

    const payload = new FormData();
    payload.append("file", preparedFile);

    const resourceType = preparedFile.type.startsWith("video/")
      ? "video"
      : preparedFile.type.startsWith("audio/")
        ? "audio"
        : "image";

    return await new Promise<{ url: string; key: string; resourceType: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let settleTimer: ReturnType<typeof setInterval> | null = null;
      let settleProgress = 0;

      const stopSettling = () => {
        if (settleTimer) {
          clearInterval(settleTimer);
          settleTimer = null;
        }
      };

      const startSettling = (fromProgress: number) => {
        stopSettling();
        settleProgress = fromProgress;
        settleTimer = setInterval(() => {
          settleProgress = Math.min(97, settleProgress + 1);
          onProgress(settleProgress);
          if (settleProgress >= 97) {
            stopSettling();
          }
        }, 140);
      };

      xhr.open("POST", "/api/upload/file");

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const uploadProgress = Math.max(6, Math.min(92, Math.round((event.loaded / event.total) * 92)));
        onProgress(uploadProgress);
      };

      xhr.upload.onload = () => {
        onProgress(93);
        startSettling(93);
      };

      xhr.onerror = () => {
        stopSettling();
        reject(new Error("Upload failed. Please try again."));
      };
      xhr.onload = () => {
        stopSettling();
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            onProgress(100);
            const response = JSON.parse(xhr.responseText) as { fileUrl: string; key: string };
            resolve({ url: response.fileUrl, key: response.key, resourceType });
          } catch {
            reject(new Error("Upload completed but the server response was invalid."));
          }
          return;
        }

        try {
          const response = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(response.error ?? "Failed to upload file"));
        } catch {
          reject(new Error("Failed to upload file"));
        }
      };

      xhr.send(payload);
    });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedType || submitting) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    const validationError = validatePostDraft({ postType: selectedType, formData, uploadItems, coverFile });
    if (validationError) {
      setError(validationError);
      showToast({ type: "error", message: validationError });
      setSubmitting(false);
      return;
    }

    const cost = currentTypeConfig?.cost ?? 0;
    if (userPoints < cost) {
      const message = `Insufficient points. You need ${cost} pts to post this.`;
      setError(message);
      showToast({ type: "error", message });
      setSubmitting(false);
      return;
    }

    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setBackgroundJobs((current) => [
      {
        id: jobId,
        title: currentTypeConfig?.label ?? "Post upload",
        progress: 0,
        status: "uploading",
        detail: "Preparing files...",
      },
      ...current,
    ]);

    try {
      const uploadedResults: Array<{ url: string; key: string; resourceType: string }> = [];

      for (let index = 0; index < uploadItems.length; index += 1) {
        const currentItem = uploadItems[index];
        setUploadItems((current) =>
          current.map((item) =>
            item.id === currentItem.id ? { ...item, status: "preparing", progress: 2, error: "" } : item
          )
        );

        const uploaded = await uploadWithProgress(
          currentItem,
          (progress) => {
            setUploadItems((current) =>
              current.map((item) =>
                item.id === currentItem.id ? { ...item, status: "uploading", progress } : item
              )
            );
            const completed = uploadedResults.length;
            const total = uploadItems.length || 1;
            const weighted = Math.round(((completed + progress / 100) / total) * 100);
            updateJob(jobId, {
              progress: weighted,
              detail: `Uploading ${Math.min(index + 1, uploadItems.length)} of ${uploadItems.length} files...`,
            });
          },
          (notice) => {
            setUploadItems((current) =>
              current.map((item) =>
                item.id === currentItem.id ? { ...item, notice } : item
              )
            );
          }
        );

        uploadedResults.push(uploaded);
        setUploadItems((current) =>
          current.map((item) =>
            item.id === currentItem.id
              ? {
                  ...item,
                  status: "done",
                  progress: 100,
                  notice: "Upload complete",
                  uploadedUrl: uploaded.url,
                  key: uploaded.key,
                  resourceType: uploaded.resourceType,
                }
              : item
          )
        );
        updateJob(jobId, {
          progress: Math.round(((uploadedResults.length / Math.max(uploadItems.length, 1)) * 88)),
          detail:
            uploadedResults.length < uploadItems.length
              ? `Preparing ${Math.min(uploadedResults.length + 1, uploadItems.length)} of ${uploadItems.length} files...`
              : "Finalizing uploaded files...",
        });
      }

      let coverUrl: string | undefined;
      if (coverFile) {
        updateJob(jobId, { progress: Math.max(90, overallProgress), detail: "Uploading cover image..." });
        const uploadedCover = await uploadWithProgress(
          {
            id: "cover",
            file: coverFile,
            previewUrl: coverPreviewUrl,
            progress: 0,
            status: "queued",
            notice: "",
            error: "",
          },
          (progress) =>
            updateJob(jobId, {
              progress: Math.max(90, Math.min(96, progress)),
              detail: "Uploading cover image...",
            }),
          () => {}
        );
        coverUrl = uploadedCover.url;
      }

      updateJob(jobId, { progress: 98, detail: "Publishing post..." });

      const galleryUrls = uploadedResults
        .filter((item) => item.resourceType === "image")
        .map((item) => item.url);
      const firstUpload = uploadedResults[0];

      const body = {
        postType: selectedType,
        fileUrl: galleryUrls.length > 1 ? undefined : firstUpload?.url,
        galleryUrls: galleryUrls.length > 1 ? galleryUrls : undefined,
        storageKey: galleryUrls.length > 1 ? undefined : firstUpload?.key,
        fileResourceType: galleryUrls.length > 1 ? "image" : firstUpload?.resourceType ?? "none",
        ...(coverUrl ? { albumCover: coverUrl } : {}),
        ...formData,
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      let stockSyncMessage = "";
      if (selectedType === "product" && formData.syncToStock === "1") {
        const stockRes = await fetch("/api/business/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.productName ?? "",
            sku: formData.stockSku ?? "",
            category: formData.productType ?? "",
            supplier: formData.stockSupplier ?? "",
            unit: "item",
            stockQuantity: formData.stockQuantity ?? "0",
            lowStockThreshold: formData.stockLowStockThreshold ?? "5",
            costPrice: formData.stockCostPrice ?? "0",
            sellPrice: formData.productPrice ?? "0",
            notes: formData.postDescription ?? "",
          }),
        });

        if (stockRes.ok) {
          stockSyncMessage = " Added to Stock Manager too.";
        } else {
          const stockData = await stockRes.json().catch(() => ({}));
          showToast({
            type: "error",
            message: stockData.error ?? "Product posted, but Stock Manager sync failed.",
          });
        }
      }

      const message =
        galleryUrls.length > 1
          ? `Gallery uploaded. ${galleryUrls.length} images are being published now.`
          : selectedType === "song"
            ? "Song posted successfully."
            : selectedType === "video"
              ? "Video posted successfully."
              : selectedType === "product"
                ? `Product posted successfully.${stockSyncMessage}`
                : selectedType === "advert"
                  ? "Advert posted successfully."
            : "Post submitted! It will be reviewed and published shortly.";

      setSuccess(message);
      showToast({ type: "success", message });
      updateJob(jobId, {
        progress: 100,
        status: "done",
        detail: galleryUrls.length > 1 ? `${galleryUrls.length} images uploaded successfully.` : "Upload complete.",
      });

      window.dispatchEvent(new Event("post-created"));

      setTimeout(() => {
        resetUploadSurface();
        if (onSuccess) onSuccess();
        else router.refresh();
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
      showToast({ type: "error", message });
      updateJob(jobId, { status: "error", detail: message });
      setUploadItems((current) =>
        current.map((item) =>
          item.status === "preparing" || item.status === "uploading"
            ? { ...item, status: "error", error: message }
            : item
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Upload Content</h1>
          <p className="text-sm text-white/55 mt-1">
            Your points: <span className="font-bold text-cyan-400">{userPoints.toFixed(2)} pts</span>
          </p>
        </div>
        {backgroundJobs.length > 0 && (
          <div className="upload-summary-pill">
            <span className="upload-summary-pill__label">Background queue</span>
            <span className="upload-summary-pill__value">{backgroundJobs.length}</span>
          </div>
        )}
      </div>

      {backgroundJobs.length > 0 && (
        <div className="space-y-3">
          {backgroundJobs.slice(0, 3).map((job) => (
            <div key={job.id} className="upload-queue-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{job.title}</p>
                  <p className="text-xs text-white/50 mt-1">{job.detail}</p>
                </div>
                <span
                  className={`upload-status-pill ${
                    job.status === "done" ? "upload-status-pill--done" : job.status === "error" ? "upload-status-pill--error" : ""
                  }`}
                >
                  {job.status === "uploading" ? "Uploading" : job.status === "done" ? "Done" : "Error"}
                </span>
              </div>
              <div className="upload-progress-track mt-3">
                <div className="upload-progress-fill" style={{ width: `${job.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!selectedType ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {POST_TYPES.map((pt) => (
            <button
              key={pt.type}
              onClick={() => setSelectedType(pt.type)}
              className="upload-type-card text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="upload-type-card__icon">
                  <i className={pt.icon} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{pt.label}</p>
                  <p className="text-xs text-white/50 mt-1">{pt.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <span className={`text-xs font-semibold ${userPoints < pt.cost ? "text-red-400" : "text-cyan-400"}`}>
                  {pt.cost > 0 ? `-${pt.cost} pts` : "Free"}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="upload-shell">
          <button
            onClick={() => resetUploadSurface()}
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <i className="fas fa-arrow-left" /> Back
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className={`${currentTypeConfig?.icon} text-cyan-400`} />
                {currentTypeConfig?.label}
              </h2>
              {selectedType !== "general" ? (
                <p className="text-sm text-white/50 mt-1">{currentTypeConfig?.description}</p>
              ) : null}
            </div>
            {uploadItems.length > 0 && (
              <div className="upload-summary-pill">
                <span className="upload-summary-pill__label">Overall</span>
                <span className="upload-summary-pill__value">{overallProgress}%</span>
              </div>
            )}
          </div>

          {error && <div className="upload-alert upload-alert--error">{error}</div>}
          {success && <div className="upload-alert upload-alert--success">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5 mt-3">
            <div className="flex justify-start">
              <PrivacySelect formData={formData} set={set} compact />
            </div>

              {selectedType === "general" ? (
              <section className="upload-card space-y-4">
                <UploadFormFields
                  postType={selectedType}
                  formData={formData}
                  set={set}
                  embedded
                />

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{selectedType === "general" ? "Photos / Video" : "Media"}</p>
                  {selectedType !== "general" ? (
                    <p className="text-xs text-white/50 mt-1">Pick the main file for this post type.</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-action-chip"
                >
                  <i className="fas fa-folder-open" /> Choose files
                </button>
              </div>

              <label
                className={`upload-dropzone ${uploadItems.length > 0 ? "upload-dropzone--filled" : ""} ${isDragging ? "upload-dropzone--dragging" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  applySelectedFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getFileAccept(selectedType)}
                  multiple={canUseMultipleImages}
                  onChange={(e) => applySelectedFiles(e.target.files)}
                  className={FILE_INPUT_CLASS}
                />
                <div className="upload-dropzone__icon">
                  <i className={`fas ${selectedType === "general" ? "fa-images" : "fa-cloud-upload-alt"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {selectedType === "general" ? "Add photos or one video" : "Drop your file here or browse"}
                  </p>
                  <p className="text-xs text-white/50 mt-1">{getHelperCopy(selectedType)}</p>
                </div>
              </label>

              {uploadItems.length > 0 && (
                <div className="space-y-4 mt-4">
                  {selectedType === "general" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-white">Selected media</p>
                          <p className="mt-0.5 text-xs text-white/45">
                            {generalVideoCount > 0
                              ? "One video selected for this post."
                              : `${generalImageCount} photo${generalImageCount === 1 ? "" : "s"} selected. Tap any image or use the gallery button to review and remove items.`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGalleryPreviewOpen(true)}
                          className="upload-action-chip"
                        >
                          <i className="fas fa-expand" /> View gallery
                        </button>
                      </div>
                      <GalleryPreviewGrid
                        items={uploadItems}
                        onRemove={removeUploadItem}
                        onOpen={() => setGalleryPreviewOpen(true)}
                      />
                    </div>
                  )}
                  {selectedType !== "general" && selectedType !== "document" && (
                    <SingleFilePreview item={uploadItems[0]} onRemove={() => removeUploadItem(uploadItems[0].id)} />
                  )}

                  <div className="space-y-3">
                    {uploadItems.map((item) => (
                      <UploadProgressRow key={item.id} item={item} onRemove={() => removeUploadItem(item.id)} removable={!submitting} />
                    ))}
                  </div>
                </div>
              )}
              </section>
            ) : (
              <>
                <UploadFormFields
                  postType={selectedType}
                  formData={formData}
                  set={set}
                />

                <section className="upload-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {selectedType === "song"
                          ? "Song file"
                          : selectedType === "product"
                            ? "Product image"
                            : selectedType === "advert"
                              ? "Advert media"
                              : "Media"}
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        {selectedType === "song"
                          ? "Add the song file and cover art in one place."
                          : selectedType === "product"
                            ? "Use one clear product image for the listing."
                            : selectedType === "advert"
                              ? "Use one image or one short video for your advert."
                            : "Pick the main file for this post type."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="upload-action-chip"
                    >
                      <i className="fas fa-folder-open" /> {selectedType === "song" ? "Choose song" : selectedType === "product" ? "Choose image" : selectedType === "document" ? "Choose document" : selectedType === "advert" ? "Choose media" : "Choose files"}
                    </button>
                  </div>

                  <label
                    className={`upload-dropzone ${uploadItems.length > 0 ? "upload-dropzone--filled" : ""} ${isDragging ? "upload-dropzone--dragging" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      applySelectedFiles(e.dataTransfer.files);
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={getFileAccept(selectedType)}
                      multiple={canUseMultipleImages}
                      onChange={(e) => applySelectedFiles(e.target.files)}
                      className={FILE_INPUT_CLASS}
                    />
                    <div className="upload-dropzone__icon">
                      <i className="fas fa-cloud-upload-alt" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {selectedType === "product"
                          ? "Drop or browse your product image here"
                          : selectedType === "document"
                            ? "Drop or browse your document here"
                            : selectedType === "advert"
                              ? "Drop or browse your advert media here"
                              : "Drop your file here or browse"}
                      </p>
                      <p className="text-xs text-white/50 mt-1">{getHelperCopy(selectedType)}</p>
                    </div>
                  </label>

                  {uploadItems.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {selectedType === "product" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                            <div>
                              <p className="text-sm font-semibold text-white">Selected images</p>
                              <p className="mt-0.5 text-xs text-white/45">
                                {uploadItems.length} product image{uploadItems.length === 1 ? "" : "s"} selected.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setGalleryPreviewOpen(true)}
                              className="upload-action-chip"
                            >
                              <i className="fas fa-expand" /> View gallery
                            </button>
                          </div>
                          <GalleryPreviewGrid
                            items={uploadItems}
                            onRemove={removeUploadItem}
                            onOpen={() => setGalleryPreviewOpen(true)}
                          />
                        </div>
                      ) : (
                        <SingleFilePreview item={uploadItems[0]} onRemove={() => removeUploadItem(uploadItems[0].id)} />
                      )}

                      <div className="space-y-3">
                        {uploadItems.map((item) => (
                          <UploadProgressRow key={item.id} item={item} onRemove={() => removeUploadItem(item.id)} removable={!submitting} />
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedType === "song" && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">Cover art</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="upload-action-chip"
                        >
                          <i className="fas fa-image" /> Choose cover
                        </button>
                      </div>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverChange(e.target.files)}
                        className={FILE_INPUT_CLASS}
                      />
                      {coverPreviewUrl ? (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                          <Image src={coverPreviewUrl} alt="Album cover preview" width={1200} height={600} className="h-48 w-full object-cover" />
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-white/45">
                          Add cover art for your song
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </>
            )}

            <button type="submit" disabled={submitting} className="upload-submit-btn">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-loader inline-loader--sm" aria-hidden="true" />
                  Uploading in background...
                </span>
              ) : (
                selectedType === "general"
                  ? "Post"
                  : selectedType === "song"
                    ? "Post song"
                    : selectedType === "product"
                      ? "Post product"
                      : selectedType === "advert"
                        ? "Post advert"
                      : selectedType === "document"
                        ? "Post document"
                        : "Publish post"
              )}
            </button>
          </form>
        </div>
      )}

      {galleryPreviewOpen && (selectedType === "general" || selectedType === "product") && uploadItems.length > 0 && (
        <GalleryPreviewModal
          items={uploadItems}
          onRemove={removeUploadItem}
          onClose={closeGalleryPreview}
        />
      )}
    </div>
  );
}

function UploadFormFields({
  postType,
  formData,
  set,
  embedded = false,
}: {
  postType: UploadType;
  formData: Record<string, string>;
  set: (key: string, value: string) => void;
  embedded?: boolean;
}) {
  const inputClass = "sage-input text-sm py-2.5 mt-1 rounded-2xl";
  const labelClass = "text-xs text-white/60 uppercase tracking-wider";

  switch (postType) {
    case "general":
      return (
        <section className={embedded ? "" : "upload-card"}>
          <label className={labelClass}>Your Post</label>
          <textarea
            value={formData.generalPost ?? ""}
            onChange={(e) => set("generalPost", e.target.value)}
            placeholder="What's happening? Share your thoughts, a link, photos, or one short video..."
            className={`${inputClass} w-full min-h-[120px] resize-none`}
          />
        </section>
      );

    case "song":
      return (
        <section className="upload-card grid gap-4">
          <div>
            <label className={labelClass}>Song Title</label>
            <input
              type="text"
              value={formData.filename ?? ""}
              onChange={(e) => set("filename", e.target.value)}
              placeholder="Song title"
              className={`${inputClass} w-full`}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Artist / Singer</label>
            <input type="text" value={formData.singer ?? ""} onChange={(e) => set("singer", e.target.value)} placeholder="Artist name" className={`${inputClass} w-full`} required />
          </div>
          <div>
            <label className={labelClass}>Genre</label>
            <select value={formData.songType ?? ""} onChange={(e) => set("songType", e.target.value)} className={`${inputClass} w-full bg-transparent`}>
              <option value="" className="bg-white text-black">Select genre</option>
              {["Afrobeats", "Gospel", "Hip Hop", "R&B", "Reggae", "Pop", "Traditional", "Background Music", "Instrumental", "Other"].map((g) => (
                <option key={g} value={g.toLowerCase()} className="bg-white text-black">{g}</option>
              ))}
            </select>
          </div>
          <DescriptionField formData={formData} set={set} inputClass={inputClass} labelClass={labelClass} />
        </section>
      );

    case "video":
      return (
        <section className="upload-card">
          <DescriptionField formData={formData} set={set} inputClass={inputClass} labelClass={labelClass} />
        </section>
      );

    case "product":
      return (
          <section className="upload-card grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Product Name</label>
            <input type="text" value={formData.productName ?? ""} onChange={(e) => set("productName", e.target.value)} placeholder="Product name" className={`${inputClass} w-full`} required />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={formData.productType ?? ""}
                onChange={(e) => set("productType", e.target.value)}
                className={`${inputClass} w-full bg-transparent`}
              >
                <option value="" disabled className="bg-slate-900 text-white">Select category</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-slate-900 text-white">
                    {category}
                  </option>
                ))}
              </select>
            </div>
          <div className="md:col-span-2">
              <label className={labelClass}>Price (K)</label>
              <input type="number" value={formData.productPrice ?? ""} onChange={(e) => set("productPrice", e.target.value)} placeholder="0.00" className={`${inputClass} w-full`} required />
            </div>
            <div className="md:col-span-2">
              <DescriptionField formData={formData} set={set} inputClass={inputClass} labelClass={labelClass} />
            </div>
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <label className="flex items-center gap-3 text-sm text-white">
                <input
                  type="checkbox"
                  checked={formData.syncToStock === "1"}
                  onChange={(e) => set("syncToStock", e.target.checked ? "1" : "")}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                <span>Add this listing to Stock Manager too</span>
              </label>
              {formData.syncToStock === "1" ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity ?? ""}
                      onChange={(e) => set("stockQuantity", e.target.value)}
                      placeholder="0"
                      className={`${inputClass} w-full`}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Cost Price (K)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.stockCostPrice ?? ""}
                      onChange={(e) => set("stockCostPrice", e.target.value)}
                      placeholder="0.00"
                      className={`${inputClass} w-full`}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Low Stock Alert</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockLowStockThreshold ?? "5"}
                      onChange={(e) => set("stockLowStockThreshold", e.target.value)}
                      placeholder="5"
                      className={`${inputClass} w-full`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Supplier</label>
                    <input
                      type="text"
                      value={formData.stockSupplier ?? ""}
                      onChange={(e) => set("stockSupplier", e.target.value)}
                      placeholder="Supplier name"
                      className={`${inputClass} w-full`}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        );

    case "document":
      return (
          <section className="upload-card grid gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={formData.filename ?? ""}
                onChange={(e) => set("filename", e.target.value)}
                placeholder="Document title"
                className={`${inputClass} w-full`}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Short Note</label>
              <textarea
                value={formData.postDescription ?? ""}
                onChange={(e) => set("postDescription", e.target.value)}
                placeholder="Optional short note about this document..."
                className={`${inputClass} w-full min-h-[96px] resize-none`}
              />
            </div>
          </section>
        );

    case "advert":
      return (
        <section className="upload-card grid gap-4">
          <div>
            <label className={labelClass}>Advert Title</label>
            <input
              type="text"
              value={formData.advertTitle ?? ""}
              onChange={(e) => set("advertTitle", e.target.value)}
              placeholder="Advert title"
              className={`${inputClass} w-full`}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Advert Description</label>
            <textarea value={formData.postDescription ?? ""} onChange={(e) => set("postDescription", e.target.value)} placeholder="Describe your advert..." className={`${inputClass} w-full min-h-[100px] resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Destination URL</label>
            <input type="url" value={formData.advertUrl ?? ""} onChange={(e) => set("advertUrl", e.target.value)} placeholder="https://yoursite.com" className={`${inputClass} w-full`} required />
          </div>
        </section>
      );
  }
}

function DescriptionField({
  formData,
  set,
  inputClass,
  labelClass,
}: {
  formData: Record<string, string>;
  set: (key: string, value: string) => void;
  inputClass: string;
  labelClass: string;
}) {
  return (
    <div>
      <label className={labelClass}>Description</label>
      <textarea
        value={formData.postDescription ?? ""}
        onChange={(e) => set("postDescription", e.target.value)}
        placeholder="Add a description..."
        className={`${inputClass} w-full min-h-[90px] resize-none`}
      />
    </div>
  );
}

function PrivacySelect({
  formData,
  set,
  compact = false,
}: {
  formData: Record<string, string>;
  set: (key: string, value: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "min-w-[132px]" : ""}>
      <label className={`uppercase tracking-wider ${compact ? "text-[10px] text-white/38" : "text-xs text-white/60"}`}>
        Privacy
      </label>
      <select
        value={formData.privacy ?? "public"}
        onChange={(e) => set("privacy", e.target.value)}
        className={
          compact
            ? "mt-1 w-full rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/78 outline-none transition-colors hover:border-white/15 focus:border-cyan-400/35"
            : "sage-input text-sm py-2.5 mt-1 w-full rounded-2xl bg-transparent"
        }
      >
        <option value="public" className="bg-white text-black">Public</option>
        <option value="friends" className="bg-white text-black">Followers Only</option>
        <option value="private" className="bg-white text-black">Only Me</option>
      </select>
    </div>
  );
}

function GalleryPreviewGrid({
  items,
  onRemove,
  onOpen,
}: {
  items: UploadItem[];
  onRemove: (id: string) => void;
  onOpen: () => void;
}) {
  const limited = items.slice(0, 4);
  const remaining = items.length - limited.length;

  return (
    <div className="upload-gallery-grid max-w-[440px]">
      {limited.map((item, index) => (
        <div
          key={item.id}
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen();
            }
          }}
          className={`upload-gallery-grid__tile upload-gallery-grid__tile--${Math.min(items.length, 4)}-${index + 1}`}
        >
          {item.previewUrl ? (
            <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
          ) : (
            <div className="upload-gallery-grid__fallback">
              <i className={`fas ${isVideoContentType(item.file.type) ? "fa-video" : "fa-file-alt"}`} />
            </div>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(item.id);
            }}
            className="upload-gallery-grid__remove"
            aria-label="Remove file"
          >
            <i className="fas fa-times" />
          </button>
          {remaining > 0 && index === limited.length - 1 && (
            <div className="upload-gallery-grid__overlay">+{remaining}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function GalleryPreviewModal({
  items,
  onRemove,
  onClose,
}: {
  items: UploadItem[];
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#081722] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">Gallery preview</p>
            <p className="mt-1 text-xs text-white/45">
              {items.length} image{items.length === 1 ? "" : "s"} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
            aria-label="Close gallery preview"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-black/20">
                  {item.previewUrl ? (
                    <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/30">
                      <i className={`fas ${isVideoContentType(item.file.type) ? "fa-video" : "fa-file-alt"} text-3xl`} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="truncate text-sm text-white/75">{item.file.name}</p>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <i className="fas fa-trash-alt text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleFilePreview({ item, onRemove }: { item: UploadItem; onRemove: () => void }) {
  const isAudio = item.file.type.startsWith("audio/");
  const isVideo = isVideoContentType(item.file.type);

  return (
      <div className="max-w-[360px] overflow-hidden rounded-[20px] border border-white/10 bg-black/25">
      {isAudio ? (
        <div className="relative p-4">
          <button type="button" onClick={onRemove} className="upload-gallery-grid__remove" aria-label="Remove file">
            <i className="fas fa-times" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
              <i className="fas fa-music text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{item.file.name}</p>
              <p className="mt-1 text-xs text-white/45">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          {item.previewUrl ? (
            <audio controls className="mt-4 w-full">
              <source src={item.previewUrl} type={item.file.type} />
            </audio>
          ) : null}
        </div>
      ) : (
          <div className="relative h-[180px] w-full overflow-hidden bg-black">
          {item.previewUrl ? (
            isVideo ? (
              <video
                src={item.previewUrl}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
              />
            ) : (
              <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
            )
          ) : (
              <div className="flex h-full w-full items-center justify-center text-white/30">
               <i className={`fas ${isVideo ? "fa-video" : "fa-file-alt"} text-3xl`} />
              </div>
            )}
            <button type="button" onClick={onRemove} className="upload-gallery-grid__remove" aria-label="Remove file">
              <i className="fas fa-times" />
            </button>
          </div>
        )}
    </div>
  );
}

function UploadProgressRow({
  item,
  onRemove,
  removable,
}: {
  item: UploadItem;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="upload-progress-card">
      <div className="flex items-start gap-3">
        <div className="upload-progress-card__icon">
          <i className={`fas ${getFileIcon(item.file.type)}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium text-white">{item.file.name}</p>
            <span className="text-xs text-white/40">{item.progress}%</span>
          </div>
          <p className="text-xs text-white/45 mt-1">
            {item.error || item.notice || getStatusCopy(item.status)}
          </p>
          <div className="upload-progress-track mt-3">
            <div className={`upload-progress-fill ${item.status === "error" ? "upload-progress-fill--error" : ""}`} style={{ width: `${item.progress}%` }} />
          </div>
        </div>
        {removable && (
          <button type="button" onClick={onRemove} className="text-white/35 transition-colors hover:text-white">
            <i className="fas fa-times" />
          </button>
        )}
      </div>
    </div>
  );
}

function getFileAccept(type: UploadType) {
  switch (type) {
    case "general":
      return "image/*,video/*";
    case "song":
      return "audio/*";
    case "video":
      return "video/*";
    case "document":
      return ".pdf,.epub,.doc,.docx";
    case "product":
      return "image/*";
    case "advert":
      return "image/*,video/*";
  }
}

function getHelperCopy(type: UploadType) {
  switch (type) {
    case "general":
      return "";
    case "song":
      return "Drop or browse your song file here (mp3).";
    case "video":
      return "Short videos only: up to 60 seconds and 15MB.";
    case "document":
        return "PDF, DOC, DOCX, and EPUB files up to 8MB.";
    case "product":
        return "Add one clear product image for your listing.";
    case "advert":
      return "Use one image or one short video for your advert.";
  }
}

function getStatusCopy(status: UploadItemStatus) {
  switch (status) {
    case "queued":
      return "Waiting to upload";
    case "preparing":
      return "Preparing file";
    case "uploading":
      return "Uploading in background";
    case "done":
      return "Uploaded";
    case "error":
      return "Upload failed";
  }
}

function getFileIcon(contentType: string) {
  if (isImageContentType(contentType)) return "fa-image";
  if (isVideoContentType(contentType)) return "fa-video";
  if (contentType.startsWith("audio/")) return "fa-music";
  return "fa-file-alt";
}
