"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Sentry Test Page</h1>
      <p>Click the button below to trigger a test error that will be reported to Sentry.</p>
      <button
        type="button"
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          background: "#1A2A40",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
          fontSize: "1rem",
        }}
        onClick={() => {
          Sentry.captureException(new Error("Sentry Test Error — fired from /sentry-example-page"));
        }}
      >
        Fire Test Error
      </button>
    </div>
  );
}
