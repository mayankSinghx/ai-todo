"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startChat, getPosts } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, Send, Bot, User, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";


export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const { data: postsData } = useQuery({
    queryKey: ["posts", token],
    queryFn: () => getPosts(token!),
    enabled: !!token,
    refetchInterval: 5000,
  });

  const chatMutation = useMutation({
    mutationFn: () => startChat(prompt, token!),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.message },
      ]);
      setPrompt("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      localStorage.removeItem("token");
      toast.error(error.response?.data?.message || "Session expired. Please log in again.");
      router.push("/login");
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    chatMutation.mutate();
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };



  if (!token) return null;

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8 font-sans">
      <div className="max-w-7xl mx-auto h-full flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-black font-display gradient-text tracking-tight">System Overview</h1>
          <p className="text-foreground-muted text-sm font-medium tracking-wide">AI-Powered Task Orchestration & Intelligence Feed</p>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-14rem)]">
          {/* Chat Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 flex flex-col glass rounded-3xl overflow-hidden border-white/5 h-full group/chat"
          >
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm tracking-tight text-white">Logic Engine</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-foreground-muted gap-4 opacity-40">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                    <Bot className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold tracking-widest uppercase">Initializing Interface...</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                        : "bg-white/10"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed transition-all",
                      msg.role === "user"
                        ? "bg-indigo-500/90 text-white rounded-tr-none shadow-xl shadow-indigo-500/10"
                        : "bg-white/5 border border-white/10 text-foreground rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5">
              <form onSubmit={handleSend} className="relative group/input">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask the system..."
                  className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-white placeholder:text-foreground-muted/50 text-sm font-medium"
                  disabled={chatMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={chatMutation.isPending || !prompt.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-90"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 flex flex-col glass rounded-3xl overflow-hidden border-white/5 h-full"
          >
            <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Layout className="w-4 h-4" />
                </div>
                <h2 className="font-display font-bold text-sm text-white tracking-tight">Active Records</h2>
              </div>
              <span className="text-[10px] font-black bg-white/10 border border-white/10 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                {postsData?.posts?.length || 0} Entities
              </span>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-sm border-separate border-spacing-0">
                <thead className="bg-white/5 text-foreground-muted sticky top-0 z-10">
                  <tr>
                    <th className="p-5 font-black text-[10px] uppercase tracking-widest border-b border-white/5">Link</th>
                    <th className="p-5 font-black text-[10px] uppercase tracking-widest border-b border-white/5">Subject</th>
                    <th className="p-5 font-black text-[10px] uppercase tracking-widest border-b border-white/5">Descriptor</th>
                    <th className="p-5 font-black text-[10px] uppercase tracking-widest border-b border-white/5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {postsData?.posts?.map((post: any) => (
                    <tr key={post.id} className="group hover:bg-white/[0.02] transition-colors cursor-default">
                      <td className="p-5">
                        <span className="font-mono text-[10px] text-indigo-400 font-bold opacity-60">#{String(post.id).slice(-6)}</span>
                      </td>
                      <td className="p-5 font-bold text-white tracking-tight">{post.title}</td>
                      <td className="p-5 text-foreground-muted max-w-xs truncate group-hover:text-foreground transition-colors">
                        {post.content}
                      </td>
                      <td className="p-5 text-foreground-muted whitespace-nowrap text-[10px] font-black uppercase tracking-tighter opacity-70">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                  {(!postsData?.posts || postsData.posts.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-foreground-muted">
                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-30">No Data Synchronized</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

