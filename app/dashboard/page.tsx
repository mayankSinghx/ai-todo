"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBlogs, getPosts, deleteBlog, updateBlog, aiBlog, API_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layout,
    Plus,
    Pencil,
    Trash2,
    MoreVertical,
    Clock,
    Calendar,
    CheckCircle2,
    Circle,
    Loader2,
    X,
    Wand2,
    Upload,
    ArrowLeft,
    Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [token, setToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"blogs" | "todos">("blogs");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        title: "",
        content: "",
        readtime: "",
        categoryId: "",
        newCategory: ""
    });
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [editImages, setEditImages] = useState<File[]>([]);
    const [editPreviews, setEditPreviews] = useState<string[]>([]);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/login");
        } else {
            setToken(storedToken);
        }
    }, [router]);

    const { data: blogsData, isLoading: blogsLoading } = useQuery({
        queryKey: ["blogs", token],
        queryFn: () => getBlogs(token!),
        enabled: !!token,
    });

    const { data: catData } = useQuery({
        queryKey: ["categories"],
        queryFn: () => fetch(`${API_URL}/getCategories`).then(res => res.json())
    });

    const categories = catData?.categories || [];

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ["posts", token],
        queryFn: () => getPosts(token!),
        enabled: !!token,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteBlog(id, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            toast.success("Blog deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete blog");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: FormData }) => updateBlog(id, data, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Blog updated successfully");
            setIsEditModalOpen(false);
            setEditingBlog(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update blog");
        }
    });

    const aiBlogMutation = useMutation({
        mutationFn: (prompt: string) => aiBlog(prompt, token!),
        onSuccess: (data) => {
            if (data.success && data.data) {
                setEditFormData(prev => ({
                    ...prev,
                    content: data.data.content,
                    readtime: data.data.readTime
                }));
                toast.success("AI Content updated!");
            }
        }
    });

    const handleEdit = (blog: any) => {
        setEditingBlog(blog);
        setEditFormData({
            title: blog.title,
            content: blog.content,
            readtime: blog.readtime,
            categoryId: blog.categoryId?.toString() || "",
            newCategory: ""
        });
        const gallery = blog.gallery || blog.image || [];
        setEditPreviews(gallery.map((img: string) => `${API_URL}/${img.replace(/^\//, '')}`));
        setEditImages([]);
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", editFormData.title);
        data.append("content", editFormData.content);
        data.append("readtime", editFormData.readtime);
        data.append("categoryId", editFormData.categoryId);
        data.append("newCategory", editFormData.newCategory);
        editImages.forEach(image => data.append("gallery", image));

        updateMutation.mutate({ id: editingBlog.id, data });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setEditImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setEditPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    if (!token) return null;

    return (
        <main className="min-h-screen p-8 selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto space-y-12 pt-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-2xl"
                    >
                        <h1 className="text-6xl font-black font-display tracking-tight gradient-text mb-4">Command Center</h1>
                        <p className="text-foreground-muted text-lg font-medium opacity-70">Symphonizing your intelligence nodes and operational workflows within the Celestial ecosystem.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4"
                    >
                        <button
                            onClick={() => router.push("/create-blog")}
                            className="btn-glow px-10 py-4 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 flex items-center gap-3"
                        >
                            <Plus className="w-5 h-5" />
                            Transmit New Insight
                        </button>
                    </motion.div>
                </div>

                <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 p-1.5 glass rounded-2xl w-fit border border-white/5 shadow-2xl bg-white/[0.02]"
                >
                    <button
                        onClick={() => setActiveTab("blogs")}
                        className={cn(
                            "px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                            activeTab === "blogs"
                                ? "bg-white/10 text-white shadow-xl border border-white/10"
                                : "text-foreground-muted hover:text-white"
                        )}
                    >
                        Intelligence_Nodes
                    </button>
                    <button
                        onClick={() => setActiveTab("todos")}
                        className={cn(
                            "px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                            activeTab === "todos"
                                ? "bg-white/10 text-white shadow-xl border border-white/10"
                                : "text-foreground-muted hover:text-white"
                        )}
                    >
                        Operational_Tasks
                    </button>
                </motion.div>

                {/* Content */}
                <div className="grid grid-cols-1 gap-12">
                    {activeTab === "blogs" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <AnimatePresence mode="popLayout">
                                {blogsLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="h-80 glass animate-pulse rounded-[2.5rem] bg-white/[0.02]" />
                                    ))
                                ) : (
                                    blogsData?.blogs?.map((blog: any, i: number) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.08, duration: 0.8 }}
                                            key={blog.id}
                                            className="group glass rounded-[2.5rem] p-10 relative overflow-hidden border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500"
                                        >
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-500" />

                                            <div className="relative z-10 h-full flex flex-col">
                                                <div className="flex justify-between items-start mb-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:border-indigo-500/50 transition-all duration-500 rotate-[-8deg] group-hover:rotate-0">
                                                            <Layout className="w-6 h-6 text-indigo-400" />
                                                        </div>
                                                        {blog.category && (
                                                            <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
                                                                {blog.category.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                                        <button
                                                            onClick={() => handleEdit(blog)}
                                                            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-indigo-500/20 text-foreground-muted hover:text-white rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all active:scale-95 shadow-2xl"
                                                            aria-label="Edit story"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("Are you sure you want to delete this story?")) {
                                                                    deleteMutation.mutate(blog.id);
                                                                }
                                                            }}
                                                            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-foreground-muted hover:text-red-400 rounded-xl border border-white/5 hover:border-red-500/50 transition-all active:scale-95 shadow-2xl"
                                                            aria-label="Delete story"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h3 className="font-black text-2xl text-white mb-6 font-display tracking-tight group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-foreground-muted text-sm font-medium line-clamp-3 mb-10 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {blog.content}
                                                </p>
                                                <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-foreground-muted tabular-nums">
                                                            <span className="opacity-40 uppercase">Read_Time</span>
                                                            <span className="text-indigo-400">{blog.readtime}</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-white/5" />
                                                        <div className="flex flex-col gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-foreground-muted tabular-nums">
                                                            <span className="opacity-40 uppercase">Synced</span>
                                                            <span className="text-white">{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                {(!blogsData?.blogs || blogsData.blogs.length === 0) && !blogsLoading && (
                                    <div className="col-span-full py-40 glass border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center bg-white/[0.01]">
                                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-10 shadow-2xl border border-white/10">
                                            <Layout className="w-10 h-10 text-indigo-400 opacity-50" />
                                        </div>
                                        <p className="font-black text-white text-3xl font-display uppercase tracking-tight mb-4">Archive Empty</p>
                                        <p className="text-foreground-muted font-medium mb-12 max-w-sm opacity-60">Start sharing your modular insights with the community network to populate this buffer.</p>
                                        <button
                                            onClick={() => router.push("/create-blog")}
                                            className="btn-glow px-12 py-5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95"
                                        >
                                            Initialize First Broadcast
                                        </button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl bg-white/[0.02]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.03] border-b border-white/5">
                                        <tr>
                                            <th className="px-10 py-6 text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em]">Status</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em]">Operational_Intent</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em]">Entity_Payload</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] text-right">Synchronization</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {postsLoading ? (
                                            Array(5).fill(0).map((_, i) => (
                                                <tr key={i}>
                                                    <td colSpan={4} className="px-10 py-8 bg-white/[0.01] animate-pulse" />
                                                </tr>
                                            ))
                                        ) : (
                                            postsData?.posts?.map((post: any) => (
                                                <tr key={post.id} className="hover:bg-white/[0.04] transition-all group">
                                                    <td className="px-10 py-6">
                                                        <div className="w-6 h-6 border-2 border-white/10 rounded-lg flex items-center justify-center transition-all group-hover:border-indigo-500/50 group-hover:bg-indigo-500/20">
                                                            <CheckCircle2 className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className="font-black text-white text-sm uppercase tracking-wider">{post.title}</span>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <p className="text-sm text-foreground-muted font-medium italic truncate max-w-md group-hover:text-white transition-colors opacity-60 group-hover:opacity-100">"{post.content}"</p>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <span className="text-[10px] text-foreground-muted font-black tabular-nums uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                                                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        {(!postsData?.posts || postsData.posts.length === 0) && !postsLoading && (
                                            <tr>
                                                <td colSpan={4} className="px-10 py-24 text-center">
                                                    <p className="text-foreground-muted font-black text-[10px] uppercase tracking-[0.3em] opacity-30">No active tasks detected in neural network buffer.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="glass rounded-[3.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10 bg-slate-900"
                        >
                            <div className="px-12 py-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h2 className="text-4xl font-black font-display text-white tracking-tight uppercase">Edit Insight</h2>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 italic opacity-60">Entity_Modification_Terminal</p>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="w-14 h-14 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all active:scale-90 bg-white/5 border border-white/10"
                                >
                                    <X className="w-6 h-6 text-white transition-colors" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-12 space-y-12">
                                <div className="space-y-10">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] mb-4 opacity-40 group-focus-within:opacity-100 transition-opacity">Headline</label>
                                        <input
                                            type="text"
                                            required
                                            value={editFormData.title}
                                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            className="w-full px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all placeholder:text-white/20 font-black text-xl tracking-tight"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] mb-4 opacity-40 group-focus-within:opacity-100 transition-opacity">Temporal_Read</label>
                                            <div className="relative">
                                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 opacity-40" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={editFormData.readtime}
                                                    onChange={(e) => setEditFormData({ ...editFormData, readtime: e.target.value })}
                                                    className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-sm font-black uppercase tracking-widest"
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] opacity-40 group-focus-within:opacity-100 transition-opacity">Classification</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                                    className="text-[9px] font-black text-indigo-400 hover:text-white transition-all uppercase px-4 py-1 rounded-full border border-indigo-500/30 hover:bg-indigo-500/20 bg-indigo-500/5"
                                                >
                                                    {isCreatingCategory ? "Archives" : "Initialize_New"}
                                                </button>
                                            </div>
                                            {isCreatingCategory ? (
                                                <div className="relative">
                                                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 opacity-40" />
                                                    <input
                                                        type="text"
                                                        value={editFormData.newCategory}
                                                        onChange={(e) => setEditFormData({ ...editFormData, newCategory: e.target.value, categoryId: "" })}
                                                        className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-sm font-black uppercase tracking-widest"
                                                        placeholder="Emergent_Node"
                                                    />
                                                </div>
                                            ) : (
                                                <select
                                                    value={editFormData.categoryId}
                                                    onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value, newCategory: "" })}
                                                    className="w-full px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-sm font-black uppercase tracking-widest cursor-pointer appearance-none"
                                                >
                                                    <option value="" className="bg-slate-900">Select Classification</option>
                                                    {categories.map((cat: any) => (
                                                        <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    <div className="group">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] opacity-40 group-focus-within:opacity-100 transition-opacity">Insight_Data</label>
                                            <motion.button
                                                type="button"
                                                onClick={() => aiBlogMutation.mutate(editFormData.title)}
                                                disabled={aiBlogMutation.isPending}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="btn-glow flex items-center gap-3 px-6 py-2.5 text-white text-[10px] font-black rounded-full uppercase tracking-widest transition-all disabled:opacity-30"
                                            >
                                                {aiBlogMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                                Optimize with AI
                                            </motion.button>
                                        </div>
                                        <textarea
                                            required
                                            rows={8}
                                            value={editFormData.content}
                                            onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                                            className="w-full px-8 py-6 bg-white/5 border border-white/10 text-white rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all resize-none text-lg leading-relaxed font-black font-display italic tracking-tight"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] mb-6 opacity-40">Gallery_Nodes</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            {editPreviews.map((preview, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="relative aspect-square rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group/img shadow-2xl"
                                                >
                                                    <img src={preview} alt="preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-125" />
                                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditPreviews(prev => prev.filter((_, i) => i !== index));
                                                                setEditImages(prev => prev.filter((_, i) => i !== index));
                                                            }}
                                                            className="p-3 bg-white/10 backdrop-blur-xl text-white rounded-2xl hover:bg-red-500/50 transition-all hover:scale-110 active:scale-90"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            <motion.label
                                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                                                whileTap={{ scale: 0.95 }}
                                                className="aspect-square rounded-[2.5rem] border-2 border-dashed border-white/10 hover:border-indigo-500/50 bg-white/[0.02] cursor-pointer flex flex-col items-center justify-center gap-4 text-foreground-muted group transition-all"
                                            >
                                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl group-hover:border-indigo-500/50 transition-all">
                                                    <Upload className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100">Attach</span>
                                            </motion.label>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="p-12 border-t border-white/5 flex items-center justify-end gap-6 bg-white/[0.02]">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-8 py-4 text-xs font-black text-foreground-muted hover:text-red-400 uppercase tracking-[0.2em] transition-colors"
                                >
                                    Abort_Sequence
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={updateMutation.isPending}
                                    className="btn-glow px-12 py-5 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-4 shadow-2xl active:scale-95"
                                >
                                    {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    Commit_Updates
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
