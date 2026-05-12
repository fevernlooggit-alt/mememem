"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MODULES, type ModuleId } from "@/lib/prompts";

type Status = "idle" | "running" | "done" | "error";

export default function Home() {
  const [module, setModule] = useState<ModuleId>("intake");
  const [userInput, setUserInput] = useState("");
  const [effort, setEffort] = useState<"low" | "medium" | "high" | "max">(
    "high",
  );
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("文件超过 5 MB 限制");
      return;
    }
    const text = await file.text();
    setUserInput((prev) =>
      prev ? `${prev}\n\n--- ${file.name} ---\n${text}` : text,
    );
    setErrorMsg(null);
  }

  async function run() {
    if (!userInput.trim()) {
      setErrorMsg("请先粘贴或上传内容");
      return;
    }
    setOutput("");
    setUsage(null);
    setErrorMsg(null);
    setStatus("running");

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, userInput, effort }),
        signal: ac.signal,
      });

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf("\n\n")) !== -1) {
          const raw = buf.slice(0, nl);
          buf = buf.slice(nl + 2);
          const lines = raw.split("\n");
          const event = lines
            .find((l) => l.startsWith("event:"))
            ?.slice(6)
            .trim();
          const dataLine = lines.find((l) => l.startsWith("data:"))?.slice(5);
          if (!event || !dataLine) continue;
          let data: any;
          try {
            data = JSON.parse(dataLine);
          } catch {
            continue;
          }
          if (event === "delta") setOutput((o) => o + (data.text ?? ""));
          else if (event === "done") {
            setUsage(data.usage ?? null);
            setStatus("done");
          } else if (event === "error") {
            setErrorMsg(data.message ?? "Unknown error");
            setStatus("error");
          }
        }
      }
      if (status === "running") setStatus("done");
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErrorMsg(e?.message ?? String(e));
      setStatus("error");
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setStatus("idle");
  }

  function downloadMd() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${module}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const cfg = MODULES[module];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">CS Intel Workflow</h1>
        <p className="text-sm text-slate-600">
          客服情报聚合工作流 — 上传游戏组发布物、新需求、数值改动等，得到结构化分析报告。
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">选择模块</label>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value as ModuleId)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            disabled={status === "running"}
          >
            {(Object.keys(MODULES) as ModuleId[]).map((m) => (
              <option key={m} value={m}>
                {MODULES[m].label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-600">{cfg.description}</p>
          <p className="mt-1 text-xs text-slate-500">提示：{cfg.inputHint}</p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            输入内容（粘贴文本，或上传 .md / .txt / .csv 文件追加）
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="把游戏组邮件、patch notes、需求工单等粘贴到这里..."
            rows={10}
            disabled={status === "running"}
            className="w-full resize-y rounded-md border border-slate-300 bg-white p-3 font-mono text-xs focus:border-slate-500 focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-3">
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.log"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              disabled={status === "running"}
              className="text-xs"
            />
            <span className="text-xs text-slate-500">
              {userInput.length.toLocaleString()} 字符
            </span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">Effort:</label>
          <select
            value={effort}
            onChange={(e) => setEffort(e.target.value as typeof effort)}
            disabled={status === "running"}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="low">low（快/省）</option>
            <option value="medium">medium</option>
            <option value="high">high（推荐）</option>
            <option value="max">max（最仔细）</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={run}
            disabled={status === "running"}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400"
          >
            {status === "running" ? "处理中..." : "运行模块"}
          </button>
          {status === "running" && (
            <button
              onClick={cancel}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              取消
            </button>
          )}
          {output && status !== "running" && (
            <button
              onClick={downloadMd}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              下载 .md
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            ⚠ {errorMsg}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium">输出</h2>
          {usage && (
            <div className="text-xs text-slate-500">
              tokens: in {usage.input_tokens ?? 0} / out{" "}
              {usage.output_tokens ?? 0}
              {usage.cache_read_input_tokens
                ? ` / cache-read ${usage.cache_read_input_tokens}`
                : ""}
            </div>
          )}
        </div>
        {output ? (
          <article className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
          </article>
        ) : (
          <p className="text-sm text-slate-500">
            {status === "running"
              ? "等待第一个 token..."
              : "运行后报告会显示在这里。"}
          </p>
        )}
      </section>

      <footer className="mt-6 text-center text-xs text-slate-500">
        模型 claude-opus-4-7 · 系统提示已启用 prompt caching · 无新建积累式存储，
        每次请求互相独立
      </footer>
    </main>
  );
}
