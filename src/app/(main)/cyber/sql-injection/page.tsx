"use client";

import { useState } from "react";
import Link from "next/link";

type Level = 1 | 2 | 3 | 4;

const HINTS: Record<Level, string> = {
  1: "Hint: The password field is directly inserted into the SQL query without sanitisation. Try using a SQL injection payload like: ' OR '1'='1",
  2: "Hint: The gender dropdown value is not sanitised. Try injecting into the gender field.",
  3: "Hint: The date field is inserted raw into a separate SQL statement. Try time-based or error-based injection.",
  4: "Hint: This level uses parameterised queries. SQL injection should not work here. This is how secure code should look!",
};

const LEARN_CONTENT = (
  <div className="space-y-4 text-sm text-white/80 leading-6">
    <h2 className="text-white font-bold text-base">What is SQL Injection?</h2>
    <p>
      SQL Injection (SQLi) is a web security vulnerability that allows attackers to interfere
      with the queries that an application makes to its database.
    </p>
    <h3 className="text-white font-semibold">How it works</h3>
    <p>
      When user input is directly inserted into a SQL query without sanitisation, an attacker can
      inject SQL code that changes the logic of the query.
    </p>
    <h3 className="text-white font-semibold">Example (vulnerable)</h3>
    <pre className="bg-black/40 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
{`SELECT * FROM users
WHERE password = '$password'
AND login_number = '$phone'`}
    </pre>
    <p>If a user enters <code className="bg-black/40 px-1 rounded">&apos; OR &apos;1&apos;=&apos;1</code> as their password, the query becomes:</p>
    <pre className="bg-black/40 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
{`SELECT * FROM users
WHERE password = '' OR '1'='1'
AND login_number = '...'`}
    </pre>
    <p>This always returns rows, bypassing authentication.</p>
    <h3 className="text-white font-semibold">Prevention</h3>
    <ul className="list-disc pl-5 space-y-1 text-xs">
      <li>Use parameterised queries / prepared statements</li>
      <li>Use an ORM (like Drizzle, Prisma, Hibernate)</li>
      <li>Validate and sanitise all user input</li>
      <li>Apply the principle of least privilege to DB accounts</li>
      <li>Use a Web Application Firewall (WAF)</li>
    </ul>
    <div className="mt-2">
      <Link href="/cyber" className="text-cyan-400 hover:underline text-xs">
        &larr; Back to Cyber
      </Link>
    </div>
  </div>
);

