"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, API_URL } from "@/lib/api";
import { motion } from "framer-motion";
import {
    User,
    Camera,
    Image as ImageIcon,
    Loader2,
    MapPin,
    Mail,
    Phone,
    Calendar,
    Plus,
    Trash2,
    Globe,
    Github,
    Twitter,
    Linkedin,
    CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [token, setToken] = useState<string | null>(null);

    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [bannerPic, setBannerPic] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string>("");
    const [bannerPicPreview, setBannerPicPreview] = useState<string>("");

    const [formData, setFormData] = useState({
        bio: "",
        contact: "",
        address: "",
        dob: "",
        gender: "",
    });

    const [socials, setSocials] = useState<{ name: string, link: string }[]>([]);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/login");
        } else {
            setToken(storedToken);
        }
    }, [router]);

    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["profile", token],
        queryFn: () => getProfile(token!),
        enabled: !!token,
    });

    useEffect(() => {
        if (profileData?.profile) {
            const p = profileData.profile;
            setFormData({
                bio: p.bio || "",
                contact: p.contact || "",
                address: p.address || "",
                dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : "",
                gender: p.gender || "",
            });
            setSocials(p.socials || []);
            if (p.profilePic) setProfilePicPreview(`${API_URL}/${p.profilePic.replace(/^\//, "")}`);
            if (p.bannerPic) setBannerPicPreview(`${API_URL}/${p.bannerPic.replace(/^\//, "")}`);
        }
    }, [profileData]);

    const updateMutation = useMutation({
        mutationFn: (data: FormData) => updateProfile(data, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            toast.success("Profile updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("bio", formData.bio);
        data.append("contact", formData.contact);
        data.append("address", formData.address);
        data.append("dob", formData.dob);
        data.append("gender", formData.gender);
        data.append("socials", JSON.stringify(socials));

        if (profilePic) data.append("profilePic", profilePic);
        if (bannerPic) data.append("bannerPic", bannerPic);

        updateMutation.mutate(data);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const preview = URL.createObjectURL(file);
            if (type === 'profile') {
                setProfilePic(file);
                setProfilePicPreview(preview);
            } else {
                setBannerPic(file);
                setBannerPicPreview(preview);
            }
        }
    };

    const addSocial = () => {
        setSocials([...socials, { name: "", link: "" }]);
    };

    const removeSocial = (index: number) => {
        setSocials(socials.filter((_, i) => i !== index));
    };

    const updateSocial = (index: number, field: 'name' | 'link', value: string) => {
        const newSocials = [...socials];
        newSocials[index][field] = value;
        setSocials(newSocials);
    };

    if (!token || profileLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <main className="min-h-screen pb-40 selection:bg-indigo-500/30">
            {/* Banner Section */}
            <div className="h-[40vh] md:h-[50vh] w-full relative bg-slate-900 overflow-hidden group">
                {bannerPicPreview ? (
                    <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2 }}
                        src={bannerPicPreview}
                        alt="Banner"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.15),transparent)]" />

                <label className="absolute bottom-12 right-12 btn-glow px-8 py-3.5 rounded-2xl cursor-pointer transition-all shadow-2xl flex items-center gap-3 text-white border border-white/10 group/btn translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recalibrate_Horizon</span>
                </label>
            </div>

            <div className="max-w-5xl mx-auto px-8">
                {/* Profile Header */}
                <div className="relative -mt-32 mb-20 flex flex-col md:flex-row md:items-end gap-12">
                    <div className="relative group">
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="w-56 h-56 rounded-[3.5rem] p-1.5 glass border-4 border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative bg-slate-900"
                        >
                            <div className="w-full h-full rounded-[3rem] overflow-hidden bg-white/[0.03]">
                                {profilePicPreview ? (
                                    <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-400 opacity-30">
                                        <User className="w-24 h-24" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center cursor-pointer backdrop-blur-sm">
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </label>
                        </motion.div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-2xl border-4 border-slate-950 shadow-2xl shadow-green-500/50 flex items-center justify-center">
                            <span className="w-4 h-4 bg-white rounded-full animate-ping opacity-75" />
                        </div>
                    </div>

                    <div className="flex-1 pb-6 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-6xl font-black gradient-text tracking-tighter font-display mb-2">Core Identity</h1>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] shadow-xl">
                                    Status: Verified_System_User
                                </span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-40 italic">Syncing with neural_net...</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Basic Info */}
                    <div className="lg:col-span-7 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-12 rounded-[3.5rem] border-white/5 space-y-12 bg-white/[0.02]"
                        >
                            <div className="flex items-center gap-4 pb-8 border-b border-white/5">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl rotate-[-8deg]">
                                    <User className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">Neural_Buffer</h2>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-40">Identity_Core_Expansion</p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] mb-4 opacity-40 group-focus-within:opacity-100 transition-opacity">Narrative_Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all resize-none min-h-[220px] text-white text-lg leading-relaxed font-black font-display italic tracking-tight placeholder:text-white/10 shadow-2xl"
                                        placeholder="Broadcast your conceptual framework..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] mb-4 opacity-40 group-focus-within:opacity-100 transition-opacity">Entity_Classification</label>
                                        <div className="relative">
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white text-sm font-black uppercase tracking-widest appearance-none cursor-pointer shadow-2xl"
                                            >
                                                <option value="" className="bg-slate-900">Select_Type</option>
                                                <option value="male" className="bg-slate-900">Type_M</option>
                                                <option value="female" className="bg-slate-900">Type_F</option>
                                                <option value="other" className="bg-slate-900">Type_X</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] mb-4 opacity-40 group-focus-within:opacity-100 transition-opacity">Chronological_Epoch</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                            <input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white text-sm font-black tracking-widest shadow-2xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass p-12 rounded-[3.5rem] border-white/5 space-y-10 bg-white/[0.02]"
                        >
                            <div className="flex items-center gap-4 pb-8 border-b border-white/5">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl rotate-[8deg]">
                                    <MapPin className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">Coordinates</h2>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-40">Spatial_Registry_Protocol</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] mb-4 opacity-40 group-focus-within:opacity-100 transition-opacity">Comms_Relay</label>
                                    <div className="relative">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                        <input
                                            type="text"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            placeholder="+0 000 000 000"
                                            className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white text-sm font-black tracking-widest shadow-2xl"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.3em] mb-4 opacity-40 group-focus-within:opacity-100 transition-opacity">Station_Location</label>
                                    <div className="relative">
                                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Orbiting_Node_Alpha"
                                            className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white text-sm font-black tracking-widest shadow-2xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Socials & Submission */}
                    <div className="lg:col-span-5 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass p-10 rounded-[3.5rem] border-white/5 space-y-10 bg-white/[0.02]"
                        >
                            <div className="flex items-center justify-between pb-8 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                                        <Globe className="w-7 h-7 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">Mesh_Links</h2>
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-40">Integration_Nodes</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addSocial}
                                    className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white transition-all hover:bg-indigo-500/20 hover:border-indigo-500/50 active:scale-90 shadow-2xl"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {socials.map((social, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={index}
                                        className="flex gap-4 group/item"
                                    >
                                        <select
                                            value={social.name}
                                            onChange={(e) => updateSocial(index, 'name', e.target.value)}
                                            className="w-[120px] px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer uppercase tracking-widest bg-slate-900"
                                        >
                                            <option value="">Node</option>
                                            <option value="Github">Github</option>
                                            <option value="Twitter">Twitter</option>
                                            <option value="Linkedin">Linkedin</option>
                                            <option value="Website">Web</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={social.link}
                                            onChange={(e) => updateSocial(index, 'link', e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-white/10 shadow-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSocial(index)}
                                            className="w-12 h-12 flex items-center justify-center text-foreground-muted hover:text-red-400 bg-white/5 border border-white/10 hover:border-red-500/30 rounded-2xl transition-all shadow-xl active:scale-90"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                                {socials.length === 0 && (
                                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                                        <p className="font-black text-[10px] uppercase tracking-[0.3em] italic">No active_mesh_integration</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-6"
                        >
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="btn-glow w-full py-6 text-white rounded-[2.5rem] transition-all font-black text-xl shadow-[0_20px_60px_rgba(99,102,241,0.3)] active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-6 uppercase tracking-[0.2em]"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : (
                                    <>
                                        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <span>Commit_Integrity</span>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-foreground-muted text-[10px] font-black uppercase tracking-[0.3em] px-12 leading-loose opacity-40">
                                Global synchronization will distribute updates across the distributed ledger immediately.
                            </p>
                        </motion.div>
                    </div>
                </form>
            </div>
        </main>
    );
}
