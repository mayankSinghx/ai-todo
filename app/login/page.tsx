"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api";
import { Loader2, Lock, User, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Login() {
    const router = useRouter();
    const [uniqueIdentifier, setUniqueIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useMutation({
        mutationFn: () => login(uniqueIdentifier, password),
        onSuccess: (data) => {
            localStorage.setItem("token", data.token);
            toast.success("Welcome back!");
            router.push("/");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Login failed");
        }
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate();
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
            <div className="w-full max-w-sm mx-auto">
                <header className="mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 rotate-[-6deg]">
                        <span className="text-white text-2xl font-black font-display tracking-tighter">AI</span>
                    </div>
                    <h1 className="text-4xl font-black font-display gradient-text tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-foreground-muted text-sm font-medium">Access your intelligent workspace</p>
                </header>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-10 rounded-3xl border-white/5 bg-white/5"
                >
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    value={uniqueIdentifier}
                                    onChange={(e) => setUniqueIdentifier(e.target.value)}
                                    placeholder="Username or Email"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white placeholder:text-foreground-muted/50 text-sm font-medium"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all text-white placeholder:text-foreground-muted/50 text-sm font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full btn-glow text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loginMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Authenticate"
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest mb-2 opacity-50">New to the ecosystem?</p>
                        <Link href="/register" className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                            Construct Account
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
