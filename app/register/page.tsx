"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const registerMutation = useMutation({
        mutationFn: () => register({ name, email, username, password }),
        onSuccess: () => {
            toast.success("Account created! Please sign in.");
            router.push("/login");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Registration failed");
        }
    });

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate();
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
            <div className="w-full max-w-sm mx-auto">
                <header className="mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 rotate-[-6deg]">
                        <span className="text-white text-2xl font-black font-display tracking-tighter">AI</span>
                    </div>
                    <h1 className="text-4xl font-black font-display gradient-text tracking-tight mb-2">Create Account</h1>
                    <p className="text-foreground-muted text-sm font-medium">Join the intelligent ecosystem</p>
                </header>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-10 rounded-3xl border-white/5 bg-white/5"
                >
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white placeholder:text-foreground-muted/50 text-sm font-medium"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white placeholder:text-foreground-muted/50 text-sm font-medium"
                            />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white placeholder:text-foreground-muted/50 text-sm font-medium"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Secure Password"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white placeholder:text-foreground-muted/50 text-sm font-medium"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full btn-glow text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {registerMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Construct Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest mb-2 opacity-50">Already an entity?</p>
                        <Link href="/login" className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
