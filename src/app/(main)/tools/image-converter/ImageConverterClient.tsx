"use client";

import { useEffect, useMemo, useState } from "react";

import { MediaDropzone, TinyMetric, ToolCard, convertFileSize, formatNumber } from "@/components/tools/ConverterUi";

const localFormatOptions = [
  { value: "jpg", label: "JPG", mime: "image/jpeg" },
  { value: "png", label: "PNG", mime: "image/png" },
  { value: "webp", label: "WebP", mime: "image/webp" },
  { value: "avif", label: "AVIF", mime: "image/avif" },
] as const;

export default function ImageConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [targetFormat, setTargetFormat] = useState("webp");
  const [quality, setQuality] = useState("92");
  const [processing, setProcessing] = useState(false);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [serviceConfigured, setServiceConfigured] = useState(false);
  const [availableFormats, setAvailableFormats] = useState<string[]>(["jpg", "png", "webp", "avif"]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCapabilities = async () => {
      try {
        const response = await fetch("/api/tools/conversion-capabilities", { cache: "no-store" });
        const data = (await response.json()) as { configured?: boolean; imageFormats?: string[] };
        if (!cancelled) {
          setServiceConfigured(Boolean(data.configured));
          setAvailableFormats(data.imageFormats?.length ? data.imageFormats : ["jpg", "png", "webp", "avif"]);
        }
      } catch {
        if (!cancelled) {
          setServiceConfigured(false);
          setAvailableFormats(["jpg", "png", "webp", "avif"]);
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

  const targetMime = useMemo(
    () => localFormatOptions.find((item) => item.value === targetFormat)?.mime ?? "image/webp",
    [targetFormat]
  );
  const numericQuality = Number(quality);
  const validationMessage = useMemo(() => {
    if (!file) return "Choose an image file first.";
    if (!sourceUrl) return "Wait for the selected image to finish loading.";
    if (!targetFormat) return "Choose an output format.";
    if (!Number.isFinite(numericQuality) || numericQuality < 10 || numericQuality > 100) {
      return "Quality must be between 10 and 100.";
    }
    return "";
  }, [file, numericQuality, sourceUrl, targetFormat]);
  const canConvert = !processing && !validationMessage;
  const downloadName = file ? file.name.replace(/\.[^.]+$/, `.${targetFormat}`) : `converted-image.${targetFormat}`;
  const triggerDownload = () => {
    if (!outputUrl) return;
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const convertImage = async () => {
    if (outputUrl && !processing) {
      triggerDownload();
      return;
    }
    if (!canConvert || !file || !sourceUrl) return;

    setProcessing(true);
    setError("");
    try {
      if (serviceConfigured) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("targetFormat", targetFormat);
        formData.set("quality", quality);

        const response = await fetch("/api/tools/convert/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.error || "Image conversion failed.");
        }

        const outputBlob = await response.blob();
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const nextUrl = URL.createObjectURL(outputBlob);
        setOutputUrl(nextUrl);
        setOutputSize(outputBlob.size);
        return;
      }

      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Unable to load image."));
        image.src = sourceUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to prepare canvas.");

      context.drawImage(image, 0, 0);
      const outputBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, targetMime, Math.max(0.1, Math.min(1, Number(quality) / 100)));
      });

      if (!outputBlob) throw new Error("Unable to export image.");

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const nextUrl = URL.createObjectURL(outputBlob);
      setOutputUrl(nextUrl);
      setOutputSize(outputBlob.size);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Image conversion failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <ToolCard
        title="Image Converter"
        subtitle="Convert real JPG, PNG, and WebP image files directly in the browser and download the new version."
        icon="fas fa-image"
      >
        <div className="space-y-4">
          <MediaDropzone accept="image/png,image/jpeg,image/webp" onSelect={setFile} label="Choose an image file" />

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
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/38">Output format</span>
                  <select value={targetFormat} onChange={(event) => setTargetFormat(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
                    {availableFormats.map((option) => (
                      <option key={option} value={option} className="bg-white text-black">
                        {option.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/38">Quality %</span>
                  <input type="number" min="10" max="100" value={quality} onChange={(event) => setQuality(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <TinyMetric label="Original size" value={`${formatNumber(convertFileSize(file.size, "Bytes", "MB"), 2)} MB`} />
                <TinyMetric label="Output format" value={targetFormat.toUpperCase()} />
                <TinyMetric label="Converted size" value={outputSize === null ? "--" : `${formatNumber(convertFileSize(outputSize, "Bytes", "MB"), 2)} MB`} />
              </div>

              <button type="button" onClick={convertImage} disabled={!canConvert} className="btn-sage w-full py-3 disabled:opacity-40">
                {processing ? "Converting..." : outputUrl ? "Download Converted Image" : "Convert Image"}
              </button>

              {outputUrl ? (
                <div className="rounded-[24px] border border-white/[0.04] bg-white/[0.03] px-4 py-4 text-sm text-white/68">
                  Converted image is ready to download.
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </ToolCard>
    </div>
  );
}
