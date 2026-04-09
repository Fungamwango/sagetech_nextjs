"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { MediaDropzone, TinyMetric, ToolCard, convertFileSize, formatNumber } from "@/components/tools/ConverterUi";

const frameFormats = [
  { value: "image/jpeg", label: "JPG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
] as const;

export default function VideoConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [targetMime, setTargetMime] = useState<(typeof frameFormats)[number]["value"]>("image/jpeg");
  const [targetFormat, setTargetFormat] = useState("mp4");
  const [quality, setQuality] = useState("92");
  const [timestamp, setTimestamp] = useState("0");
  const [duration, setDuration] = useState(0);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [serviceConfigured, setServiceConfigured] = useState(false);
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCapabilities = async () => {
      try {
        const response = await fetch("/api/tools/conversion-capabilities", { cache: "no-store" });
        const data = (await response.json()) as { configured?: boolean; videoFormats?: string[] };
        if (!cancelled) {
          setServiceConfigured(Boolean(data.configured));
          setAvailableFormats(data.videoFormats?.length ? data.videoFormats : []);
          if (data.videoFormats?.[0]) {
            setTargetFormat(data.videoFormats[0]);
          }
        }
      } catch {
        if (!cancelled) {
          setServiceConfigured(false);
          setAvailableFormats([]);
        }
      }
    };

    void loadCapabilities();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setSourceUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setSourceUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const extension = useMemo(() => {
    if (targetMime === "image/png") return "png";
    if (targetMime === "image/webp") return "webp";
    return "jpg";
  }, [targetMime]);
  const numericTimestamp = Number(timestamp);
  const numericQuality = Number(quality);
  const validationMessage = useMemo(() => {
    if (!file) return "Choose a video file first.";
    if (serviceConfigured && availableFormats.length > 0) {
      if (!targetFormat) return "Choose a target video format.";
      return "";
    }
    if (!Number.isFinite(numericTimestamp) || numericTimestamp < 0) {
      return "Timestamp must be 0 or higher.";
    }
    if (duration > 0 && numericTimestamp > duration) {
      return "Timestamp cannot be greater than the video duration.";
    }
    if (!Number.isFinite(numericQuality) || numericQuality < 10 || numericQuality > 100) {
      return "Quality must be between 10 and 100.";
    }
    return "";
  }, [availableFormats.length, duration, file, numericQuality, numericTimestamp, serviceConfigured, targetFormat]);
  const canConvert = !processing && !validationMessage;
  const downloadName = file
    ? serviceConfigured && availableFormats.length > 0
      ? file.name.replace(/\.[^.]+$/, `.${targetFormat}`)
      : file.name.replace(/\.[^.]+$/, `-frame.${extension}`)
    : serviceConfigured && availableFormats.length > 0
      ? `converted-video.${targetFormat}`
      : `video-frame.${extension}`;
  const triggerDownload = () => {
    if (!outputUrl) return;
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const extractFrame = async () => {
    if (outputUrl && !processing) {
      triggerDownload();
      return;
    }
    const video = videoRef.current;
    if (!canConvert || !video || !file) return;

    setProcessing(true);
    setError("");
    try {
      if (serviceConfigured && availableFormats.length > 0) {
        const formData = new FormData();
        formData.set("file", file as File);
        formData.set("targetFormat", targetFormat);

        const response = await fetch("/api/tools/convert/video", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.error || "Video conversion failed.");
        }

        const outputBlob = await response.blob();
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const nextUrl = URL.createObjectURL(outputBlob);
        setOutputUrl(nextUrl);
        setOutputSize(outputBlob.size);
        return;
      }

      const nextTime = Math.max(0, Math.min(Number(timestamp) || 0, duration || 0));
      video.currentTime = nextTime;

      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to prepare video canvas.");

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, targetMime, Math.max(0.1, Math.min(1, Number(quality) / 100)));
      });

      if (!frameBlob) throw new Error("Unable to export frame.");

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const nextUrl = URL.createObjectURL(frameBlob);
      setOutputUrl(nextUrl);
      setOutputSize(frameBlob.size);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Video conversion failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <ToolCard
        title="Video Converter"
        subtitle="Upload a real video file, pick a timestamp, and convert that frame into a downloadable JPG, PNG, or WebP image."
        icon="fas fa-film"
      >
        <div className="space-y-4">
          <MediaDropzone accept="video/*" onSelect={setFile} label="Choose a video file" />

          {error ? (
            <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {!error && validationMessage ? (
            <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100">
              {validationMessage}
            </div>
          ) : null}

          {file ? (
            <>
              <video
                ref={videoRef}
                src={sourceUrl}
                controls
                className="w-full rounded-[24px] bg-black"
                onLoadedMetadata={(event) => {
                  const video = event.currentTarget;
                  setDuration(video.duration || 0);
                  setDimensions({ width: video.videoWidth, height: video.videoHeight });
                }}
              />

              {serviceConfigured && availableFormats.length > 0 ? (
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/38">Target format</span>
                  <select value={targetFormat} onChange={(event) => setTargetFormat(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
                    {availableFormats.map((format) => (
                      <option key={format} value={format} className="bg-white text-black">
                        {format.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/38">Timestamp (sec)</span>
                    <input type="number" min="0" max={duration || undefined} step="0.1" value={timestamp} onChange={(event) => setTimestamp(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/38">Output format</span>
                    <select value={targetMime} onChange={(event) => setTargetMime(event.target.value as typeof targetMime)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
                      {frameFormats.map((option) => (
                        <option key={option.value} value={option.value} className="bg-white text-black">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/38">Quality %</span>
                    <input type="number" min="10" max="100" value={quality} onChange={(event) => setQuality(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
                  </label>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-4">
                <TinyMetric label="Duration" value={`${formatNumber(duration, 1)} sec`} />
                <TinyMetric label="Resolution" value={dimensions ? `${dimensions.width} x ${dimensions.height}` : "--"} />
                <TinyMetric label="Video size" value={`${formatNumber(convertFileSize(file.size, "Bytes", "MB"), 2)} MB`} />
                <TinyMetric label={serviceConfigured && availableFormats.length > 0 ? "Output size" : "Frame size"} value={outputSize === null ? "--" : `${formatNumber(convertFileSize(outputSize, "Bytes", "MB"), 2)} MB`} />
              </div>

              <button type="button" onClick={extractFrame} disabled={!canConvert} className="btn-sage w-full py-3 disabled:opacity-40">
                {processing ? (serviceConfigured && availableFormats.length > 0 ? "Converting..." : "Extracting...") : outputUrl ? (serviceConfigured && availableFormats.length > 0 ? "Download Converted Video" : "Download Frame Image") : (serviceConfigured && availableFormats.length > 0 ? "Convert Video" : "Extract Frame")}
              </button>

              {outputUrl ? (
                <div className="space-y-3 rounded-[24px] border border-white/[0.04] bg-white/[0.03] p-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/58">
                    {serviceConfigured && availableFormats.length > 0 ? "Converted video is ready to download." : "Extracted frame is ready to download."}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </ToolCard>
    </div>
  );
}
