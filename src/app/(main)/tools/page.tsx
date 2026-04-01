"use client";

import { useEffect, useMemo, useState } from "react";

type ConversionKey = "temperature" | "distance" | "weight";
type ToolCategory = "money" | "health" | "planning" | "convert" | "media";
type ToolId = "currency" | "loan" | "discount" | "bmi" | "fuel" | "unit" | "file-size" | "image-resizer" | "resolution";

type CurrencyOption = {
  code: string;
  label: string;
  symbol: string;
};

const currencies: CurrencyOption[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "ZMW", label: "Zambian Kwacha", symbol: "K" },
  { code: "ZAR", label: "South African Rand", symbol: "R" },
  { code: "EUR", label: "Euro", symbol: "EUR " },
  { code: "GBP", label: "British Pound", symbol: "GBP " },
  { code: "KES", label: "Kenyan Shilling", symbol: "KES " },
  { code: "NGN", label: "Nigerian Naira", symbol: "NGN " },
];

const toolsByCategory: Record<
  ToolCategory,
  Array<{ id: ToolId; label: string; subtitle: string; icon: string }>
> = {
  money: [
    { id: "currency", label: "Currency Converter", subtitle: "Live exchange rate conversion", icon: "fas fa-money-bill-transfer" },
    { id: "loan", label: "Loan Calculator", subtitle: "Monthly repayment and totals", icon: "fas fa-calculator" },
    { id: "discount", label: "Discount Calculator", subtitle: "Savings and final price", icon: "fas fa-tags" },
  ],
  health: [
    { id: "bmi", label: "BMI Calculator", subtitle: "Simple body mass check", icon: "fas fa-heart-pulse" },
  ],
  planning: [
    { id: "fuel", label: "Trip Fuel Cost", subtitle: "Distance, efficiency, and fuel cost", icon: "fas fa-gas-pump" },
  ],
  convert: [
    { id: "unit", label: "Unit Converter", subtitle: "Temperature, distance, and weight", icon: "fas fa-ruler-combined" },
  ],
  media: [
    { id: "file-size", label: "File Size Converter", subtitle: "Bytes, KB, MB, GB, and TB", icon: "fas fa-hard-drive" },
    { id: "image-resizer", label: "Image Resizer", subtitle: "Resize dimensions while keeping ratio", icon: "fas fa-image" },
    { id: "resolution", label: "Resolution Scaler", subtitle: "Video and image resolution planning", icon: "fas fa-expand" },
  ],
};

const categoryOptions: Array<{ id: ToolCategory; label: string; icon: string }> = [
  { id: "money", label: "Money", icon: "fas fa-wallet" },
  { id: "health", label: "Health", icon: "fas fa-heart" },
  { id: "planning", label: "Planning", icon: "fas fa-route" },
  { id: "convert", label: "Convert", icon: "fas fa-right-left" },
  { id: "media", label: "Media", icon: "fas fa-photo-film" },
];

const conversions: Record<
  ConversionKey,
  {
    label: string;
    units: string[];
    convert: (value: number, from: string, to: string) => number;
  }
> = {
  temperature: {
    label: "Temperature",
    units: ["Celsius", "Fahrenheit", "Kelvin"],
    convert: (value, from, to) => {
      let celsius = value;
      if (from === "Fahrenheit") celsius = ((value - 32) * 5) / 9;
      if (from === "Kelvin") celsius = value - 273.15;

      if (to === "Celsius") return celsius;
      if (to === "Fahrenheit") return (celsius * 9) / 5 + 32;
      return celsius + 273.15;
    },
  },
  distance: {
    label: "Distance",
    units: ["Meters", "Kilometers", "Miles", "Feet", "Inches", "Centimeters", "Millimeters"],
    convert: (value, from, to) => {
      const toMeters: Record<string, number> = {
        Meters: 1,
        Kilometers: 1000,
        Miles: 1609.34,
        Feet: 0.3048,
        Inches: 0.0254,
        Centimeters: 0.01,
        Millimeters: 0.001,
      };
      return (value * toMeters[from]) / toMeters[to];
    },
  },
  weight: {
    label: "Weight",
    units: ["Kilograms", "Grams", "Pounds", "Ounces"],
    convert: (value, from, to) => {
      const toKilograms: Record<string, number> = {
        Kilograms: 1,
        Grams: 0.001,
        Pounds: 0.453592,
        Ounces: 0.0283495,
      };
      return (value * toKilograms[from]) / toKilograms[to];
    },
  },
};

