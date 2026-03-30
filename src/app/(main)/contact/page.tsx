"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "sent" : "error");
    showToast({
      type: res.ok ? "success" : "error",
      message: res.ok ? "Message sent successfully." : "Failed to send message.",
    });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <h1 className="text-lg font-bold text-white mb-4">
        <i className="fas fa-envelope text-cyan-400 mr-2" />Contact Us
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {/* Contact Info */}
        <div className="sage-card">
          <h2 className="text-base font-bold text-white mb-3">Get In Touch</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <i className="fas fa-phone text-cyan-400 w-4" />
              <span className="text-white/70">+260 763 428 450</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fab fa-whatsapp text-green-400 w-4" />
              <span className="text-white/70">WhatsApp: +260 763 428 450</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-globe text-cyan-400 w-4" />
              <span className="text-white/70">sageteche.com</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        {status === "sent" ? (
          <div className="sage-card text-center py-8">
            <i className="fas fa-check-circle text-4xl text-green-400 mb-3" />
            <p className="text-white font-bold">Message sent!</p>
            <p className="text-white/50 text-sm mt-1">We'll get back to you soon.</p>
            <button onClick={() => { setStatus("idle"); setForm({ name: "", email: "", phone: "", message: "" }); }} className="btn-sage mt-4 px-6">Send another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="sage-card space-y-3">
            <h2 className="text-base font-bold text-white mb-2">Send a Message</h2>

            {status === "error" && (
              <p className="text-red-400 text-sm">Failed to send. Please try again.</p>
            )}

            <div>
              <label className="text-xs text-white/50">Your Name *</label>
              <input type="text" value={form.name} onChange={set("name")} required className="sage-input text-sm py-2 mt-1 w-full" />
            </div>
            <div>
              <label className="text-xs text-white/50">Email</label>
              <input type="email" value={form.email} onChange={set("email")} className="sage-input text-sm py-2 mt-1 w-full" />
            </div>
            <div>
              <label className="text-xs text-white/50">Phone</label>
              <input type="tel" value={form.phone} onChange={set("phone")} className="sage-input text-sm py-2 mt-1 w-full" />
            </div>
            <div>
              <label className="text-xs text-white/50">Message *</label>
              <textarea value={form.message} onChange={set("message")} required rows={4} className="post-textarea mt-1 text-sm" />
            </div>

            <button type="submit" disabled={status === "sending"} className="btn-sage w-full">
              {status === "sending" ? <><i className="fas fa-spinner fa-spin mr-1" /> Sending...</> : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
