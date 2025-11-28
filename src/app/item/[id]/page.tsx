"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Добавили useRouter
import Link from "next/link";
import { ArrowLeft, Zap, Activity, Share2, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from "@/lib/supabase";

export default function ItemPage() {
  const params = useParams();
  const router = useRouter(); // Для обновления страницы после покупки
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Статусы: idle, processing, success, error
  const [buyingStatus, setBuyingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  // Фейковый график (пока)
  const fakeHistory = [
    { time: '10:00', price: 2.10 },
    { time: '11:00', price: 2.35 },
    { time: '12:00', price: 2.20 },
    { time: '13:00', price: 2.45 },
    { time: '14:00', price: 2.40 },
    { time: '15:00', price: 2.55 },
  ];

  useEffect(() => {
    const fetchItem = async () => {
      if (!params.id) return;
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (data) {
          setItem({ ...data, history: fakeHistory });
        }
      } catch (error) {
        console.error("Error loading item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [params.id]);

  // --- ЛОГИКА РЕАЛЬНОЙ ПОКУПКИ ---
  const handleBuy = async () => {
    // 1. Проверяем авторизацию
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("ACCESS DENIED. PLEASE LOGIN.");
        router.push("/auth");
        return;
    }

    setBuyingStatus('processing');

    try {
        // 2. Вызываем SQL-функцию на сервере
        const { data, error } = await supabase
            .rpc('buy_item', { 
                item_id: item.id, 
                price: item.price 
            });

        if (error) throw error;

        // 3. Проверяем результат
        if (data.success) {
            setBuyingStatus('success');
            // Обновляем данные на других вкладках/страницах (опционально)
            router.refresh(); 
        } else {
            setBuyingStatus('error');
            setErrorMessage(data.message || "TRANSACTION FAILED");
        }

    } catch (err: any) {
        setBuyingStatus('error');
        setErrorMessage(err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-cyber-neon font-orbitron animate-pulse">DOWNLOADING ASSET DATA...</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center text-red-500 font-orbitron">ERROR 404: ASSET NOT FOUND</div>;

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto font-rajdhani relative">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors uppercase tracking-widest text-xs">
        <ArrowLeft size={16} /> Return to Market
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
            <div className="relative aspect-square border border-cyber-neon/30 bg-cyber-dark/50 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent z-10"/>
                <div className="absolute top-0 left-0 w-full h-1 bg-cyber-neon/50 shadow-[0_0_15px_#00f3ff] animate-[scan_3s_ease-in-out_infinite] z-20 opacity-50"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute bottom-4 left-4 z-20">
                    <span className="bg-black/80 border border-cyber-neon text-cyber-neon px-3 py-1 text-sm font-orbitron tracking-widest">
                        {item.type}
                    </span>
                </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Secure Hash</p>
                    <p className="text-white font-mono text-xs mt-1">SHA-256-ENCRYPTED</p>
                </div>
                <div className="border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Owner</p>
                    <p className="text-cyber-pink font-orbitron text-xs mt-1">SYSTEM</p>
                </div>
                <div className="border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Views</p>
                    <p className="text-white font-orbitron text-xs mt-1">8,402</p>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col h-full">
            <div className="mb-8">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white leading-tight">{item.name}</h1>
                    <button className="p-2 border border-white/20 hover:border-cyber-neon hover:text-cyber-neon transition-colors">
                        <Share2 size={20}/>
                    </button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-0.5 border ${item.rarity === 'Legendary' ? 'border-yellow-500 text-yellow-500' : 'border-cyber-neon text-cyber-neon'}`}>
                        {item.rarity.toUpperCase()}
                    </span>
                    <span className="text-gray-500">ID: #{item.id.toString().padStart(4, '0')}</span>
                </div>
            </div>

            <div className="bg-cyber-glass border border-white/10 p-6 mb-8 backdrop-blur-md relative overflow-hidden">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Current Market Value</p>
                <div className="flex items-end gap-4 mb-6">
                    <span className="text-5xl font-orbitron text-cyber-neon">{item.price.toFixed(3)} ETH</span>
                    <span className="text-green-400 mb-2 text-sm flex items-center gap-1">
                        <Activity size={14}/> +2.4%
                    </span>
                </div>
                
                <button 
                    onClick={handleBuy}
                    disabled={buyingStatus === 'processing' || buyingStatus === 'success'}
                    className="w-full py-4 bg-white text-black font-orbitron font-bold text-lg hover:bg-cyber-neon hover:text-black transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {buyingStatus === 'idle' || buyingStatus === 'error' ? 'ACQUIRE ASSET' : 'PROCESSING...'}
                </button>
            </div>

            <div className="mb-8">
                <h3 className="font-orbitron text-lg mb-2 flex items-center gap-2">
                    <Zap size={16} className="text-cyber-pink"/> ASSET_LORE
                </h3>
                <p className="text-gray-400 leading-relaxed border-l-2 border-cyber-pink/30 pl-4">
                    {item.description}
                </p>
            </div>

            {/* CHART */}
            <div className="flex-grow min-h-[200px] border border-white/10 p-4 bg-black/40 relative">
                 <p className="absolute top-2 left-4 text-[10px] text-gray-500 uppercase z-10">Price History (24h)</p>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: '#050507', borderColor: '#333', color: '#fff' }} itemStyle={{ color: '#00f3ff' }} />
                        <Line type="monotone" dataKey="price" stroke="#00f3ff" strokeWidth={2} dot={{ fill: '#050507', stroke: '#00f3ff', r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* MODAL */}
      {buyingStatus !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="w-full max-w-md bg-cyber-black border border-white/20 p-8 relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-neon"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-neon"></div>

                {buyingStatus === 'processing' && (
                    <div className="text-center space-y-6">
                        <Loader2 className="w-12 h-12 text-cyber-neon animate-spin mx-auto"/>
                        <div>
                            <h3 className="text-2xl font-orbitron text-white mb-2">NEURO-LINK ESTABLISHED</h3>
                            <p className="text-gray-400 font-mono text-sm animate-pulse">Verifying Blockchain Signature...</p>
                        </div>
                    </div>
                )}

                {buyingStatus === 'success' && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                            <CheckCircle className="w-8 h-8 text-green-400"/>
                        </div>
                        <div>
                            <h3 className="text-2xl font-orbitron text-white mb-2">TRANSACTION COMPLETE</h3>
                            <p className="text-gray-400 text-sm">Asset added to The Vault. Credits deducted.</p>
                        </div>
                        <button onClick={() => {setBuyingStatus('idle'); router.push('/')}} className="w-full py-3 bg-white/10 hover:bg-white text-white hover:text-black font-orbitron transition-all">RETURN TO MARKET</button>
                    </div>
                )}

                {buyingStatus === 'error' && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/50">
                            <AlertTriangle className="w-8 h-8 text-red-400"/>
                        </div>
                        <div>
                            <h3 className="text-2xl font-orbitron text-white mb-2">TRANSACTION FAILED</h3>
                            <p className="text-red-400 text-sm font-mono">{errorMessage}</p>
                        </div>
                        <button onClick={() => setBuyingStatus('idle')} className="w-full py-3 bg-white/10 hover:bg-red-500 text-white font-orbitron transition-all">CLOSE TERMINAL</button>
                    </div>
                )}
            </div>
        </div>
      )}
    </main>
  );
}