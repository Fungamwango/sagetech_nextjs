"use client";

import { useEffect, useState } from "react";

import { MediaDropzone, TinyMetric, ToolCard, convertFileSize, formatNumber } from "@/components/tools/ConverterUi";

function audioBufferToWavBlob(buffer: AudioBuffer) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = samples * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let sampleIndex = 0; sampleIndex < samples; sampleIndex += 1) {
    for (let channelIndex = 0; channelIndex < channels; channelIndex += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channelIndex)[sampleIndex] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

export default function AudioConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [targetFormat, setTargetFormat] = useState("wav");
  const [metrics, setMetrics] = useState<{
    duration: number;
    sampleRate: number;
    channels: number;
    outputSize: number;
  } | null>(null);
  const [serviceConfigured, setServiceConfigured] = useState(false);
  const [availableFormats, setAvailableFormats] = useState<string[]>(["wav"]);
  const [error, setError] = useState("");
  const validationMessage = !file
    ? "Choose an audio file first."
    : !targetFormat
      ? "Choose an output format."
      : "";
  const canConvert = !processing && !validationMessage;
  const downloadName = file ? file.name.replace(/\.[^.]+$/, `.${targetFormat}`) : `converted-audio.${targetFormat}`;
  const triggerDownload = () => {
    if (!outputUrl) return;
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  useEffect(() => {
    let cancelled = false;

    const loadCapabilities = async () => {
      try {
        const response = await fetch("/api/tools/conversion-capabilities", { cache: "no-store" });
        const data = (await response.json()) as { configured?: boolean; audioFormats?: string[] };
        if (!cancelled) {
          setServiceConfigured(Boolean(data.configured));
          setAvailableFormats(data.audioFormats?.length ? data.audioFormats : ["wav"]);
        }
      } catch {
        if (!cancelled) {
          setServiceConfigured(false);
          setAvailableFormats(["wav"]);
        }
      }
    };

    void loadCapabilities();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const convertToWav = async () => {
    if (outputUrl && !processing) {
      triggerDownload();
      return;
    }
    if (!canConvert || !file) return;

    setProcessing(true);
    setError("");
    try {
      if (serviceConfigured && targetFormat !== "wav") {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("targetFormat", targetFormat);

        const response = await fetch("/api/tools/convert/audio", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.error || "Audio conversion failed.");
        }

        const outputBlob = await response.blob();
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        const nextUrl = URL.createObjectURL(outputBlob);
        setOutputUrl(nextUrl);
        setMetrics((current) =>
          current
            ? {
                ...current,
                outputSize: outputBlob.size,
              }
            : null
        );
        return;
      }

      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      const wavBlob = audioBufferToWavBlob(decoded);

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const nextUrl = URL.createObjectURL(wavBlob);
      setOutputUrl(nextUrl);
      setMetrics({
        duration: decoded.duration,
        sampleRate: decoded.sampleRate,
        channels: decoded.numberOfChannels,
        outputSize: wavBlob.size,
      });

      await audioContext.close();
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Audio conversion failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <ToolCard
        title="Audio Converter"
        subtitle="Convert real songs and browser-supported audio files into WAV directly in your browser."
        icon="fas fa-music"
      >
        <div className="space-y-4">
          <MediaDropzone accept="audio/*" onSelect={setFile} label="Choose an audio file" />

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
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
                <p className="truncate text-sm font-medium text-white">{file.name}</p>
                <p className="mt-1 text-xs text-white/45">{file.type || "audio"}</p>
              </div>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/38">Output format</span>
                <select value={targetFormat} onChange={(event) => setTargetFormat(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
                  {availableFormats.map((format) => (
                    <option key={format} value={format} className="bg-white text-black">
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-4">
                <TinyMetric label="Original size" value={`${formatNumber(convertFileSize(file.size, "Bytes", "MB"), 2)} MB`} />
                <TinyMetric label="Target format" value={targetFormat.toUpperCase()} />
                <TinyMetric label="Converted size" value={metrics ? `${formatNumber(convertFileSize(metrics.outputSize, "Bytes", "MB"), 2)} MB` : "--"} />
                <TinyMetric label="Channels" value={metrics ? String(metrics.channels) : "--"} />
              </div>

              {metrics ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <TinyMetric label="Duration" value={`${formatNumber(metrics.duration, 1)} sec`} />
                  <TinyMetric label="Sample rate" value={`${formatNumber(metrics.sampleRate, 0)} Hz`} />
                </div>
              ) : null}

              <button type="button" onClick={convertToWav} disabled={!canConvert} className="btn-sage w-full py-3 disabled:opacity-40">
                {processing ? "Converting..." : outputUrl ? `Download ${targetFormat.toUpperCase()}` : `Convert to ${targetFormat.toUpperCase()}`}
              </button>

              {outputUrl ? (
                <div className="space-y-3 rounded-[24px] border border-white/[0.04] bg-white/[0.03] p-4">
                  <div className="text-sm text-white/68">Converted audio is ready to download.</div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </ToolCard>
    </div>
  );
}
