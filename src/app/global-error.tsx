"use client";

/** Last-resort boundary for errors thrown by the root layout itself (renders its own <html>). */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fbfbfe",
          color: "#1a1a2e",
        }}
      >
        <main style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>CodeAssess is temporarily unavailable</h1>
          <p style={{ color: "#5b5b72", marginBottom: 20 }}>
            A critical error occurred while loading the app.{error.digest ? ` (Ref: ${error.digest})` : ""}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#4f46e5",
              color: "white",
              border: 0,
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
