export function parseMediaUrls(fileUrl?: string | null) {
  if (!fileUrl) return [] as string[];

  const trimmed = fileUrl.trim();
  if (!trimmed) return [] as string[];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((value): value is string => typeof value === "string" && value.length > 0);
      }
    } catch {
      return [trimmed];
    }
  }

  return [trimmed];
}

export function getPrimaryMediaUrl(fileUrl?: string | null) {
  return parseMediaUrls(fileUrl)[0] ?? null;
}
