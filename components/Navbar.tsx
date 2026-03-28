"use client";

import Link from "next/link";
import { LogOut, Plus, BookOpen, Layout, Bookmark, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            try {
                const decoded: any = jwtDecode(storedToken);
                setUsername(decoded.username || "");
            } catch (e) {
                console.error("Invalid token", e);
            }
        } else {
            setUsername("");
        }
    }, [pathname]);

    const logout = () => {
        localStorage.removeItem("token");
        setUsername("");
        router.push("/login");
    };

    if (pathname === "/login" || pathname === "/register") {
        return null;
    }

    const navItems = [
        { name: "AI Todo", path: "/", icon: Layout },
        { name: "Feed", path: "/blogs", icon: BookOpen },
        { name: "Saved", path: "/saved-blogs", icon: Bookmark },
        { name: "Write", path: "/create-blog", icon: Plus },
        { name: "Dashboard", path: "/dashboard", icon: Layout },
        { name: "Profile", path: "/profile", icon: User }
    ];

    return (
        <nav className="glass sticky top-4 mx-6 z-50 rounded-2xl border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transition-all group-hover:rotate-[-6deg] group-hover:scale-110 shadow-lg shadow-indigo-500/20">
                            <span className="text-white text-xs font-black tracking-tighter font-display">AI</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base gradient-text font-display tracking-tight leading-none">AI Todo</span>
                            <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase opacity-70">Production</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`relative px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 rounded-xl ${isActive ? "text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 transition-transform ${isActive ? "text-indigo-400 scale-110" : "text-foreground-muted"}`} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-white/10 rounded-xl -z-10 border border-white/10 shadow-inner"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <AnimatePresence mode="wait">
                        {username && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl shadow-lg"
                            >
                                <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center border border-white/20">
                                    <User className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-xs font-black text-white tracking-wide">{username}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={logout}
                        className="btn-glow px-5 py-2 text-xs font-black text-white rounded-xl shadow-xl active:scale-95 transition-all"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}

