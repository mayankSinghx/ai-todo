"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllBlogs } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BlogsPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["all-blogs"],
        queryFn: getAllBlogs,
    });

    useEffect(() => {
        if (isError) {
            toast.error("Failed to load blogs. Refresh the page.");
        }
    }, [isError]);

    const blogs = data?.blogs || [];

    if (isLoading && !data) {
        return (
            <main className="min-h-screen p-6 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-muted animate-pulse">Syncing Insights…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-8 selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto pt-12">
                <header className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-4 text-foreground-muted hover:text-white transition-all mb-10"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-all">
                                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em]">System Root</span>
                        </Link>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div className="max-w-3xl">
                            <h1 className="text-6xl font-black font-display gradient-text tracking-tight mb-4">Intelligence Archive</h1>
                            <p className="text-foreground-muted text-lg font-medium leading-relaxed opacity-80">Exploring the convergence of human creativity and machine intelligence. Systematic perspectives from across the ecosystem.</p>
                        </div>
                        <Link href="/create-blog" className="btn-glow px-10 py-4 text-white rounded-2xl flex items-center gap-3 font-black text-xs tracking-[0.2em] uppercase active:scale-95 transition-all shadow-2xl">
                             Transmit Insight
                        </Link>
                    </motion.div>
                    <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mt-12" />
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {blogs.length === 0 ? (
                        <div className="col-span-full text-center py-40 glass rounded-[3rem] border-white/5 bg-white/[0.02]">
                            <p className="text-foreground-muted font-black text-[10px] uppercase tracking-[0.3em] mb-6 italic opacity-50">No shared intelligence nodes detected.</p>
                            <Link href="/create-blog" className="btn-glow px-12 py-5 text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-2xl inline-block active:scale-95">
                                Initiate Primary Broadcast
                            </Link>
                        </div>
                    ) : (
                        blogs.map((blog: any, i: number) => (
                            <motion.article
                                key={blog.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.8 }}
                                className="group h-full"
                            >
                                <Link href={`/blogs/${blog.id}`} className="block h-full">
                                    <div className="h-full glass rounded-[2.5rem] p-10 border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 flex flex-col relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-500" />
                                        
                                        <div className="relative z-10 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-muted">Index / {new Date(blog.createdAt).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        }).toUpperCase()}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">{blog.readtime || "5m CYCLE"}</span>
                                                </div>
                                                {blog.category && (
                                                    <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl group-hover:border-indigo-500/50 transition-all">
                                                        {blog.category.name}
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-2xl font-black font-display mb-6 group-hover:text-indigo-400 transition-colors leading-tight text-white tracking-tight">
                                                {blog.title}
                                            </h2>
                                            
                                            <p className="text-foreground-muted text-sm leading-relaxed mb-10 flex-1 line-clamp-4 font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                                                {blog.content}
                                            </p>

                                            <div className="flex items-center gap-4 mt-auto pt-8 border-t border-white/5">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-[1px]">
                                                    <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center">
                                                        <User className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white uppercase tracking-wider">{blog.author?.name || "IDENTITY_UNKNOWN"}</span>
                                                    <span className="text-[8px] text-foreground-muted font-black uppercase tracking-[0.2em] opacity-50">Contributor_Node</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.article>
                        )))}
                </div>
            </div>
        </main>
    );
}
