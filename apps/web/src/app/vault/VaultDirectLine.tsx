"use client";

import type React from "react";
import { useState } from "react";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function VaultDirectLine() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/vault/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: text }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Failed to send message.");
        setStatus("error");
        return;
      }
      setText("");
      setStatus("sent");
    } catch {
      setErr("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <section className="rounded-2xl border border-[rgba(26,42,64,0.1)] bg-white p-6 shadow-[0_8px_30px_rgb(26,42,64,0.04)]">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-charcoal/45">
          Direct Line
        </p>
        <div className="mt-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/12 text-emerald-700">
            <CheckIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[1rem] font-semibold text-[#1a2a40]">
              Message secured. Anthony will review this shortly.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setErr(null);
              }}
              className="mt-4 text-[0.85rem] font-semibold text-[#5b7c99] underline-offset-2 hover:underline"
            >
              Send another message
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[rgba(26,42,64,0.1)] bg-white p-6 shadow-[0_8px_30px_rgb(26,42,64,0.04)]">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-charcoal/45">
        Direct Line
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-lg font-bold text-[#1a2a40]">
        Message Anthony
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/70">
        Priority notes from your vault land straight in the operator inbox.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-5 flex flex-col gap-4">
        <label htmlFor="vault-direct-line" className="sr-only">
          Message
        </label>
        <textarea
          id="vault-direct-line"
          name="message_text"
          required
          rows={5}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="What should Anthony know?"
          className="w-full resize-y rounded-xl border border-[rgba(26,42,64,0.12)] bg-[#f8f9fa] px-4 py-3 font-[family-name:var(--font-inter)] text-[0.95rem] leading-relaxed text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-[rgb(var(--brand-accent-rgb)/0.55)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand-accent-rgb)/0.2)]"
        />

        {status === "error" && err ? (
          <p className="text-sm text-rose-700" role="alert">
            {err}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "sending" || !text.trim()}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-[#5b7c99] px-5 py-3 text-[0.95rem] font-semibold text-[#f8f9fa] shadow-[0_8px_24px_-14px_rgba(26,42,64,0.35)] transition-colors hover:bg-[#1a2a40] disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>
    </section>
  );
}
