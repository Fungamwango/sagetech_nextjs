type AdsterraStatsParams = {
  token: string;
  domainId?: string | null;
  placementId?: string | null;
  startDate?: string;
  finishDate?: string;
};

export type AdsterraStatsSummary = {
  impressions: number;
  clicks: number;
  revenue: number;
  allTimeRevenue?: number;
  ctr: number;
  cpm: number;
  updatedAt: string;
  daily: Array<{
    date: string;
    impressions: number;
    clicks: number;
    revenue: number;
    ctr: number;
    cpm: number;
  }>;
};

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function extractDateValue(row: Record<string, unknown>) {
  const candidate =
    row.date ??
    row.day ??
    row.created_at ??
    row.stat_date ??
    row.start_date ??
    row.end_date ??
    row.label ??
    row.group ??
    row.name ??
    "";

  if (typeof candidate === "number") {
    const millis = candidate > 1_000_000_000_000 ? candidate : candidate * 1000;
    return new Date(millis).toISOString();
  }

  if (typeof candidate === "string") {
    return candidate.trim();
  }

  return "";
}

function buildDateRange(start: string, finish: string) {
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const finishDate = new Date(`${finish}T00:00:00.000Z`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(finishDate.getTime()) || startDate > finishDate) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= finishDate) {
    dates.push(cursor.toISOString());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function normaliseRows(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) return payload.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.items)) {
      return record.items.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
    }
    if (Array.isArray(record.data)) {
      return record.data.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
    }
    return [record];
  }
  return [];
}

export function canUseAdsterraStats(input: {
  provider?: string | null;
  isMonetised?: boolean | null;
  token?: string | null;
}) {
  return input.provider === "adsterra" && !!input.isMonetised && !!input.token?.trim();
}

export async function fetchAdsterraStats(params: AdsterraStatsParams): Promise<AdsterraStatsSummary | null> {
  const token = params.token.trim();
  if (!token) return null;

  const finish = params.finishDate ?? new Date().toISOString().slice(0, 10);
  const start =
    params.startDate ??
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const url = new URL("https://api3.adsterratools.com/publisher/stats.json");
  url.searchParams.set("start_date", start);
  url.searchParams.set("finish_date", finish);
  url.searchParams.set("group_by", "date");
  if (params.domainId?.trim()) url.searchParams.set("domain", params.domainId.trim());
  if (params.placementId?.trim()) url.searchParams.set("placement", params.placementId.trim());

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-API-Key": token,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Adsterra stats request failed with status ${response.status}`);
  }

  const payload = await response.json().catch(() => null);
  const rows = normaliseRows(payload);
  if (!rows.length) {
    return {
      impressions: 0,
      clicks: 0,
      revenue: 0,
      ctr: 0,
      cpm: 0,
      updatedAt: new Date().toISOString(),
      daily: [],
    };
  }

  const totals = rows.reduce<{ impressions: number; clicks: number; revenue: number }>(
    (acc, row) => {
      acc.impressions += toNumber(row.impressions ?? row.impression);
      acc.clicks += toNumber(row.clicks);
      acc.revenue += toNumber(row.revenue);
      return acc;
    },
    { impressions: 0, clicks: 0, revenue: 0 }
  );

  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpm = totals.impressions > 0 ? (totals.revenue / totals.impressions) * 1000 : 0;
  const fallbackDates = buildDateRange(start, finish);
  const daily = rows.map((row, index) => {
    const impressions = toNumber(row.impressions ?? row.impression);
    const clicks = toNumber(row.clicks);
    const revenue = toNumber(row.revenue);
    const rowCtr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const rowCpm = impressions > 0 ? (revenue / impressions) * 1000 : 0;
    const explicitDate = extractDateValue(row);
    return {
      date: explicitDate || fallbackDates[index] || "",
      impressions,
      clicks,
      revenue: round(revenue, 4),
      ctr: round(rowCtr, 2),
      cpm: round(rowCpm, 4),
    };
  });

  return {
    impressions: totals.impressions,
    clicks: totals.clicks,
    revenue: round(totals.revenue, 4),
    ctr: round(ctr, 2),
    cpm: round(cpm, 4),
    updatedAt: new Date().toISOString(),
    daily,
  };
}

export async function fetchAdsterraAllTimeRevenue(
  params: Pick<AdsterraStatsParams, "token" | "domainId" | "placementId">
) {
  const stats = await fetchAdsterraStats({
    ...params,
    startDate: "2000-01-01",
    finishDate: new Date().toISOString().slice(0, 10),
  });

  return stats?.revenue ?? 0;
}
