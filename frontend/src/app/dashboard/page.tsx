"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

const DashboardPage = () => {
    const { data: sessionData, isPending } = authClient.useSession();
    const router = useRouter();
    
    const [task, setTask] = useState("");
    const [todos, setTodos] = useState<Todo[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    
    // ✅ Search and Filter States
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const API_BASE_URL = "http://127.0.0.1:8000/api";

    useEffect(() => {
        if (!isPending && !sessionData) {
            router.push("/login");
        }
        if (sessionData) {
            fetchTodos();
        }
    }, [sessionData, isPending, router]);

    // ✅ Logic to filter and search todos
    const filteredTodos = useMemo(() => {
        return todos.filter((t) => {
            const matchesFilter = 
                filter === "all" ? true :
                filter === "active" ? !t.completed :
                t.completed;
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [todos, filter, searchQuery]);

    const fetchTodos = async () => {
        const token = sessionData?.session?.token || (sessionData as any)?.token;
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/tasks`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTodos(Array.isArray(data) ? data : []);
            }
        } catch (err) { console.error(err); }
    };

    const addTask = async () => {
        const token = sessionData?.session?.token || (sessionData as any)?.token;
        if (!task.trim() || !token) return;
        const newTaskTitle = task;
        setTask(""); 

        try {
            const res = await fetch(`${API_BASE_URL}/tasks`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ title: newTaskTitle, completed: false })
            });
            if (res.ok) fetchTodos();
        } catch (err) { toast.error("Failed to add"); fetchTodos(); }
    };

    const toggleComplete = (id: number) => {
        const token = sessionData?.session?.token || (sessionData as any)?.token;
        if (!token) return;
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
        }).catch(() => fetchTodos());
    };

    const deleteTask = (id: number) => {
        const token = sessionData?.session?.token || (sessionData as any)?.token;
        if (!token) return;
        setTodos(prev => prev.filter(t => t.id !== id));
        fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        }).catch(() => fetchTodos());
    };

    const saveEdit = async (id: number) => {
        const token = sessionData?.session?.token || (sessionData as any)?.token;
        if (!token || !editValue.trim()) return;
        setTodos(prev => prev.map(t => t.id === id ? { ...t, title: editValue } : t));
        setEditingId(null);
        try {
            await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ title: editValue })
            });
        } catch (err) { fetchTodos(); }
    };

    if (isPending) return <div className="flex h-screen items-center justify-center bg-black text-white font-mono uppercase tracking-widest text-xs">loading...</div>;
    if (!sessionData) return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-zinc-800">
            <div className="max-w-[470px] mx-auto pt-12 px-4 pb-20">
                
                {/* Header: Instagram Style */}
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-[2px]">
                            <div className="h-full w-full bg-black rounded-full flex items-center justify-center border-2 border-black text-2xl font-bold">
                                {sessionData.user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-[15px] font-bold tracking-tight lowercase">
                                {sessionData.user.name?.replace(/\s+/g, '_')}
                            </h1>
                            <p className="text-[13px] text-zinc-500">{sessionData.user.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => authClient.signOut().then(() => router.push("/login"))}
                        className="text-[13px] font-semibold text-blue-500 hover:text-white transition-colors"
                    >
                        Log Out
                    </button>
                </header>

                <main>
                    {/* Add Task Input */}
                    <div className="relative mb-6">
                        <input 
                            type="text" 
                            value={task} 
                            onChange={(e) => setTask(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && addTask()} 
                            placeholder="Add a task..." 
                            className="w-full bg-zinc-900 border-none rounded-lg py-3 px-4 focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-600 text-[15px]" 
                        />
                        <button 
                            onClick={addTask} 
                            className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold text-sm transition-opacity ${task.length > 0 ? 'text-blue-500 opacity-100' : 'text-blue-500/40 opacity-0 pointer-events-none'}`}
                        >
                            Post
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full bg-transparent border-b border-zinc-800 py-2 px-1 text-[13px] focus:outline-none focus:border-zinc-500 placeholder:text-zinc-700"
                        />
                    </div>

                    {/* Filter Tabs (Instagram Style) */}
                    <div className="flex border-t border-zinc-800 mb-8">
                        {(['all', 'active', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-4 text-[12px] font-bold tracking-widest uppercase transition-colors relative ${filter === f ? 'text-white' : 'text-zinc-500'}`}
                            >
                                {filter === f && <div className="absolute top-0 left-0 right-0 h-[1px] bg-white" />}
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Task List / Empty State */}
                    <div className="space-y-6">
                        {filteredTodos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center pt-10 text-center">
                                <div className="h-16 w-16 border-2 border-zinc-700 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="text-[18px] font-bold">No tasks yet</h3>
                                <p className="text-[14px] text-zinc-500 mt-1">When you add tasks, they'll appear here.</p>
                            </div>
                        ) : (
                            filteredTodos.map((t) => (
                                <div key={t.id} className="flex items-center justify-between group animate-in fade-in duration-300">
                                    <div className="flex items-center gap-3 flex-1">
                                        <button 
                                            onClick={() => toggleComplete(t.id)} 
                                            className={`h-[22px] w-[22px] rounded-full border flex items-center justify-center transition-all ${t.completed ? "bg-blue-500 border-blue-500" : "border-zinc-700"}`}
                                        >
                                            {t.completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                                        </button>
                                        
                                        {editingId === t.id ? (
                                            <input 
                                                autoFocus
                                                className="bg-transparent border-none focus:outline-none text-[14px] w-full text-blue-400"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => saveEdit(t.id)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(t.id)}
                                            />
                                        ) : (
                                            <span className={`text-[14px] transition-colors ${t.completed ? "text-zinc-600 line-through" : "text-zinc-200"}`}>
                                                {t.title}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingId(t.id); setEditValue(t.title); }} className="text-zinc-500 hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => deleteTask(t.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;