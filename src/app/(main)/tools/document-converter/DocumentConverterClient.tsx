"use client";

import { useEffect, useMemo, useState } from "react";

import { MediaDropzone, TinyMetric, ToolCard, convertFileSize, formatNumber } from "@/components/tools/ConverterUi";

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((value) => value.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = cells[index]?.trim() ?? "";
      return record;
    }, {});
  });
}

function objectsToCsv(data: Record<string, unknown>[]) {
  if (!data.length) return "";
  const headers = Array.from(new Set(data.flatMap((item) => Object.keys(item))));
  const rows = data.map((item) =>
    headers
      .map((header) => String(item[header] ?? "").replaceAll(",", " "))
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export default function DocumentConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputKind, setOutputKind] = useState("txt");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [serviceConfigured, setServiceConfigured] = useState(false);
  const [availableFormats, setAvailableFormats] = useState<string[]>(["txt", "csv", "json"]);
  const localFormats = ["txt", "csv", "json"];

  useEffect(() => {
    let cancelled = false;

    const loadCapabilities = async () => {
      try {
        const response = await fetch("/api/tools/conversion-capabilities", { cache: "no-store" });
        const data = (await response.json()) as { configured?: boolean; documentFormats?: string[] };
        if (!cancelled) {
          setServiceConfigured(Boolean(data.configured));
          setAvailableFormats(data.documentFormats?.length ? data.documentFormats : ["txt", "csv", "json"]);
        }
      } catch {
        if (!cancelled) {
          setServiceConfigured(false);
          setAvailableFormats(["txt", "csv", "json"]);
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
      setText("");
      setError("");
      return;
    }

    let cancelled = false;

    const readFile = async () => {
      try {
        const nextText = await file.text();
        if (!cancelled) {
          setText(nextText);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setText("");
          setError(
            serviceConfigured
              ? "This file is not readable as plain text in the browser, but backend conversion can still be used for supported document formats."
              : "This document could not be read as plain text. Use TXT, CSV, JSON, or MD files."
          );
        }
      }
    };

    void readFile();

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const outputText = useMemo(() => {
    if (!text) return "";

    const lowerName = file?.name.toLowerCase() ?? "";
    const isJson = lowerName.endsWith(".json");
    const isCsv = lowerName.endsWith(".csv");

    try {
      if (outputKind === "txt") {
        if (isJson) {
          return JSON.stringify(JSON.parse(text), null, 2);
        }
        if (isCsv) {
          return parseCsv(text)
            .map((row, index) => `Row ${index + 1}\n${Object.entries(row).map(([key, value]) => `${key}: ${value}`).join("\n")}`)
            .join("\n\n");
        }
        return text;
      }

      if (outputKind === "json") {
        if (isJson) {
          return JSON.stringify(JSON.parse(text), null, 2);
        }
        if (isCsv) {
          return JSON.stringify(parseCsv(text), null, 2);
        }

        const lines = text.split(/\r?\n/).filter(Boolean);
        return JSON.stringify(lines.map((line, index) => ({ line: index + 1, text: line })), null, 2);
      }

      if (outputKind === "csv") {
        if (isCsv) return text;
        if (isJson) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
            return objectsToCsv(parsed as Record<string, unknown>[]);
          }
          return "value\n" + JSON.stringify(parsed).replaceAll("\n", " ");
        }

        return text
          .split(/\r?\n/)
          .filter(Boolean)
          .map((line) => line.replaceAll(",", " "))
          .join("\n");
      }
    } catch {
      return "";
    }

    return "";
  }, [file?.name, outputKind, text]);

  const extension = outputKind;
  const outputSize = outputText ? new Blob([outputText], { type: "text/plain;charset=utf-8" }).size : 0;
  const validationMessage = useMemo(() => {
    if (!file) return "Choose a document file first.";
    if (!outputKind) return "Choose an output format.";
    if (!localFormats.includes(outputKind) && !serviceConfigured) {
      return "This format needs the external conversion service, which is not available right now.";
    }
    if (localFormats.includes(outputKind) && !outputText) {
      return "This file does not yet have readable local content for the selected output format.";
    }
    return "";
  }, [file, outputKind, outputText, serviceConfigured]);
  const canPrepareDownload = !processing && !validationMessage;
  const downloadName = file ? file.name.replace(/\.[^.]+$/, `.${extension}`) : `converted-document.${extension}`;
  const triggerDownload = () => {
    if (!outputUrl) return;
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const createDownload = async () => {
    if (outputUrl && !processing) {
      triggerDownload();
      return;
    }
    if (!canPrepareDownload || !file) return;

    setProcessing(true);
    if (serviceConfigured && !localFormats.includes(outputKind)) {
      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("targetFormat", outputKind);

        const response = await fetch("/api/tools/convert/document", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.error || "Document conversion failed.");
        }

        const blob = await response.blob();
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(URL.createObjectURL(blob));
        setError("");
        return;
      } catch (conversionError) {
        setError(conversionError instanceof Error ? conversionError.message : "Document conversion failed.");
        return;
      } finally {
        setProcessing(false);
      }
    }

    if (!outputText) {
      setProcessing(false);
      return;
    }
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(URL.createObjectURL(blob));
    setError("");
    setProcessing(false);
  };

  return (
    <div className="space-y-5">
      <ToolCard
        title="Document Converter"
        subtitle="Convert real documents and download the converted file."
        icon="fas fa-file-lines"
      >
        <div className="space-y-4">
          <MediaDropzone accept=".txt,.csv,.json,.md,.pdf,.doc,.docx,.odt,.rtf,.xls,.xlsx,.ppt,.pptx,text/*,application/json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text" onSelect={setFile} label="Choose a document file" />

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
                <p className="mt-1 text-xs text-white/45">
                  {file.type || "document"} · {formatNumber(convertFileSize(file.size, "Bytes", "KB"), 2)} KB
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block sm:col-span-1">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/38">Output format</span>
                  <select value={outputKind} onChange={(event) => setOutputKind(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
                    {availableFormats.map((format) => (
                      <option key={format} value={format} className="bg-white text-black">
                        {format.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <TinyMetric label="Input size" value={`${formatNumber(convertFileSize(file.size, "Bytes", "KB"), 2)} KB`} />
                <TinyMetric label="Output size" value={`${formatNumber(convertFileSize(outputSize, "Bytes", "KB"), 2)} KB`} />
              </div>

              {(processing || outputUrl) ? (
                <div className="rounded-[24px] border border-white/[0.04] bg-white/[0.03] p-4 text-sm leading-6 text-white/58">
                  {processing ? "Converting document..." : "Converted document is ready to download."}
                </div>
              ) : null}

              <button type="button" onClick={() => void createDownload()} disabled={!canPrepareDownload} className="btn-sage w-full py-3 disabled:opacity-40">
                {processing ? "Converting..." : outputUrl ? "Download Converted Document" : "Convert Document"}
              </button>

            </>
          ) : null}
        </div>
      </ToolCard>
    </div>
  );
}
