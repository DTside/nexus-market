"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Box, Calendar, ShieldCheck, Download, Lock } from "lucide-react";

export default function InventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Проверяем авторизацию
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // 2. Загружаем транзакции + данные о предметах (JOIN)
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          items (*)
        `)
        .order('purchased_at', { ascending: false });

      if (error) {
        console.error("Error fetching inventory:", error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  return (
    <main className="min-h-screen bg-cyber-black font-rajdhani relative text-white pb-20">
      {/* Фоновый шум */}
      <div className="fixed inset-0 z-0 bg-noise opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-cyber-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/">
             <h1 className="font-orbitron text-2xl tracking-[0.2em] font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-pink cursor-pointer">
              NEXUS
            </h1>
          </Link>
          <div className="flex items-center gap-2 text-cyber-neon border border-cyber-neon/30 bg-cyber-neon/5 px-4 py-1 rounded-full">
            <Lock size={14} />
            <span className="text-xs uppercase tracking-widest font-bold">Secure Vault Access</span>
          </div>
        </div>
      </header>

      <div className="pt-32 px-6 max-w-7xl mx-auto relative z-10">
        
        {/* Title Section */}
        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
            <div>
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-4 transition-colors uppercase tracking-widest text-xs">
                    <ArrowLeft size={16} /> Return to Market
                </Link>
                <h2 className="font-orbitron text-4xl md:text-5xl text-white">MY ASSETS</h2>
            </div>
            <div className="text-right hidden md:block">
                <p className="text-gray-500 text-sm">TOTAL ITEMS</p>
                <p className="font-orbitron text-3xl text-cyber-neon">{transactions.length.toString().padStart(2, '0')}</p>
            </div>
        </div>

        {/* --- LOADING STATE --- */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1,2,3].map(i => (
                    <div key={i} className="h-64 bg-white/5 border border-white/10"></div>
                ))}
            </div>
        ) : transactions.length === 0 ? (
            // --- EMPTY STATE ---
            <div className="text-center py-20 border border-white/10 border-dashed bg-white/5">
                <Box size={48} className="mx-auto text-gray-600 mb-4"/>
                <h3 className="font-orbitron text-xl text-gray-400">VAULT IS EMPTY</h3>
                <p className="text-gray-600 mb-6">No digital assets found on your signature.</p>
                <Link href="/">
                    <button className="px-8 py-3 bg-cyber-neon text-black font-bold font-orbitron hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all">
                        BROWSE MARKET
                    </button>
                </Link>
            </div>
        ) : (
            // --- INVENTORY GRID ---
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transactions.map((tx) => (
                    <div key={tx.id} className="bg-cyber-dark border border-white/10 hover:border-cyber-neon/50 transition-all group relative overflow-hidden">
                        
                        {/* Картинка */}
                        <div className="h-48 overflow-hidden relative border-b border-white/10">
                            <div className="absolute inset-0 bg-cyber-pink/10 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={tx.items.image_url} 
                                alt={tx.items.name} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                            <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 border border-white/20 text-[10px] uppercase font-bold text-cyber-neon">
                                Owned
                            </div>
                        </div>

                        {/* Инфо */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{tx.items.type}</p>
                                    <h3 className="font-orbitron text-lg text-white truncate">{tx.items.name}</h3>
                                </div>
                                {tx.items.rarity === 'Legendary' && <ShieldCheck size={18} className="text-yellow-500"/>}
                            </div>

                            {/* Детали покупки */}
                            <div className="space-y-2 border-t border-white/5 pt-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 flex items-center gap-1"><Calendar size={12}/> Acquired</span>
                                    <span className="font-mono text-gray-300">
                                        {new Date(tx.purchased_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Purchase Price</span>
                                    <span className="font-mono text-cyber-neon">{tx.price_at_purchase} ETH</span>
                                </div>
                            </div>

                            {/* Кнопка "Скачать" (Фейк функционал) */}
                            <button className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white py-2 text-xs font-orbitron tracking-widest flex items-center justify-center gap-2 transition-colors">
                                <Download size={14}/> DECRYPT & DOWNLOAD
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </main>
  );
}