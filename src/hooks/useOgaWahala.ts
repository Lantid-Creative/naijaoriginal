import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oga-wahala`;
const ESCALATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/escalate-ticket`;

export const useOgaWahala = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, session } = useAuth();

  const escalateToAdmin = useCallback(async (conversationSummary: string, userMessage: string) => {
    if (!session?.access_token) return;
    try {
      await fetch(ESCALATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ conversationSummary, userMessage }),
      });
      toast.success("Your issue has been escalated to our team! We'll get back to you soon. 🙏");
    } catch {
      toast.error("Failed to escalate. Please try again.");
    }
  }, [session]);

  const send = useCallback(async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          userId: user?.id || null,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        toast.error(err.error || "Oga Wahala no fit respond right now");
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Check for escalation
      if (assistantSoFar.includes("[ESCALATE]")) {
        const summary = newMessages.map(m => `${m.role}: ${m.content}`).join("\n");
        await escalateToAdmin(summary, input);
      }
    } catch (e) {
      console.error("Chat error:", e);
      toast.error("Connection lost. Try again!");
    } finally {
      setIsLoading(false);
    }
  }, [messages, user, escalateToAdmin]);

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, isLoading, send, clearChat };
};
