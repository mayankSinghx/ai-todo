"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, User, Loader2, Bookmark } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSavedBlogs } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SavedBlogsPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        } else {
            router.push("/login");
        }
    }, [router]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["saved-blogs", token],
        queryFn: () => getSavedBlogs(token as string),
        enabled: !!token,
    });

    useEffect(() => {
        if (isError) {
            toast.error("Failed to load saved blogs.");
        }
    }, [isError]);

    const savedBlogs = data?.savedBlogs || [];

    if (isLoading && !data) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </main>
        );
    }

    return (
        <main className="min-h-screen p-8 selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto space-y-12 pt-12">
                <header>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-2xl"
                    >
                        <div className="flex items-center gap-6 mb-4">
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl rotate-[-8deg]">
                                <Bookmark className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h1 className="text-6xl font-black font-display tracking-tight gradient-text">Archive_Vault</h1>
                        </div>
                        <p className="text-foreground-muted text-lg font-medium opacity-70">A secure repository for your curated intelligence nodes and conceptual frameworks.</p>
                    </motion.div>
                </header>

                <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {savedBlogs.length === 0 ? (
                        <div className="col-span-full py-40 glass border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center bg-white/[0.01]">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-10 shadow-2xl border border-white/10">
                                <Bookmark className="w-10 h-10 text-indigo-400 opacity-50" />
                            </div>
                            <p className="font-black text-white text-3xl font-display uppercase tracking-tight mb-4">Vault Empty</p>
                            <p className="text-foreground-muted font-medium mb-12 max-w-sm opacity-60">No synchronized data detected in your primary archive. Explore the network to begin curation.</p>
                            <Link href="/blogs" className="btn-glow px-12 py-5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95">
                                Re-enter Network
                            </Link>
                        </div>
                    ) : (
                        savedBlogs.map((saved: any, i: number) => {
                            const blog = saved.blog;
                            return (
                                <motion.article
                                    key={saved.id}
                                    layout
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08, duration: 0.8 }}
                                    className="group h-full"
                                >
                                    <Link href={`/blogs/${blog.id}`} className="block h-full">
                                        <div className="group glass rounded-[2.5rem] p-10 h-full relative overflow-hidden border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 flex flex-col">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-500" />
                                            
                                            <div className="relative z-10 h-full flex flex-col">
                                                <div className="flex justify-between items-start mb-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:border-indigo-500/50 transition-all duration-500 rotate-[-8deg] group-hover:rotate-0">
                                                            <Clock className="w-6 h-6 text-indigo-400" />
                                                        </div>
                                                        {blog.category && (
                                                            <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
                                                                {blog.category.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <h2 className="font-black text-2xl text-white mb-6 font-display tracking-tight group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                                                    {blog.title}
                                                </h2>
                                                
                                                <p className="text-foreground-muted text-sm font-medium line-clamp-4 mb-10 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity flex-1 font-display italic tracking-tight">
                                                    "{blog.content}"
                                                </p>
                                                
                                                <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-foreground-muted tabular-nums">
                                                            <span className="opacity-40 uppercase">Archived</span>
                                                            <span className="text-white">{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-white/5" />
                                                        <div className="flex flex-col gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-foreground-muted tabular-nums">
                                                            <span className="opacity-40 uppercase">Read_Time</span>
                                                            <span className="text-indigo-400">{blog.readtime || "5m"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/5">
                                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-indigo-500/50 transition-all">
                                                        <User className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-white uppercase tracking-wider">{blog.author?.name || "ANONYMOUS"}</span>
                                                        <span className="text-[9px] text-foreground-muted font-black uppercase tracking-widest opacity-40">Contributor_Node</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
