"use client";
import { useState } from "react";

export default function Home() {
  const [bufferedResult, setBufferedResult] = useState("");
  const [streamingResult, setStreamingResult] = useState("");
  const [bufferedTime, setBufferedTime] = useState<number | null>(null);
  const [streamingTime, setStreamingTime] = useState<number | null>(null);
  const [streamingTtfb, setStreamingTtfb] = useState<number | null>(null);
  const [bufferedLoading, setBufferedLoading] = useState(false);
  const [streamingLoading, setStreamingLoading] = useState(false);

  async function testBuffered() {
    setBufferedResult("");
    setBufferedTime(null);
    setBufferedLoading(true);
    const start = Date.now();

    const res = await fetch("/api/buffered");
    const data = await res.json();

    setBufferedTime(Date.now() - start);
    setBufferedResult(JSON.stringify(data, null, 2));
    setBufferedLoading(false);
  }

  async function testStreaming() {
    setStreamingResult("");
    setStreamingTime(null);
    setStreamingTtfb(null);
    setStreamingLoading(true);
    const start = Date.now();
    let ttfbRecorded = false;

    const res = await fetch("/api/streaming");
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (!ttfbRecorded) {
        setStreamingTtfb(Date.now() - start);
        ttfbRecorded = true;
      }

      setStreamingResult(prev => prev + decoder.decode(value));
    }

    setStreamingTime(Date.now() - start);
    setStreamingLoading(false);
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", maxWidth: 1100 }}>
      <h1 style={{ marginBottom: 8 }}>Buffered vs Streaming Test</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Simulates how Nginx handles buffered Lambda responses vs streaming pass-through
      </p>

      <div style={{ display: "flex", gap: 40 }}>
        {/* Buffered */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 4 }}>Buffered</h2>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
            Nothing appears until Lambda fully responds (3s delay)
          </p>
          <button
            onClick={testBuffered}
            disabled={bufferedLoading}
            style={{ padding: "8px 16px", cursor: bufferedLoading ? "not-allowed" : "pointer" }}
          >
            {bufferedLoading ? "Waiting for full response..." : "Test Buffered"}
          </button>
          <div style={{ marginTop: 8, fontSize: 13, minHeight: 40 }}>
            {bufferedTime && <p style={{ margin: 0 }}>⏱ Total: <strong>{bufferedTime}ms</strong></p>}
            {bufferedLoading && <p style={{ margin: 0, color: "#888" }}>⏳ Blocking — nothing until done...</p>}
          </div>
          <pre style={{
            background: "#f4f4f4",
            color: "#171717",
            padding: 16,
            minHeight: 300,
            overflow: "auto",
            fontSize: 12,
            borderRadius: 6,
            marginTop: 8
          }}>
            {bufferedResult || (bufferedLoading ? "" : "— click button to test —")}
          </pre>
        </div>

        {/* Streaming */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 4 }}>Streaming</h2>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
            Each line appears as it arrives (~700ms between chunks)
          </p>
          <button
            onClick={testStreaming}
            disabled={streamingLoading}
            style={{ padding: "8px 16px", cursor: streamingLoading ? "not-allowed" : "pointer" }}
          >
            {streamingLoading ? "Streaming..." : "Test Streaming"}
          </button>
          <div style={{ marginTop: 8, fontSize: 13, minHeight: 40 }}>
            {streamingTtfb && <p style={{ margin: 0 }}>⚡ TTFB: <strong>{streamingTtfb}ms</strong></p>}
            {streamingTime && <p style={{ margin: 0 }}>⏱ Total: <strong>{streamingTime}ms</strong></p>}
            {streamingLoading && !streamingTtfb && <p style={{ margin: 0, color: "#888" }}>⏳ Waiting for first chunk...</p>}
          </div>
          <pre style={{
            background: "#f4f4f4",
            color: "#171717",
            padding: 16,
            minHeight: 300,
            overflow: "auto",
            fontSize: 12,
            borderRadius: 6,
            marginTop: 8
          }}>
            {streamingResult || (streamingLoading ? "" : "— click button to test —")}
          </pre>
        </div>
      </div>
    </div>
  );
}