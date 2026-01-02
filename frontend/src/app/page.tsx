"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [initialTask, setInitialTask] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialTask.trim()) {
      toast.error("What's your plan? Type something!");
      return;
    }

    localStorage.setItem("pendingTask", initialTask);
    setIsRedirecting(true);
    
    toast.success("Nice! Let's save this task.");

    setTimeout(() => {
      router.push("/login");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </motion.div>

      <AnimatePresence>
        {!isRedirecting && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="z-10 text-center w-full max-w-xl"
          >
            {/* Animated Logo Ring */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="mb-10 flex justify-center cursor-pointer"
            >
                <div className="h-24 w-24 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-[30%] p-[3px] shadow-[0_0_30px_rgba(238,42,123,0.3)]">
                    <div className="h-full w-full bg-black rounded-[28%] flex items-center justify-center">
                        <span className="text-4xl">✨</span>
                    </div>
                </div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
              Make it happen.
            </h1>

            <form onSubmit={handleGetStarted} className="relative">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input 
                  type="text" 
                  value={initialTask}
                  onChange={(e) => setInitialTask(e.target.value)}
                  placeholder="What's on your mind today?" 
                  className="w-full bg-[#121212] border border-[#262626] rounded-2xl py-6 px-8 text-xl focus:outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-600 shadow-2xl"
                  autoFocus
                />
              </motion.div>
              
              {/* ✨ Updated Enter Indicator Design */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex items-center justify-center gap-3 text-zinc-500"
              >
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">Press</span>
                
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-inner group">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                        <path d="M9 10l-5 5 5 5"></path>
                        <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                    </svg>
                    <span className="text-[11px] font-black text-zinc-300">ENTER</span>
                </div>

                <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">to start story</span>
              </motion.div>
            </form>

            <div className="mt-20">
                <button 
                    onClick={() => router.push("/login")}
                    className="text-zinc-600 hover:text-white transition-colors text-[10px] font-bold tracking-[0.3em] uppercase"
                >
                    Already a member? Login
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}