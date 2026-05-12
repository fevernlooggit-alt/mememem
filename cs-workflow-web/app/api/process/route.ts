import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, MODULES, type ModuleId } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = "claude-opus-4-7";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonError(500, "ANTHROPIC_API_KEY is not set on the server");
  }

  let body: { module?: ModuleId; userInput?: string; effort?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const { module, userInput } = body;
  const effort = body.effort ?? "high";

  if (!module || !(module in MODULES)) {
    return jsonError(400, `Unknown module: ${module}`);
  }
  if (!userInput || userInput.trim().length === 0) {
    return jsonError(400, "userInput is required");
  }
  if (userInput.length > 200_000) {
    return jsonError(
      413,
      `Input too long (${userInput.length} chars). Limit is 200,000.`,
    );
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(module);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        const result = client.messages.stream({
          model: MODEL,
          max_tokens: 16000,
          thinking: { type: "adaptive" },
          output_config: { effort: effort as "low" | "medium" | "high" | "max" },
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [
            {
              role: "user",
              content: `Module: ${module}\n\n---\n\nInput from operator:\n\n${userInput}`,
            },
          ],
        });

        result.on("text", (delta) => send("delta", { text: delta }));

        const finalMessage = await result.finalMessage();
        send("done", {
          stopReason: finalMessage.stop_reason,
          usage: finalMessage.usage,
        });
      } catch (err) {
        const message =
          err instanceof Anthropic.APIError
            ? `${err.status ?? ""} ${err.message}`.trim()
            : err instanceof Error
              ? err.message
              : "Unknown error";
        send("error", { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
