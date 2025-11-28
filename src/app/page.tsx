"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import Tilt from "react-parallax-tilt";
import { Wallet, Clock, Activity, User, LogOut, Box, Github, Terminal, Mail, Code2 } from "lucide-react"; 
import { supabase } from "@/lib/supabase";

// Типы данных
type Item = {
  id: number;
  name: string;
  type: string;
  price: number;
  rarity: string;
  image_url: string;
  secondsLeft?: string;
};

type UserProfile = {
  username: string;
  credits: number;
};

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- USER STATE ---
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // 1. ЗАГРУЗКА ДАННЫХ И ПОЛЬЗОВАТЕЛЯ
  useEffect(() => {
    setMounted(true);
    
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('id', { ascending: true });

        if (data) {
          const itemsWithTimer = data.map((item) => ({
            ...item,
            secondsLeft: Math.floor(Math.random() * 60).toString().padStart(2, '0')
          }));
          setItems(itemsWithTimer);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, credits')
          .eq('id', user.id)
          .single();
        
        if (profile) setProfile(profile);
      }
    };

    fetchItems();
    checkUser();
  }, []);

  // 2. СИМУЛЯЦИЯ РЫНКА
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prevItems) => 
        prevItems.map((item) => {
          if (Math.random() > 0.7) {
            const change = (Math.random() * 0.05);
            return { ...item, price: item.price + change };
          }
          return item;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.reload(); 
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)] text-yellow-400";
      case "Rare": return "border-cyber-neon/50 shadow-[0_0_15px_rgba(0,243,255,0.3)] text-cyber-neon";
      default: return "border-gray-600/50 text-gray-400";
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen font-rajdhani text-white pb-20">
      {/* --- NAVBAR --- */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-cyber-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/">
            <h1 className="font-orbitron text-2xl tracking-[0.2em] font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-pink cursor-pointer">
              NEXUS
            </h1>
          </Link>
          
          <div className="flex items-center gap-6">
            {user && profile ? (
              <div className="flex items-center gap-6">
                 <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{profile.username}</span>
                    <span className="font-orbitron text-cyber-neon text-lg">{profile.credits.toFixed(2)} CR</span>
                 </div>
                 <div className="h-8 w-px bg-white/20 mx-2"></div>
                 <Link href="/inventory">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs uppercase tracking-widest mr-4 group">
                        <Box size={16} className="group-hover:text-cyber-neon transition-colors"/> The Vault
                    </button>
                 </Link>
                 <div className="h-8 w-px bg-white/20"></div>
                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-xs uppercase tracking-widest"
                 >
                   <LogOut size={16} /> Disconnect
                 </button>
              </div>
            ) : (
              <Link href="/auth">
                <button 
                  className="flex items-center gap-2 px-6 py-2 border border-cyber-neon bg-cyber-neon/10 text-cyber-neon hover:bg-cyber-neon hover:text-black transition-all duration-300 rounded-none uppercase tracking-widest text-sm font-bold"
                >
                  <User size={16} />
                  Connect ID
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-orbitron text-5xl md:text-7xl font-bold mb-2">LIVE MARKETS</h2>
            <p className="text-gray-400 text-lg tracking-wide flex items-center gap-2">
               STATUS: <span className="text-green-400 font-bold">{user ? "ONLINE" : "GUEST MODE"}</span>
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="font-orbitron text-xl">NEXUS DB v1.0</p>
            <p className="text-gray-500">SYNCING...</p>
          </div>
        </div>

        {/* --- GRID --- */}
        {loading ? (
          <div className="flex items-center justify-center h-64 border border-white/10 bg-white/5 animate-pulse">
            <p className="font-orbitron text-cyber-neon tracking-widest">DOWNLOADING ASSETS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item) => (
              <Link href={`/item/${item.id}`} key={item.id} className="block">
                  <Tilt 
                    tiltMaxAngleX={5} 
                    tiltMaxAngleY={5} 
                    perspective={1000} 
                    scale={1.02}
                    className="group h-full"
                  >
                    <div className={`relative h-[450px] bg-cyber-dark/40 border backdrop-blur-sm p-4 flex flex-col justify-between transition-all duration-300 group-hover:bg-cyber-dark/60 group-hover:border-cyber-neon/30 ${getRarityColor(item.rarity).split(' ')[0]}`}>
                      <div className="relative h-1/2 w-full overflow-hidden border border-white/5 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent z-10"/>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-orbitron border bg-black/50 ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </div>
                      </div>
                      <div className="space-y-4 z-20">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{item.type}</p>
                          <h3 className="font-orbitron text-xl leading-tight group-hover:text-white transition-colors">{item.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-red-400 text-sm font-mono bg-red-500/5 px-2 py-1 w-max border border-red-500/20">
                          <Clock size={14} />
                          <span>04:21:{item.secondsLeft}</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Current Bid</p>
                            <div className="flex items-center gap-1">
                              <Activity size={14} className="text-cyber-neon" />
                              <span className="font-orbitron text-xl text-white">{item.price.toFixed(3)} <span className="text-sm text-gray-500">ETH</span></span>
                            </div>
                          </div>
                          <div className="bg-white/10 text-white font-orbitron text-[10px] px-3 py-1 uppercase tracking-widest group-hover:bg-cyber-neon group-hover:text-black transition-colors">
                            View Asset
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tilt>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* --- CREATOR CARD SECTION (НОВОЕ!) --- */}
      <section className="mt-32 px-6 pb-20 max-w-5xl mx-auto">
        <div className="relative group">
           {/* Неоновая подсветка на фоне */}
           <div className="absolute -inset-1 bg-gradient-to-r from-cyber-neon to-cyber-pink rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
           
           <div className="relative bg-cyber-dark/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-xl flex flex-col md:flex-row items-center gap-10">
              
              {/* Левая часть: Фото и статистика */}
              <div className="flex-shrink-0 text-center md:text-left">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0 mb-6 rounded-full p-1 bg-gradient-to-tr from-cyber-neon via-white to-cyber-pink">
                     <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                         {/* Фото создателя (заглушка в стиле хакера) */}
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img 
                           src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=800&auto=format&fit=crop" 
                           alt="Creator" 
                           className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                         />
                         {/* Эффект скан-линии */}
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-neon/20 to-transparent h-2 w-full animate-[scan_2s_linear_infinite] opacity-50 pointer-events-none"></div>
                     </div>
                  </div>

                  {/* Мини-статистика */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white/5 p-2 rounded border border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase">Projects</p>
                          <p className="font-orbitron text-white">12+</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded border border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase">Exp. Years</p>
                          <p className="font-orbitron text-cyber-neon">5+</p>
                      </div>
                  </div>
              </div>

              {/* Правая часть: Информация */}
              <div className="flex-grow space-y-4 text-center md:text-left">
                  <div>
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                          <h3 className="text-3xl font-orbitron font-bold text-white">HYPERKRY DEV</h3>
                          <span className="bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/50 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                            Founder & CEO
                          </span>
                      </div>
                      <p className="text-cyber-neon font-mono text-sm tracking-widest uppercase mb-4">
                        &quot;Building the backbone of digital commerce.&quot;
                      </p>
                  </div>
                  
                  <p className="text-gray-400 leading-relaxed max-w-xl mx-auto md:mx-0">
                    Разработчик Full-Stack с фокусом на FinTech решениях. Объединяю безопасную архитектуру с современным UX/UI дизайном. NEXUS — это результат моего видения идеальной торговой площадки.
                  </p>

                  {/* Стек технологий */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                      {['Next.js', 'Supabase', 'Tailwind', 'TypeScript'].map((tech) => (
                          <span key={tech} className="text-xs border border-white/10 px-3 py-1 rounded-full text-gray-500 hover:border-cyber-neon hover:text-white transition-colors cursor-default">
                              {tech}
                          </span>
                      ))}
                  </div>

                  {/* Кнопки действий */}
                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                      <button className="flex items-center gap-2 bg-white text-black font-orbitron font-bold px-6 py-3 rounded hover:bg-cyber-neon hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all">
                          <Mail size={18}/> CONTACT ME
                      </button>
                      <div className="flex gap-4">
                          <a href="#" className="p-3 border border-white/20 rounded-full hover:bg-white/10 hover:text-cyber-neon transition-colors">
                              <Github size={20}/>
                          </a>
                          <a href="#" className="p-3 border border-white/20 rounded-full hover:bg-white/10 hover:text-cyber-pink transition-colors">
                              <Terminal size={20}/>
                          </a>
                          <a href="#" className="p-3 border border-white/20 rounded-full hover:bg-white/10 hover:text-yellow-400 transition-colors">
                              <Code2 size={20}/>
                          </a>
                      </div>
                  </div>
              </div>

           </div>
        </div>
      </section>

    </main>
  );
}