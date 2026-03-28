"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBlog, aiBlog, getCategories } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, ArrowLeft, Image as ImageIcon, Wand2, PlusCircle, Tag, Clock, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function CreateBlog() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        readtime: "",
        categoryId: "",
        newCategory: "",
    });
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const { data: catData } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories
    });

    const categories = catData?.categories || [];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages((prev) => [...prev, ...files]);

            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const createBlogMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");
            return createBlog(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Blog published successfully!");
            router.push("/blogs");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create blog");
        },
    });

    const aiBlogMutation = useMutation({
        mutationFn: async (userPrompt: string) => {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");
            return aiBlog(userPrompt, token);
        },
        onSuccess: (data) => {
            if (data.success && data.data) {
                setFormData((prev) => ({
                    ...prev,
                    content: data.data.content,
                    readtime: data.data.readTime,
                }));
                toast.success("AI Content generated!");
            }
        },
        onError: (error: any) => {
            console.error("AI Generation failed:", error);
            toast.error("AI Generation failed. Please try again.");
        },
    });

    const handleAIGenerate = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error("Please enter a blog title first!");
            return;
        }
        aiBlogMutation.mutate(formData.title);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoryId && !formData.newCategory) {
            toast.error("Please select or create a category");
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("content", formData.content);
        data.append("readtime", formData.readtime);
        data.append("categoryId", formData.categoryId);
        data.append("newCategory", formData.newCategory);
        images.forEach((image) => {
            data.append("gallery", image);
        });

        createBlogMutation.mutate(data);
    };

    return (
        <main className="min-h-screen p-8 selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto pt-10">
                <header className="mb-12 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <button
                            onClick={() => router.back()}
                            className="group flex items-center gap-3 text-foreground-muted hover:text-white transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-all">
                                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Interface Back</span>
                        </button>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl font-black font-display gradient-text tracking-tight mb-2">Create Content</h1>
                        <p className="text-foreground-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-60">System Synchronized Publication</p>
                    </motion.div>
                    <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-white/10">
                        <PlusCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                </header>

                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-12 rounded-[2.5rem] border-white/5 bg-white/5 relative overflow-hidden"
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-10">
                        <div className="space-y-3">
                            <label htmlFor="title" className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-2">
                                Publication Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all font-display font-black text-2xl text-white placeholder:text-foreground-muted/30"
                                placeholder="THE FUTURE OF AGENTIC ARCHITECTURES…"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label htmlFor="readtime" className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-2">
                                    Temporal Estimate
                                </label>
                                <div className="relative group">
                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        id="readtime"
                                        required
                                        value={formData.readtime}
                                        onChange={(e) => setFormData({ ...formData, readtime: e.target.value })}
                                        className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-sm font-bold text-white placeholder:text-foreground-muted/30"
                                        placeholder="e.g. 5m CYCLE"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ">Classification</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                        className="text-[9px] font-black text-indigo-400 hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        {isCreatingCategory ? "[ USE EXISTING ]" : "[ CREATE NEW ]"}
                                    </button>
                                </div>
                                {isCreatingCategory ? (
                                    <div className="relative group">
                                        <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="text"
                                            value={formData.newCategory}
                                            onChange={(e) => setFormData({ ...formData, newCategory: e.target.value, categoryId: "" })}
                                            className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-sm font-bold text-white placeholder:text-foreground-muted/30"
                                            placeholder="NEW SYSTEM NODE"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, newCategory: "" })}
                                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-sm font-bold text-white appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900">SELECT CLUSTER</option>
                                            {categories.map((cat: any) => (
                                                <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted group-focus-within:text-indigo-400">
                                            <PlusCircle className="w-5 h-5" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <label htmlFor="content" className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ">
                                    Intelligence Narrative
                                </label>
                                <motion.button
                                    onClick={handleAIGenerate}
                                    disabled={aiBlogMutation.isPending}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    className="flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all disabled:opacity-30 shadow-2xl hover:bg-white/10"
                                >
                                    {aiBlogMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                            Synthesizing…
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-3 h-3 text-indigo-400" />
                                            Optimize with AI
                                        </>
                                    )}
                                </motion.button>
                            </div>
                            <div className="relative">
                                <textarea
                                    id="content"
                                    required
                                    rows={12}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-8 py-8 bg-white/5 border border-white/10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all resize-none text-base leading-relaxed text-foreground placeholder:text-foreground-muted/20 font-medium"
                                    placeholder="INITIATE DATA TRANSFER…"
                                />
                                <div className="absolute bottom-6 right-8 pointer-events-none opacity-10">
                                    <BookOpen className="w-12 h-12" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-2">Visual Assets</label>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                                <AnimatePresence>
                                    {previews.map((preview, index) => (
                                        <motion.div
                                            key={preview}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="relative aspect-square rounded-[2rem] overflow-hidden group border border-white/10 shadow-2xl shadow-black/50"
                                        >
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="w-10 h-10 bg-white border border-white/20 text-black rounded-full hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-90"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <motion.label
                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                                        whileTap={{ scale: 0.98 }}
                                        className="aspect-square rounded-[2rem] border-2 border-dashed border-white/10 hover:border-indigo-500/50 bg-white/[0.02] cursor-pointer flex flex-col items-center justify-center gap-4 text-foreground-muted transition-all group"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center px-4 leading-relaxed">Synchronize<br/>Imagery</span>
                                    </motion.label>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-12 pt-10 border-t border-white/5">
                        <button
                            type="submit"
                            disabled={createBlogMutation.isPending}
                            className="btn-glow px-12 py-5 text-white rounded-[2rem] flex items-center gap-4 font-black text-sm tracking-[0.2em] uppercase active:scale-95 transition-all shadow-2xl"
                        >
                            {createBlogMutation.isPending ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Synchronizing…
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-6 h-6" />
                                    Broadcast Update
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </main >
    );
}

