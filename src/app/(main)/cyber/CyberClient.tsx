"use client";

import { useEffect, useState } from "react";

interface CurrentUser {
  id: string;
  username: string;
}

const FREENET_SERVERS = [
  { label: "SA server 3 (Faster - 2days)", value: "sa3.vpnjantit.com" },
  { label: "SA server 2 (Faster unstable - 4 days)", value: "sa2.vpnjantit.com" },
  { label: "Germany server 5 (Fair - 7days)", value: "gr5.vpnjantit.com" },
  { label: "Germany server 6 (Fair - 7days)", value: "gr6.vpnjantit.com" },
  { label: "Germany server 7 (Fair - 7days)", value: "gr7.vpnjantit.com" },
];

export default function CyberClient({ currentUser }: { currentUser: CurrentUser | null }) {
  const [showFreenet, setShowFreenet] = useState(false);
  const [freenetUsername, setFreenetUsername] = useState("");
  const [freenetPassword, setFreenetPassword] = useState("");
  const [freenetServer, setFreenetServer] = useState("");
  const [freenetPayload, setFreenetPayload] = useState("");
  const [freenetCopied, setFreenetCopied] = useState(false);
  const [freenetBtnMsg, setFreenetBtnMsg] = useState("Generate payload");
  const [copyBtnMsg, setCopyBtnMsg] = useState("Copy payload");

  useEffect(() => {
    const remembered = window.localStorage.getItem("freenetServer");
    if (remembered) setFreenetServer(remembered);
    else window.localStorage.setItem("freenetServer", "none");
  }, []);

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

  return (
    <div className="text-sm text-white">
      <div className="mb-3 rounded-[22px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(8,20,27,0.96),rgba(4,12,18,0.96))] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200">
            <i className="fa fa-lock text-[10px]" />
            SageCyber
          </div>
          <p className="mt-2 max-w-[460px] text-xs leading-5 text-white/58">
            Free internet utilities and quick cyber helper tools in one place.
          </p>
        </div>

      </div>

      {!currentUser && (
        <div className="mb-3 rounded-[18px] border border-cyan-700/25 bg-cyan-900/10 p-3 text-xs leading-5 text-white/72">
          Public cyber tools are available here without login.
        </div>
      )}

      <section className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white">Tools</h2>
          <p className="mt-1 text-xs leading-5 text-white/62">
            Generate HTTP Custom VPN payloads or download ready-made config files.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="grid w-full grid-cols-[24px_minmax(0,1fr)] items-center gap-2 rounded-[18px] border border-white/[0.06] bg-black/25 px-3 py-3 text-left text-white/78 transition-colors hover:text-cyan-400"
            onClick={() => setShowFreenet(true)}
          >
            <i className="fa fa-globe" />
            <span>Generate HTTP Custom VPN freenet</span>
          </button>

          <a
            href="https://t.me/sageTechh"
            target="_blank"
            rel="noreferrer"
            className="grid grid-cols-[24px_minmax(0,1fr)] items-center gap-2 rounded-[18px] border border-white/[0.06] bg-black/25 px-3 py-3 text-white/78 transition-colors hover:text-cyan-400"
          >
            <i className="fa fa-download" />
            <span>Download free internet config files (Telegram)</span>
          </a>
        </div>
      </section>

      {showFreenet && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-2 pt-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFreenet(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded bg-white p-5 text-black">
            <button
              onClick={() => setShowFreenet(false)}
              className="float-right px-2 font-bold text-black/60 hover:text-black"
            >
              X
            </button>
            <br />
            <div className="mb-4 rounded border border-black/30 p-3 text-sm">
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
                      className="text-[15px] text-blue-700 underline"
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
                <label className="mb-1 block text-xs font-medium">Username</label>
                <input
                  className="w-full rounded border border-black/20 p-2 outline-none"
                  value={freenetUsername}
                  onChange={(e) => setFreenetUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Password</label>
                <input
                  className="w-full rounded border border-black/20 p-2 outline-none"
                  value={freenetPassword}
                  onChange={(e) => setFreenetPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Server</label>
                <input
                  className="w-full rounded border border-black/20 p-2 outline-none"
                  value={freenetServer}
                  onChange={(e) => setFreenetServer(e.target.value)}
                  placeholder="e.g. sa3.vpnjantit.com"
                />
              </div>
              <button
                onClick={generateFreenetPayload}
                className="rounded bg-blue-800 px-5 py-2 text-sm text-white"
              >
                {freenetBtnMsg}
              </button>
              {freenetPayload && (
                <div className="mt-3 space-y-2">
                  <textarea
                    readOnly
                    className="h-16 w-full resize-none rounded border border-black/20 p-2 text-xs"
                    value={freenetPayload}
                  />
                  <button
                    onClick={copyFreenetPayload}
                    className="rounded bg-blue-900 px-5 py-2 text-sm text-white"
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