const sizeUnits = ["Bytes", "KB", "MB", "GB", "TB"] as const;
type SizeUnit = (typeof sizeUnits)[number];

function convertFileSize(value: number, from: SizeUnit, to: SizeUnit) {
  const factors: Record<SizeUnit, number> = {
    Bytes: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  return (value * factors[from]) / factors[to];
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits });
}

function formatMoney(value: number, currencyCode: string) {
  const currency = currencies.find((item) => item.code === currencyCode);
  const prefix = currency?.symbol ?? `${currencyCode} `;
  return `${prefix}${formatNumber(value, 2)}`;
}

function ToolCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,21,32,0.96),rgba(4,13,20,0.94))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
          <i className={`${icon} text-base`} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-white/50">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function TinyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">{label}</p>
      <p className="mt-1 text-base font-semibold text-cyan-300">{value}</p>
    </div>
  );
}

function MediaDropzone({
  accept,
  onSelect,
  label,
}: {
  accept: string;
  onSelect: (file: File | null) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] px-4 py-6 text-center transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.04]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
        <i className="fas fa-file-arrow-up text-base" />
      </div>
      <p className="mt-3 text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs text-white/45">Choose a file from your device</p>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function CurrencyTool() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("ZMW");
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRates = async () => {
      if (fromCurrency === toCurrency) {
        setRates({ [toCurrency]: 1 });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/tools/currency?base=${encodeURIComponent(fromCurrency)}&symbols=${encodeURIComponent(toCurrency)}`, {
          credentials: "include",
        });
        const data = (await response.json()) as {
          error?: string;
          rates?: Record<string, number>;
          updatedAt?: string;
        };

        if (!response.ok || !data.rates) {
          throw new Error(data.error || "Unable to load live rates.");
        }

        if (!cancelled) {
          setRates(data.rates);
          setUpdatedAt(data.updatedAt ?? "");
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load live rates.");
          setRates({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRates();

    return () => {
      cancelled = true;
    };
  }, [fromCurrency, toCurrency]);

  const numericAmount = Number(amount);
  const rate = fromCurrency === toCurrency ? 1 : rates[toCurrency];
  const converted = Number.isFinite(numericAmount) && numericAmount >= 0 && typeof rate === "number"
    ? numericAmount * rate
    : null;

  return (
    <ToolCard
      title="Currency Converter"
      subtitle="Uses live exchange rates from the server, with a short cache to keep results fresh."
      icon="fas fa-money-bill-transfer"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Amount</span>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
            className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">From</span>
          <select
            value={fromCurrency}
            onChange={(event) => setFromCurrency(event.target.value)}
            className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code} className="bg-white text-black">
                {currency.code} - {currency.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">To</span>
          <select
            value={toCurrency}
            onChange={(event) => setToCurrency(event.target.value)}
            className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code} className="bg-white text-black">
                {currency.code} - {currency.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TinyMetric
          label="Live Rate"
          value={loading ? "Loading..." : typeof rate === "number" ? `1 ${fromCurrency} = ${formatMoney(rate, toCurrency)}` : "--"}
        />
        <TinyMetric
          label="Updated"
          value={updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
        />
      </div>

      <div className="mt-4 rounded-[24px] border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Converted</p>
        <p className="mt-1 text-lg font-semibold text-cyan-300">
          {error
            ? error
            : converted === null
              ? "Enter a valid amount"
              : `${formatMoney(numericAmount, fromCurrency)} = ${formatMoney(converted, toCurrency)}`}
        </p>
      </div>
    </ToolCard>
  );
}

function LoanTool() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [months, setMonths] = useState("");

  const summary = useMemo(() => {
    const principalValue = Number(principal);
    const annualRateValue = Number(annualRate);
    const monthsValue = Number(months);

    if (
      !Number.isFinite(principalValue) ||
      !Number.isFinite(annualRateValue) ||
      !Number.isFinite(monthsValue) ||
      principalValue <= 0 ||
      annualRateValue < 0 ||
      monthsValue <= 0
    ) {
      return null;
    }

    const monthlyRate = annualRateValue / 100 / 12;
    const payment =
      monthlyRate === 0
        ? principalValue / monthsValue
        : (principalValue * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -monthsValue));
    const totalRepayment = payment * monthsValue;
    const totalInterest = totalRepayment - principalValue;

    return { payment, totalRepayment, totalInterest };
  }, [annualRate, months, principal]);

  return (
    <ToolCard title="Loan Calculator" subtitle="See your monthly repayment, total payback, and interest before you commit." icon="fas fa-calculator">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Loan Amount</span>
          <input type="number" min="0" value={principal} onChange={(event) => setPrincipal(event.target.value)} placeholder="e.g. 15000" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Annual Rate %</span>
          <input type="number" min="0" value={annualRate} onChange={(event) => setAnnualRate(event.target.value)} placeholder="e.g. 24" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Months</span>
          <input type="number" min="1" value={months} onChange={(event) => setMonths(event.target.value)} placeholder="e.g. 12" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <TinyMetric label="Monthly" value={summary ? formatMoney(summary.payment, "ZMW") : "--"} />
        <TinyMetric label="Total Interest" value={summary ? formatMoney(summary.totalInterest, "ZMW") : "--"} />
        <TinyMetric label="Total Payback" value={summary ? formatMoney(summary.totalRepayment, "ZMW") : "--"} />
      </div>
    </ToolCard>
  );
}

function DiscountTool() {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");

  const summary = useMemo(() => {
    const priceValue = Number(price);
    const discountValue = Number(discount);

    if (
      !Number.isFinite(priceValue) ||
      !Number.isFinite(discountValue) ||
      priceValue < 0 ||
      discountValue < 0 ||
      discountValue > 100
    ) {
      return null;
    }

    const saved = (priceValue * discountValue) / 100;
    const finalPrice = priceValue - saved;

    return { saved, finalPrice };
  }, [discount, price]);

  return (
    <ToolCard title="Discount Calculator" subtitle="Work out savings and final price quickly while shopping or pricing." icon="fas fa-tags">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Original Price</span>
          <input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="e.g. 899" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Discount %</span>
          <input type="number" min="0" max="100" value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder="e.g. 15" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TinyMetric label="You Save" value={summary ? formatMoney(summary.saved, "ZMW") : "--"} />
        <TinyMetric label="Final Price" value={summary ? formatMoney(summary.finalPrice, "ZMW") : "--"} />
      </div>
    </ToolCard>
  );
}

function BmiTool() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const result = useMemo(() => {
    const heightValue = Number(height);
    const weightValue = Number(weight);

    if (!Number.isFinite(heightValue) || !Number.isFinite(weightValue) || heightValue <= 0 || weightValue <= 0) {
      return null;
    }

    const meters = heightValue / 100;
    const bmi = weightValue / (meters * meters);

    const status =
      bmi < 18.5 ? "Underweight" :
      bmi < 25 ? "Healthy range" :
      bmi < 30 ? "Overweight" :
      "Obesity range";

    return { bmi, status };
  }, [height, weight]);

  return (
    <ToolCard title="BMI Calculator" subtitle="A quick weight-to-height check for everyday health tracking." icon="fas fa-heart-pulse">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Height (cm)</span>
          <input type="number" min="0" value={height} onChange={(event) => setHeight(event.target.value)} placeholder="e.g. 172" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Weight (kg)</span>
          <input type="number" min="0" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="e.g. 68" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TinyMetric label="BMI" value={result ? formatNumber(result.bmi, 1) : "--"} />
        <TinyMetric label="Status" value={result?.status ?? "--"} />
      </div>
    </ToolCard>
  );
}

function FuelTool() {
  const [distance, setDistance] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");

  const result = useMemo(() => {
    const distanceValue = Number(distance);
    const efficiencyValue = Number(efficiency);
    const fuelPriceValue = Number(fuelPrice);

    if (
      !Number.isFinite(distanceValue) ||
      !Number.isFinite(efficiencyValue) ||
      !Number.isFinite(fuelPriceValue) ||
      distanceValue <= 0 ||
      efficiencyValue <= 0 ||
      fuelPriceValue <= 0
    ) {
      return null;
    }

    const litersNeeded = (distanceValue / 100) * efficiencyValue;
    const tripCost = litersNeeded * fuelPriceValue;

    return { litersNeeded, tripCost };
  }, [distance, efficiency, fuelPrice]);

  return (
    <ToolCard title="Trip Fuel Cost" subtitle="Estimate liters needed and fuel spend before you travel." icon="fas fa-gas-pump">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Distance (km)</span>
          <input type="number" min="0" value={distance} onChange={(event) => setDistance(event.target.value)} placeholder="e.g. 380" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Fuel Use /100km</span>
          <input type="number" min="0" value={efficiency} onChange={(event) => setEfficiency(event.target.value)} placeholder="e.g. 7.5" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Fuel Price /L</span>
          <input type="number" min="0" value={fuelPrice} onChange={(event) => setFuelPrice(event.target.value)} placeholder="e.g. 34.20" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TinyMetric label="Fuel Needed" value={result ? `${formatNumber(result.litersNeeded, 2)} L` : "--"} />
        <TinyMetric label="Estimated Cost" value={result ? formatMoney(result.tripCost, "ZMW") : "--"} />
      </div>
    </ToolCard>
  );
}

function UnitTool() {
  const [conversionType, setConversionType] = useState<ConversionKey>("temperature");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState(conversions.temperature.units[0]);
  const [toUnit, setToUnit] = useState(conversions.temperature.units[1]);

  const units = conversions[conversionType].units;
  const convertedValue = useMemo(() => {
    const parsed = Number(value);
    if (value.trim() === "" || Number.isNaN(parsed)) return null;
    return conversions[conversionType].convert(parsed, fromUnit, toUnit);
  }, [conversionType, fromUnit, toUnit, value]);

  const onTypeChange = (next: ConversionKey) => {
    setConversionType(next);
    setFromUnit(conversions[next].units[0]);
    setToUnit(conversions[next].units[1]);
    setValue("");
  };

  return (
    <ToolCard title="Unit Converter" subtitle="A compact converter for temperature, distance, and weight." icon="fas fa-ruler-combined">
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(conversions) as ConversionKey[]).map((key) => {
          const active = conversionType === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTypeChange(key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-cyan-400/25 bg-cyan-400/12 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/68 hover:text-white"
              }`}
            >
              {conversions[key].label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">Value</span>
          <input type="number" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Enter value" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">From</span>
          <select value={fromUnit} onChange={(event) => setFromUnit(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
            {units.map((unit) => (
              <option key={unit} value={unit} className="bg-white text-black">
                {unit}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-white/38">To</span>
          <select value={toUnit} onChange={(event) => setToUnit(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
            {units.map((unit) => (
              <option key={unit} value={unit} className="bg-white text-black">
                {unit}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-[24px] border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Converted</p>
        <p className="mt-1 text-lg font-semibold text-cyan-300">
          {convertedValue === null
            ? "Enter a value to convert"
            : `${formatNumber(Number(value), 4)} ${fromUnit} = ${formatNumber(convertedValue, 6)} ${toUnit}`}
        </p>
      </div>
    </ToolCard>
  );
}

function FileSizeTool() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<SizeUnit>("MB");
  const [toUnit, setToUnit] = useState<SizeUnit>("GB");
  const [file, setFile] = useState<File | null>(null);

  const convertedValue = useMemo(() => {
    const parsed = Number(value);
    if (value.trim() === "" || Number.isNaN(parsed) || parsed < 0) return null;
    return convertFileSize(parsed, fromUnit, toUnit);
  }, [fromUnit, toUnit, value]);

  const fileMetrics = useMemo(() => {
    if (!file) return null;

    const bytes = file.size;
    return {
      name: file.name,
      type: file.type || "Unknown",
      bytes: formatNumber(bytes, 0),
      kb: formatNumber(convertFileSize(bytes, "Bytes", "KB"), 2),
      mb: formatNumber(convertFileSize(bytes, "Bytes", "MB"), 2),
      gb: formatNumber(convertFileSize(bytes, "Bytes", "GB"), 4),
    };
  }, [file]);

  return (
    <ToolCard title="File Size Converter" subtitle="Convert typed sizes, or inspect a real doc, image, audio, or video file from your device." icon="fas fa-hard-drive">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-white/38">Value</span>
              <input type="number" min="0" value={value} onChange={(event) => setValue(event.target.value)} placeholder="e.g. 250" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-white/38">From</span>
              <select value={fromUnit} onChange={(event) => setFromUnit(event.target.value as SizeUnit)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
                {sizeUnits.map((unit) => (
                  <option key={unit} value={unit} className="bg-white text-black">
                    {unit}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-white/38">To</span>
              <select value={toUnit} onChange={(event) => setToUnit(event.target.value as SizeUnit)} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
                {sizeUnits.map((unit) => (
                  <option key={unit} value={unit} className="bg-white text-black">
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Converted</p>
            <p className="mt-1 text-lg font-semibold text-cyan-300">
              {convertedValue === null
                ? "Enter a valid file size"
                : `${formatNumber(Number(value), 4)} ${fromUnit} = ${formatNumber(convertedValue, 6)} ${toUnit}`}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <MediaDropzone accept="*/*" onSelect={setFile} label="Inspect a real file" />

          {fileMetrics ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="truncate text-sm font-medium text-white">{fileMetrics.name}</p>
                <p className="mt-1 text-xs text-white/45">{fileMetrics.type}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TinyMetric label="Bytes" value={fileMetrics.bytes} />
                <TinyMetric label="KB" value={fileMetrics.kb} />
                <TinyMetric label="MB" value={fileMetrics.mb} />
                <TinyMetric label="GB" value={fileMetrics.gb} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ToolCard>
  );
}

function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [resizeMode, setResizeMode] = useState<"percent" | "width" | "height">("percent");
  const [resizeValue, setResizeValue] = useState("50");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputMeta, setOutputMeta] = useState<{ width: number; height: number; size: number } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) {
      setSourceUrl("");
      setWidth("");
      setHeight("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSourceUrl(objectUrl);

    const image = new Image();
    image.onload = () => {
      setWidth(String(image.naturalWidth));
      setHeight(String(image.naturalHeight));
    };
    image.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    return () => {
      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [outputUrl]);

  const result = useMemo(() => {
    const widthValue = Number(width);
    const heightValue = Number(height);
    const resizeNumber = Number(resizeValue);

    if (
      !Number.isFinite(widthValue) ||
      !Number.isFinite(heightValue) ||
      !Number.isFinite(resizeNumber) ||
      widthValue <= 0 ||
      heightValue <= 0 ||
      resizeNumber <= 0
    ) {
      return null;
    }

    let nextWidth = widthValue;
    let nextHeight = heightValue;

    if (resizeMode === "percent") {
      nextWidth = widthValue * (resizeNumber / 100);
      nextHeight = heightValue * (resizeNumber / 100);
    }

    if (resizeMode === "width") {
      nextWidth = resizeNumber;
      nextHeight = (heightValue / widthValue) * resizeNumber;
    }

    if (resizeMode === "height") {
      nextHeight = resizeNumber;
      nextWidth = (widthValue / heightValue) * resizeNumber;
    }

    return {
      width: Math.round(nextWidth),
      height: Math.round(nextHeight),
      ratio: `${Math.round(widthValue)}:${Math.round(heightValue)}`,
    };
  }, [height, resizeMode, resizeValue, width]);

  const resizeImage = async () => {
    if (!file || !result || !sourceUrl) return;

    setProcessing(true);

    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Unable to load image."));
        image.src = sourceUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = result.width;
      canvas.height = result.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Unable to prepare image canvas.");

      ctx.drawImage(image, 0, 0, result.width, result.height);

      const mimeType = file.type || "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), mimeType, mimeType === "image/jpeg" || mimeType === "image/webp" ? 0.92 : undefined);
      });

      if (!blob) throw new Error("Unable to export resized image.");

      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }

      const nextUrl = URL.createObjectURL(blob);
      setOutputUrl(nextUrl);
      setOutputMeta({ width: result.width, height: result.height, size: blob.size });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolCard title="Image Resizer" subtitle="Upload a real image, resize it in the browser, preview it, and download the new version." icon="fas fa-image">
      <div className="space-y-4">
        <MediaDropzone accept="image/*" onSelect={setFile} label="Choose an image to resize" />

        {file ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/38">Original Width</span>
                <input type="number" min="1" value={width} onChange={(event) => setWidth(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/38">Original Height</span>
                <input type="number" min="1" value={height} onChange={(event) => setHeight(event.target.value)} className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/38">Resize By</span>
                <select value={resizeMode} onChange={(event) => setResizeMode(event.target.value as "percent" | "width" | "height")} className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm">
                  <option value="percent" className="bg-white text-black">Percentage</option>
                  <option value="width" className="bg-white text-black">Target Width</option>
                  <option value="height" className="bg-white text-black">Target Height</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/38">
                  {resizeMode === "percent" ? "Scale %" : resizeMode === "width" ? "Target Width" : "Target Height"}
                </span>
                <input type="number" min="1" value={resizeValue} onChange={(event) => setResizeValue(event.target.value)} placeholder={resizeMode === "percent" ? "e.g. 50" : "e.g. 1280"} className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <TinyMetric label="New Width" value={result ? `${result.width}px` : "--"} />
              <TinyMetric label="New Height" value={result ? `${result.height}px` : "--"} />
              <TinyMetric label="Aspect Ratio" value={result?.ratio ?? "--"} />
            </div>

            <button type="button" onClick={resizeImage} disabled={!result || processing} className="btn-sage w-full py-3 disabled:opacity-40">
              {processing ? "Resizing..." : "Resize Image"}
            </button>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/32">Original</p>
                {sourceUrl ? <img src={sourceUrl} alt="Original upload" className="max-h-[280px] w-full rounded-2xl object-contain" /> : null}
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/32">Resized</p>
                {outputUrl ? (
                  <div className="space-y-3">
                    <img src={outputUrl} alt="Resized output" className="max-h-[280px] w-full rounded-2xl object-contain" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <TinyMetric label="Width" value={`${outputMeta?.width ?? 0}px`} />
                      <TinyMetric label="Height" value={`${outputMeta?.height ?? 0}px`} />
                      <TinyMetric label="Size" value={outputMeta ? `${formatNumber(convertFileSize(outputMeta.size, "Bytes", "MB"), 2)} MB` : "--"} />
                    </div>
                    <a
                      href={outputUrl}
                      download={file.name.replace(/(\.[^.]+)?$/, "-resized$1")}
                      className="btn-sage block w-full py-3 text-center"
                    >
                      Download Resized Image
                    </a>
                  </div>
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/45">
                    Resized preview will appear here
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </ToolCard>
  );
}

function ResolutionTool() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "unknown">("unknown");

  useEffect(() => {
    if (!file) {
      setWidth("");
      setHeight("");
      setMediaType("unknown");
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      setMediaType("image");
      const image = new Image();
      image.onload = () => {
        setWidth(String(image.naturalWidth));
        setHeight(String(image.naturalHeight));
      };
      image.src = objectUrl;
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setWidth(String(video.videoWidth));
        setHeight(String(video.videoHeight));
      };
      video.src = objectUrl;
    } else {
      setMediaType("unknown");
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const result = useMemo(() => {
    const widthValue = Number(width);
    const heightValue = Number(height);

    if (!Number.isFinite(widthValue) || !Number.isFinite(heightValue) || widthValue <= 0 || heightValue <= 0) {
      return null;
    }

    const pixels = widthValue * heightValue;
    const megapixels = pixels / 1_000_000;
    const aspectRatio = widthValue / heightValue;

    let nearestPreset = "Custom";
    const presets = [
      { label: "720p", width: 1280, height: 720 },
      { label: "1080p", width: 1920, height: 1080 },
      { label: "1440p", width: 2560, height: 1440 },
      { label: "4K", width: 3840, height: 2160 },
      { label: "Instagram Portrait", width: 1080, height: 1350 },
    ];

    let bestDistance = Number.POSITIVE_INFINITY;
    for (const preset of presets) {
      const distance = Math.abs(preset.width - widthValue) + Math.abs(preset.height - heightValue);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearestPreset = preset.label;
      }
    }

    return {
      pixels,
      megapixels,
      aspectLabel: `${formatNumber(aspectRatio, 2)}:1`,
      nearestPreset,
    };
  }, [height, width]);

  return (
    <ToolCard title="Resolution Inspector" subtitle="Load a real image or video file and inspect its actual dimensions, aspect ratio, and nearest common preset." icon="fas fa-expand">
      <div className="space-y-4">
        <MediaDropzone accept="image/*,video/*" onSelect={setFile} label="Choose an image or video" />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.16em] text-white/38">Width</span>
            <input type="number" min="1" value={width} onChange={(event) => setWidth(event.target.value)} placeholder="e.g. 1920" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.16em] text-white/38">Height</span>
            <input type="number" min="1" value={height} onChange={(event) => setHeight(event.target.value)} placeholder="e.g. 1080" className="sage-input mt-1.5 w-full rounded-2xl py-3 text-sm" />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <TinyMetric label="Type" value={file ? (mediaType === "unknown" ? file.type || "Unknown" : mediaType) : "--"} />
          <TinyMetric label="Pixels" value={result ? formatNumber(result.pixels, 0) : "--"} />
          <TinyMetric label="Megapixels" value={result ? formatNumber(result.megapixels, 2) : "--"} />
          <TinyMetric label="Aspect" value={result?.aspectLabel ?? "--"} />
        </div>

        <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Nearest Preset</p>
          <p className="mt-1 text-lg font-semibold text-cyan-300">{result?.nearestPreset ?? "Choose a file or enter a resolution"}</p>
        </div>
      </div>
    </ToolCard>
  );
}

export default function ToolsPage() {
  const [category, setCategory] = useState<ToolCategory>("money");
  const [tool, setTool] = useState<ToolId>("currency");

  const availableTools = toolsByCategory[category];

  useEffect(() => {
    if (!availableTools.some((item) => item.id === tool)) {
      setTool(availableTools[0].id);
    }
  }, [availableTools, tool]);

  const selectedTool = availableTools.find((item) => item.id === tool) ?? availableTools[0];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,rgba(8,21,32,0.98),rgba(4,13,20,0.96))] px-4 py-5 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:px-5 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200">
              <i className="fas fa-sparkles text-[10px]" />
              Practical Utilities
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-[30px]">Sage Tools</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/56 sm:text-[15px]">
              Built for everyday decisions: money, travel, health, and quick conversions that solve real small problems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[360px]">
            <TinyMetric label="Categories" value={String(categoryOptions.length)} />
            <TinyMetric label="Tools" value={String(Object.values(toolsByCategory).flat().length)} />
            <TinyMetric label="Selected" value={selectedTool.label} />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,21,32,0.96),rgba(4,13,20,0.94))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.16em] text-white/38">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ToolCategory)}
              className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm"
            >
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id} className="bg-white text-black">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.16em] text-white/38">Tool</span>
            <select
              value={tool}
              onChange={(event) => setTool(event.target.value as ToolId)}
              className="sage-input mt-1.5 w-full rounded-2xl bg-transparent py-3 text-sm"
            >
              {availableTools.map((option) => (
                <option key={option.id} value={option.id} className="bg-white text-black">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {availableTools.map((option) => {
            const active = option.id === tool;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTool(option.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-cyan-400/25 bg-cyan-400/12 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/68 hover:text-white"
                }`}
              >
                <i className={`${option.icon} text-[11px]`} />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {tool === "currency" ? <CurrencyTool /> : null}
      {tool === "loan" ? <LoanTool /> : null}
      {tool === "discount" ? <DiscountTool /> : null}
      {tool === "bmi" ? <BmiTool /> : null}
      {tool === "fuel" ? <FuelTool /> : null}
      {tool === "unit" ? <UnitTool /> : null}
      {tool === "file-size" ? <FileSizeTool /> : null}
      {tool === "image-resizer" ? <ImageResizerTool /> : null}
      {tool === "resolution" ? <ResolutionTool /> : null}
    </div>
  );
}
