export type ConversionKind = "image" | "audio" | "video" | "document";

export type ConversionCapabilities = {
  configured: boolean;
  imageFormats: string[];
  audioFormats: string[];
  videoFormats: string[];
  documentFormats: string[];
};

const DEFAULT_CAPABILITIES: ConversionCapabilities = {
  configured: false,
  imageFormats: ["jpg", "png", "webp", "avif"],
  audioFormats: ["wav"],
  videoFormats: [],
  documentFormats: ["txt", "csv", "json"],
};

const CLOUDCONVERT_API_BASE = "https://api.cloudconvert.com/v2";

function getCloudConvertApiKey() {
  return process.env.CLOUDCONVERT_API_KEY?.trim() || "";
}

function getCloudConvertHeaders() {
  const apiKey = getCloudConvertApiKey();
  if (!apiKey) return null;

  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
}

function normalizeTargetFormat(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getCloudConvertCapabilities(): ConversionCapabilities {
  return {
    configured: true,
    imageFormats: ["jpg", "png", "webp", "avif", "bmp", "tiff", "ico", "svg"],
    audioFormats: ["wav", "mp3", "aac", "flac", "ogg", "m4a"],
    videoFormats: ["mp4", "webm", "mov", "avi", "mkv"],
    documentFormats: ["pdf", "docx", "txt", "rtf", "html", "odt", "csv", "json"],
  };
}

export function isConversionServiceConfigured() {
  return Boolean(getCloudConvertApiKey());
}

export function getDefaultConversionCapabilities(): ConversionCapabilities {
  return DEFAULT_CAPABILITIES;
}

export async function fetchConversionCapabilities(): Promise<ConversionCapabilities> {
  if (!isConversionServiceConfigured()) {
    return DEFAULT_CAPABILITIES;
  }

  return getCloudConvertCapabilities();
}

async function waitForCloudConvertJob(jobId: string, headers: Record<string, string>) {
  for (let attempt = 0; attempt < 45; attempt += 1) {
    const response = await fetch(`${CLOUDCONVERT_API_BASE}/jobs/${jobId}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("CloudConvert job lookup failed.");
    }

    const payload = (await response.json()) as {
      data?: {
        status?: string;
        tasks?: Array<{
          name?: string;
          status?: string;
          result?: {
            files?: Array<{ url?: string; filename?: string }>;
          };
          message?: string;
        }>;
      };
    };

    const job = payload.data;
    if (!job) {
      throw new Error("CloudConvert returned an invalid job response.");
    }

    if (job.status === "finished") {
      return job;
    }

    if (job.status === "error") {
      const failedTask = job.tasks?.find((task) => task.status === "error");
      throw new Error(failedTask?.message || "CloudConvert conversion failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("CloudConvert conversion timed out.");
}

async function createCloudConvertJob(kind: ConversionKind, file: File, targetFormat: string, headers: Record<string, string>) {
  const sourceFormat = (file.name.split(".").pop() || "").toLowerCase();
  if (!sourceFormat) {
    throw new Error("Unable to determine source file format.");
  }

  const requestBody = {
    tasks: {
      "import-file": {
        operation: "import/base64",
        file: Buffer.from(await file.arrayBuffer()).toString("base64"),
        filename: file.name,
      },
      "convert-file": {
        operation: "convert",
        input: "import-file",
        input_format: sourceFormat,
        output_format: targetFormat,
      },
      "export-file": {
        operation: "export/url",
        input: "convert-file",
        inline: false,
        archive_multiple_files: false,
      },
    },
    tag: `sagetech-${kind}-conversion`,
  };

  const response = await fetch(`${CLOUDCONVERT_API_BASE}/jobs`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || "Unable to start CloudConvert job.");
  }

  const payload = (await response.json()) as { data?: { id?: string } };
  const jobId = payload.data?.id;
  if (!jobId) {
    throw new Error("CloudConvert did not return a job id.");
  }

  return jobId;
}

export async function proxyConversionRequest(kind: ConversionKind, formData: FormData) {
  const headers = getCloudConvertHeaders();
  if (!headers) {
    throw new Error("Conversion service is not configured.");
  }

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    throw new Error("A file is required for conversion.");
  }

  const targetFormat = normalizeTargetFormat(formData.get("targetFormat"));
  if (!targetFormat) {
    throw new Error("A target format is required for conversion.");
  }

  const jobId = await createCloudConvertJob(kind, fileEntry, targetFormat, headers);
  const finishedJob = await waitForCloudConvertJob(jobId, headers);
  const exportTask = finishedJob.tasks?.find((task) => task.name === "export-file");
  const fileUrl = exportTask?.result?.files?.[0]?.url;
  const filename = exportTask?.result?.files?.[0]?.filename || fileEntry.name.replace(/\.[^.]+$/, `.${targetFormat}`);

  if (!fileUrl) {
    throw new Error("CloudConvert did not return a converted file.");
  }

  const convertedResponse = await fetch(fileUrl, { cache: "no-store" });
  if (!convertedResponse.ok) {
    throw new Error("Unable to download converted file from CloudConvert.");
  }

  const blob = await convertedResponse.blob();
  const outputHeaders = new Headers();
  outputHeaders.set("content-type", blob.type || convertedResponse.headers.get("content-type") || "application/octet-stream");
  outputHeaders.set("content-disposition", `attachment; filename="${filename.replace(/"/g, "")}"`);

  return new Response(await blob.arrayBuffer(), {
    status: 200,
    headers: outputHeaders,
  });
}
