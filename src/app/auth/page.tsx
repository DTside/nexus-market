"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, User, Mail, Key, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Переключатель Вход / Регистрация
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Данные формы
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Только для регистрации

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // --- ВХОД ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/"); // Перенаправляем на главную
      } else {
        // --- РЕГИСТРАЦИЯ ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username, // Передаем имя пользователя в метаданные
            },
          },
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-cyber-black font-rajdhani relative overflow-hidden">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <h1 className="font-orbitron text-4xl text-white mb-2 tracking-widest">
            NEXUS <span className="text-cyber-neon">ID</span>
          </h1>
          <p className="text-gray-500 uppercase text-xs tracking-[0.3em]">
            {isLogin ? "Verify Identity" : "New User Protocol"}
          </p>
        </div>

        {/* Карточка формы */}
        <div className="bg-cyber-dark/80 border border-white/10 backdrop-blur-md p-8 relative">
          {/* Уголки */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyber-neon"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyber-neon"></div>

          <form onSubmit={handleAuth} className="space-y-6">
            
            {/* Имя пользователя (только при регистрации) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs text-cyber-neon uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Codename
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-neon focus:outline-none transition-colors font-orbitron"
                  placeholder="USER_01"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs text-cyber-neon uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} /> Net Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-neon focus:outline-none transition-colors font-mono text-sm"
                placeholder="user@nexus.net"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs text-cyber-neon uppercase tracking-widest flex items-center gap-2">
                <Key size={12} /> Access Key
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-neon focus:outline-none transition-colors font-mono"
                placeholder="••••••••"
              />
            </div>

            {/* Ошибка */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 flex items-start gap-3 text-red-400 text-sm">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Кнопка действия */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-orbitron font-bold py-3 hover:bg-cyber-neon hover:text-black transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? "PROCESSING..." : (isLogin ? "ESTABLISH CONNECTION" : "INITIATE PROTOCOL")}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Переключатель режимов */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
            >
              {isLogin ? "[ Create New Identity ]" : "[ Access Existing Node ]"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
            <Link href="/" className="text-cyber-neon/50 hover:text-cyber-neon text-xs font-mono transition-colors">
                &lt; RETURN TO MARKET
            </Link>
        </div>
      </div>
    </main>
  );
}