export default function SqlInjectionPage() {
  const [view, setView] = useState<"practice" | "learn">("practice");
  const [level, setLevel] = useState<Level>(1);
  const [showTopics, setShowTopics] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [date, setDate] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [btnMsg, setBtnMsg] = useState("Login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [dbError, setDbError] = useState("");

  function resetBtn() {
    setBtnMsg("Login");
    setDbError("");
  }

  function selectLevel(l: Level) {
    setLevel(l);
    setShowTopics(false);
    setLoggedIn(false);
    setLoginAttempts(0);
    setCooldown(0);
    resetBtn();
    setPhoneNumber("");
    setPassword("");
    setGender("male");
    setDate("");
    setShowHint(false);
    setDbError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loginAttempts >= 5) return;

    // Client-side validation
    if (level !== 2 && phoneNumber.trim().length < 9) {
      setBtnMsg("Phone number too short");
      setTimeout(resetBtn, 2000);
      return;
    }
    if (password.trim().length < 4) {
      setBtnMsg("Password is too short");
      setTimeout(resetBtn, 2000);
      return;
    }
    if (level === 2 && !gender) {
      setBtnMsg("Please select the gender");
      setTimeout(resetBtn, 2000);
      return;
    }

    setBtnMsg("Please wait..");
    setDbError("");

    const res = await fetch("/api/cyber/sqli-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, phoneNumber, password, gender, date }),
    });

    const data = await res.json();

    if (data.error) {
      setDbError(data.error);
      setBtnMsg("Login");
      return;
    }

    if (data.success) {
      setLoggedIn(true);
      setBtnMsg("Logged in successfully, Congratulations!");
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        setBtnMsg("Too many login attempts");
        let secs = 30;
        setCooldown(secs);
        const interval = setInterval(() => {
          secs--;
          setCooldown(secs);
          if (secs <= 0) {
            clearInterval(interval);
            setLoginAttempts(0);
            setCooldown(0);
            resetBtn();
          }
        }, 1000);
      } else {
        setBtnMsg(level === 1 ? "Wrong password or phone number" : "Wrong password, try again!");
        setTimeout(resetBtn, 2000);
      }
    }
  }

  return (
    <div className="text-white text-sm max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-4">
        <Link href="/cyber" className="text-white/50 hover:text-white text-xs">
          &larr; SageCyber
        </Link>
        <header className="mt-3">
          <div className="font-bold text-base mb-2">
            SQL<span className="text-cyan-400"> Injection Lab</span>
            <p className="text-white/50 text-xs font-normal mt-1">
              Note: All SQL errors here are deliberate for educational purposes!
            </p>
          </div>
          <ul className="flex gap-4 text-xs border-b border-white/10 pb-2">
            <li className="relative">
              <button
                className={`${view === "practice" ? "text-cyan-400" : "text-white/60 hover:text-white"}`}
                onClick={() => { setView("practice"); setShowTopics(false); }}
              >
                Practice <span className="text-white/40">level {level}</span>
                <i
                  className="fa fa-chevron-down ml-1 text-[10px]"
                  onClick={(e) => { e.stopPropagation(); setShowTopics((v) => !v); }}
                />
              </button>
              {showTopics && (
                <ul className="absolute top-full left-0 bg-gray-900 border border-white/10 rounded shadow-lg z-10 w-40 mt-1">
                  {([1, 2, 3, 4] as Level[]).map((l) => (
                    <li
                      key={l}
                      className="px-3 py-2 cursor-pointer hover:bg-white/10 border-b border-white/5"
                      onClick={() => selectLevel(l)}
                    >
                      level {l}{" "}
                      <span className="text-white/40 text-[10px]">
                        ({["weak", "medium", "strong", "impossible"][l - 1]})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <button
                className={`${view === "learn" ? "text-cyan-400" : "text-white/60 hover:text-white"}`}
                onClick={() => { setView("learn"); setShowTopics(false); }}
              >
                Learn
              </button>
            </li>
            <li>
              <Link href="/cyber?scanner=1" className="text-white/60 hover:text-white">
                Scan
              </Link>
            </li>
          </ul>
        </header>
      </div>

      {/* Learn view */}
      {view === "learn" && LEARN_CONTENT}

      {/* Practice view */}
      {view === "practice" && (
        <>
          {loggedIn ? (
            <div
              id="logged-in-wrapper"
              className="bg-teal-900/40 border border-teal-600/30 p-4 rounded space-y-2"
            >
              <h2 className="font-bold text-base text-green-400">Logged in successfully!</h2>
              <p className="text-white/80 text-xs leading-5">
                Congratulations! You have successfully performed the SQL injection and logged in
                without any account credentials. We believe this will help you prevent attackers
                from performing this attack on your websites. Continue learning about SQL Injection
                attacks until you can bypass <em>level 3 (strong)</em> which is considered the
                impossible and very secure level.
              </p>
              <button
                className="text-cyan-400 text-xs underline mt-1"
                onClick={() => selectLevel(level)}
              >
                Try again
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              {dbError && (
                <div className="bg-red-900/40 border border-red-600/30 p-2 rounded text-xs text-red-300 font-mono break-all">
                  DB Error: {dbError}
                </div>
              )}

              {/* Phone (level 1, 3, 4) */}
              {level !== 2 && (
                <div>
                  <label className="block text-xs text-white/70 mb-1">Phone number</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white p-2 rounded outline-none"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loginAttempts >= 5}
                  />
                </div>
              )}

              {/* Gender (level 2) */}
              {level === 2 && (
                <div>
                  <label className="block text-xs text-white/70 mb-1">Gender</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 text-white p-2 rounded outline-none"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={loginAttempts >= 5}
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              )}

              {/* Date (level 3) */}
              {level === 3 && (
                <div>
                  <label className="block text-xs text-white/70 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/10 text-white p-2 rounded outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={loginAttempts >= 5}
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs text-white/70 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    className="w-full bg-white/5 border border-white/10 text-white p-2 rounded outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginAttempts >= 5}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginAttempts >= 5}
                className="w-full bg-teal-800 hover:bg-teal-700 disabled:opacity-40 text-white py-2 rounded text-sm"
              >
                {cooldown > 0 ? `${btnMsg} — try again in ${cooldown}s` : btnMsg}
              </button>

              {/* Hint toggle */}
              <div>
                <button
                  type="button"
                  className="text-xs text-white/40 hover:text-cyan-400"
                  onClick={() => setShowHint((v) => !v)}
                >
                  {showHint ? "Hide hint" : "Get the Hint:"}
                </button>
                {showHint && (
                  <p className="mt-1 text-xs text-yellow-300/80 bg-yellow-900/20 p-2 rounded border border-yellow-600/20">
                    {HINTS[level]}
                  </p>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
