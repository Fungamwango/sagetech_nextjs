"use client";

import { useState } from "react";

// USD to ZMW (Zambian Kwacha) rate
const USD_TO_ZMW = 18.97;

// Unit converter
const conversions: Record<string, { units: string[]; convert: (val: number, from: string, to: string) => number }> = {
  temperature: {
    units: ["Celsius", "Fahrenheit", "Kelvin"],
    convert: (val, from, to) => {
      let c = val;
      if (from === "Fahrenheit") c = (val - 32) * 5/9;
      else if (from === "Kelvin") c = val - 273.15;
      if (to === "Celsius") return c;
      if (to === "Fahrenheit") return c * 9/5 + 32;
      return c + 273.15;
    },
  },
  distance: {
    units: ["Meters", "Kilometers", "Miles", "Feet", "Inches", "Centimeters", "Millimeters"],
    convert: (val, from, to) => {
      const toM: Record<string, number> = { Meters: 1, Kilometers: 1000, Miles: 1609.34, Feet: 0.3048, Inches: 0.0254, Centimeters: 0.01, Millimeters: 0.001 };
      return (val * toM[from]) / toM[to];
    },
  },
  weight: {
    units: ["Kilograms", "Grams", "Pounds", "Ounces"],
    convert: (val, from, to) => {
      const toKg: Record<string, number> = { Kilograms: 1, Grams: 0.001, Pounds: 0.453592, Ounces: 0.0283495 };
      return (val * toKg[from]) / toKg[to];
    },
  },
};

export default function ToolsPage() {
  const [category, setCategory] = useState("temperature");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("Celsius");
  const [toUnit, setToUnit] = useState("Fahrenheit");
  const [result, setResult] = useState<string | null>(null);

  // Currency converter state
  const [usdAmount, setUsdAmount] = useState("");
  const [currencyDirection, setCurrencyDirection] = useState<"usd_to_zmw" | "zmw_to_usd">("usd_to_zmw");
  const [currencyResult, setCurrencyResult] = useState<string | null>(null);

  const handleCurrencyConvert = () => {
    const v = parseFloat(usdAmount);
    if (isNaN(v)) { setCurrencyResult("Please enter a valid number"); return; }
    if (currencyDirection === "usd_to_zmw") {
      setCurrencyResult(`$${v} USD = K${(v * USD_TO_ZMW).toFixed(2)} ZMW`);
    } else {
      setCurrencyResult(`K${v} ZMW = $${(v / USD_TO_ZMW).toFixed(2)} USD`);
    }
  };

  const handleConvert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult("Please enter a valid number"); return; }
    const conv = conversions[category];
    const r = conv.convert(v, fromUnit, toUnit);
    setResult(`${v} ${fromUnit} = ${r.toFixed(4)} ${toUnit}`);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const units = conversions[cat].units;
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setResult(null);
    setValue("");
  };

  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-1">
        <i className="fas fa-tools text-cyan-400 mr-2" />Tools
      </h1>
      <p className="text-sm text-white/50 mb-4">Useful utility tools</p>

      {/* Unit Converter */}
      <div className="sage-card mb-4">
        <h2 className="text-base font-bold text-white mb-3">
          <i className="fas fa-exchange-alt text-cyan-400 mr-2" />Unit Converter
        </h2>

        <div className="mb-4 flex flex-wrap gap-2">
          {Object.keys(conversions).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
                category === cat ? "bg-[#006688] text-white" : "border border-white/30 text-white/60 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div>
            <label className="text-xs text-white/50">Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              className="sage-input text-sm py-1.5 mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-xs text-white/50">From</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="sage-input text-sm py-1.5 mt-1 w-full bg-transparent"
            >
              {conversions[category].units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50">To</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="sage-input text-sm py-1.5 mt-1 w-full bg-transparent"
            >
              {conversions[category].units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={handleConvert} className="btn-sage w-full mb-3">Convert</button>

        {result && (
          <div className="text-center bg-black/20 rounded-lg p-3 border border-cyan-800/30">
            <p className="text-cyan-400 font-bold text-lg">{result}</p>
          </div>
        )}
      </div>

      {/* Currency Converter */}
      <div className="sage-card mb-4">
        <h2 className="text-base font-bold text-white mb-3">
          <i className="fas fa-dollar-sign text-cyan-400 mr-2" />Currency Converter
        </h2>
        <p className="text-xs text-white/40 mb-3">Rate: $1 USD = K{USD_TO_ZMW} ZMW (Zambian Kwacha)</p>

        <div className="mb-3 flex flex-wrap gap-2">
          {(["usd_to_zmw", "zmw_to_usd"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => { setCurrencyDirection(dir); setCurrencyResult(null); }}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                currencyDirection === dir ? "bg-[#006688] text-white" : "border border-white/30 text-white/60 hover:text-white"
              }`}
            >
              {dir === "usd_to_zmw" ? "USD → ZMW" : "ZMW → USD"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-white/50">{currencyDirection === "usd_to_zmw" ? "Amount (USD $)" : "Amount (ZMW K)"}</label>
            <input
              type="number"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              placeholder={currencyDirection === "usd_to_zmw" ? "Enter USD amount" : "Enter Kwacha amount"}
              className="sage-input text-sm py-1.5 mt-1 w-full"
            />
          </div>
        </div>

        <button onClick={handleCurrencyConvert} className="btn-sage w-full mb-3">Convert</button>

        {currencyResult && (
          <div className="text-center bg-black/20 rounded-lg p-3 border border-cyan-800/30">
            <p className="text-cyan-400 font-bold text-lg">{currencyResult}</p>
          </div>
        )}
      </div>

      {/* More tools */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sage-card text-center">
          <i className="fas fa-clock text-2xl text-cyan-400 mb-2" />
          <p className="text-sm font-bold text-white">Clock</p>
          <LiveClock />
        </div>
        <div className="sage-card text-center">
          <i className="fas fa-calculator text-2xl text-cyan-400 mb-2" />
          <p className="text-sm font-bold text-white">Word Counter</p>
          <WordCounter />
        </div>
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useState(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  });
  return <p className="text-xl text-cyan-400 font-mono mt-2">{time}</p>;
}

function WordCounter() {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div className="mt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type text..."
        className="post-textarea text-xs min-h-[60px]"
      />
      <p className="text-xs text-cyan-400 mt-1">Words: {words} | Chars: {text.length}</p>
    </div>
  );
}
