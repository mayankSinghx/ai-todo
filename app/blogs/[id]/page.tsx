"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Share2, Bookmark, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBlogById, saveBlog, API_URL } from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const API_BASE_URL = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;

export default function BlogReader() {
    const params = useParams();
    const queryClient = useQueryClient();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const { data, isLoading } = useQuery({
        queryKey: ["blog", id],
        queryFn: () => {
            const token = localStorage.getItem("token") || "";
            return getBlogById(id as string, token);
        },
        enabled: !!id,
    });

    const saveBlogMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to save blogs");
                throw new Error("No token found");
            }
            return saveBlog(id as string, token);
        },
        onSuccess: (data: any) => {
            if (data) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: ["blog", id] });
            }
        },
        onError: (error: any) => {
            console.error("Save blog failed:", error);
            toast.error(error.response?.data?.message || "Failed to save blog");
        },
    });

    const handleSave = () => {
        saveBlogMutation.mutate();
    };

    if (isLoading) {
        return (
            <main className="min-h-screen p-6 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-muted animate-pulse">Accessing Node Content…</p>
            </main>
        );
    }

    const blog = data?.blog;

    if (!blog) {
        return (
            <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <ArrowLeft className="w-8 h-8 text-foreground-muted opacity-20" />
                </div>
                <h2 className="text-2xl font-black font-display text-white tracking-tight">Intelligence Node Not Found</h2>
                <Link href="/blogs" className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-white transition-colors underline underline-offset-8">Return to Archive</Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen selection:bg-indigo-500/30 selection:text-white">
            <div className="max-w-5xl mx-auto px-8 py-16 md:py-32">
                {/* Navigation */}
                <nav className="flex items-center justify-between mb-20 md:mb-32">
                    <Link
                        href="/blogs"
                        className="group flex items-center gap-4 text-foreground-muted hover:text-white transition-all"
                    >
                        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-indigo-500/50 transition-all shadow-2xl">
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Archive_Node</span>
                    </Link>
                    <div className="flex gap-4">
                        <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-foreground-muted hover:text-white border border-white/5 hover:border-indigo-500/50 transition-all shadow-2xl">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saveBlogMutation.isPending}
                            className={cn(
                                "w-12 h-12 glass rounded-2xl flex items-center justify-center transition-all shadow-2xl border border-white/5",
                                data?.isSaved ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50" : "text-foreground-muted hover:text-white hover:border-indigo-500/50"
                            )}
                        >
                            {saveBlogMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Bookmark className={cn("w-5 h-5", data?.isSaved && "fill-current")} />
                            )}
                        </button>
                    </div>
                </nav>

                <div className="max-w-3xl mx-auto">
                    {/* Article Header */}
                    <motion.header
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20 md:mb-32"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl">
                                {blog.category?.name || "INSIGHT_STREAM"}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black font-display tracking-tight leading-[1.0] mb-12 text-white">
                            {blog.title}
                        </h1>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 pt-10 border-t border-white/5">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-2xl">
                                    <div className="w-full h-full bg-slate-950 rounded-[1.4rem] flex items-center justify-center overflow-hidden">
                                        {blog.author?.profilePic ? (
                                            <img src={`${API_BASE_URL}${blog.author.profilePic.replace(/^\//, "")}`} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <User className="w-6 h-6 text-white/20" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-widest">{blog.author?.name || "IDENTITY_UNKNOWN"}</p>
                                    <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] opacity-50">Intelligence Curator</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[9px] font-black text-foreground-muted uppercase tracking-[0.2em] opacity-40">Synchronized</span>
                                    <span className="text-xs font-black text-white tabular-nums tracking-widest uppercase">
                                        {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="w-px h-10 bg-white/5" />
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[9px] font-black text-foreground-muted uppercase tracking-[0.2em] opacity-40">Temporal_Node</span>
                                    <span className="text-xs font-black text-indigo-400 tabular-nums tracking-widest uppercase">
                                        {blog.readtime || "5m CYCLE"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.header>

                    {/* Article Content */}
                    <motion.article
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-16"
                    >
                        <div className="text-xl md:text-3xl text-foreground leading-relaxed font-black font-display italic mb-20 whitespace-pre-wrap border-l-8 border-indigo-500/20 pl-10">
                            {blog.content}
                        </div>

                        {/* Gallery */}
                        {(blog.gallery || blog.image) && (blog.gallery || blog.image).length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 my-24">
                                {(blog.gallery || blog.image).map((imagePath: string, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.15 }}
                                        className="group relative aspect-square rounded-[3rem] overflow-hidden bg-white/5 border border-white/5 shadow-2xl"
                                    >
                                        <img
                                            src={`${API_BASE_URL}${imagePath.replace(/^\//, '')}`}
                                            alt={`Gallery asset ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.article>

                    {/* Footer */}
                    <footer className="mt-40 pt-20 border-t border-white/5">
                        <div className="glass p-16 rounded-[4rem] text-center space-y-10 border border-white/5 border-dashed bg-white/[0.01]">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-[12deg]">
                                <Bookmark className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black font-display tracking-tight text-white uppercase">End of Transmission</h3>
                                <p className="text-foreground-muted font-medium italic max-w-sm mx-auto opacity-70">
                                    “A goal is not always meant to be reached, it often serves simply as something to aim at.”
                                </p>
                            </div>
                            <div className="pt-8">
                                <Link href="/blogs" className="btn-glow inline-flex px-12 py-5 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                                    Return to System Root
                                </Link>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </main>
    );
}
