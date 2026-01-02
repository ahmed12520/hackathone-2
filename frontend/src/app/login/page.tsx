"use client";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleAuth = async () => {
        if (!email || !password) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            // 1. Login ki koshish
            const { data: signInData, error: signInError } = await authClient.signIn.email({
                email,
                password,
            });

            if (signInError) {
                // 2. Agar user nahi mila, toh auto-signup
                if (signInError.code === "USER_NOT_FOUND" || signInError.status === 401) {
                    const { error: signUpError } = await authClient.signUp.email({
                        email,
                        password,
                        name: email.split('@')[0], // Email se name nikal liya
                    });

                    if (signUpError) {
                        toast.error(signUpError.message);
                    } else {
                        toast.success("Account created successfully! 🎉");
                        router.push("/dashboard");
                    }
                } else {
                    toast.error(signInError.message);
                }
            } else {
                toast.success("Welcome back! ✨");
                router.push("/dashboard");
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 relative overflow-hidden">
            
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-sm"
            >
                {/* Brand Logo/Icon */}
                <div className="flex justify-center mb-8">
                    <div className="h-16 w-16 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-2xl p-[2px] rotate-3">
                        <div className="h-full w-full bg-black rounded-[14px] flex items-center justify-center text-2xl">
                            🚀
                        </div>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Continue your story</h1>
                    <p className="text-zinc-500 text-sm">Login or create an account in one step</p>
                </div>
                
                <div className="space-y-4">
                    <div className="group">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full p-4 rounded-xl bg-[#121212] border border-[#262626] focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600" 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    <div className="group">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full p-4 rounded-xl bg-[#121212] border border-[#262626] focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600" 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleAuth} 
                        disabled={loading}
                        className="w-full bg-white text-black py-4 rounded-xl font-bold shadow-xl transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                Processing...
                            </div>
                        ) : "Continue"}
                    </motion.button>
                </div>

                <p className="mt-10 text-center text-zinc-600 text-xs px-6">
                    By continuing, you agree to track your tasks and stay productive.
                </p>
            </motion.div>
        </div>
    );
}